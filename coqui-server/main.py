"""
Coqui XTTS v2 Voice Cloning Server with audio caching.
Loads a fine-tuned model from ./output/ if available, otherwise uses the
base XTTS v2 model with your speaker WAV samples for zero-shot cloning.

Setup:
    pip install -r requirements.txt
    python main.py

To use a fine-tuned model first run:
    python train.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import torch
import os
import hashlib
import io
import soundfile as sf

app = FastAPI(title="XTTS v2 Kikuyu Voice Server")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Speaker reference WAVs (used for zero-shot cloning) ──────────────────────
_CHUNKS_DIR  = os.path.join(SCRIPT_DIR, "..", "public", "audio", "chunks")
_MAIN_SAMPLE = os.path.join(SCRIPT_DIR, "..", "public", "audio", "voice-training-1.wav")

SPEAKER_WAVS = []
if os.path.exists(_MAIN_SAMPLE):
    SPEAKER_WAVS.append(_MAIN_SAMPLE)
if os.path.isdir(_CHUNKS_DIR):
    SPEAKER_WAVS += [
        os.path.join(_CHUNKS_DIR, f)
        for f in os.listdir(_CHUNKS_DIR)
        if f.endswith(".wav")
    ]
SPEAKER_WAVS = [w for w in SPEAKER_WAVS if os.path.exists(w)]

if not SPEAKER_WAVS:
    raise RuntimeError("No speaker WAV files found. Add WAVs to public/audio/chunks/")

print(f"Loaded {len(SPEAKER_WAVS)} speaker samples for voice cloning")

# ── Language & cache ──────────────────────────────────────────────────────────
LANGUAGE  = os.getenv("LANGUAGE", "en")
CACHE_DIR = os.getenv("CACHE_DIR", os.path.join(SCRIPT_DIR, "..", "public", "audio", "cache"))
os.makedirs(CACHE_DIR, exist_ok=True)

# ── Load model ────────────────────────────────────────────────────────────────
FINE_TUNED_CHECKPOINT = os.getenv(
    "FINE_TUNED_MODEL",
    os.path.join(SCRIPT_DIR, "output", "best_model.pth"),
)

print("Loading XTTS v2 model...")
from TTS.api import TTS

device = "cuda" if torch.cuda.is_available() else "cpu"

if os.path.exists(FINE_TUNED_CHECKPOINT):
    # Load fine-tuned model
    print(f"  → Using fine-tuned model: {FINE_TUNED_CHECKPOINT}")
    from TTS.tts.configs.xtts_config import XttsConfig
    from TTS.tts.models.xtts import Xtts

    config = XttsConfig()
    config_path = os.path.join(os.path.dirname(FINE_TUNED_CHECKPOINT), "config.json")
    if os.path.exists(config_path):
        config.load_json(config_path)

    tts_model = Xtts.init_from_config(config)
    tts_model.load_checkpoint(
        config,
        checkpoint_path=FINE_TUNED_CHECKPOINT,
        eval=True,
    )
    tts_model.to(device)
    USE_FINE_TUNED = True
else:
    # Fall back to base XTTS v2 (zero-shot voice cloning)
    print("  → No fine-tuned model found. Using base XTTS v2 (zero-shot cloning).")
    print("     Run python train.py to fine-tune on your Kikuyu data.")
    tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
    USE_FINE_TUNED = False

print(f"Model loaded on {device}")


# ── Cache helpers ─────────────────────────────────────────────────────────────
def get_cache_path(text: str, language: str) -> str:
    prefix = "ft" if USE_FINE_TUNED else "zs"
    key = hashlib.sha256(f"{prefix}:{language}:{text}".encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{key}.wav")


# ── Request model ─────────────────────────────────────────────────────────────
class SynthRequest(BaseModel):
    text: str
    language: str = LANGUAGE


# ── Routes ────────────────────────────────────────────────────────────────────
@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    cache_path = get_cache_path(req.text, req.language)
    if os.path.exists(cache_path):
        print(f"[Cache HIT] {req.text[:50]}")
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    print(f"[Synthesizing] {req.text[:50]}...")
    try:
        if USE_FINE_TUNED:
            # Fine-tuned model inference
            gpt_cond_latent, speaker_embedding = tts_model.get_conditioning_latents(
                audio_path=SPEAKER_WAVS[:3]   # use up to 3 reference clips
            )
            out = tts_model.inference(
                req.text,
                req.language,
                gpt_cond_latent,
                speaker_embedding,
                temperature=0.7,
            )
            wav = out["wav"]
            sample_rate = tts_model.config.audio.output_sample_rate
        else:
            # Zero-shot cloning via TTS API
            wav = tts_model.tts(
                text=req.text,
                speaker_wav=SPEAKER_WAVS,
                language=req.language,
            )
            sample_rate = 24000

        buf = io.BytesIO()
        sf.write(buf, wav, sample_rate, format="WAV", subtype="PCM_16")
        buf.seek(0)
        audio_bytes = buf.read()

        with open(cache_path, "wb") as f:
            f.write(audio_bytes)
        print(f"[Cached] {cache_path}")

        return Response(content=audio_bytes, media_type="audio/wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    cache_count = len([f for f in os.listdir(CACHE_DIR) if f.endswith(".wav")])
    return {
        "status": "ok",
        "mode": "fine-tuned" if USE_FINE_TUNED else "zero-shot",
        "fine_tuned_model": FINE_TUNED_CHECKPOINT if USE_FINE_TUNED else None,
        "speaker_samples": len(SPEAKER_WAVS),
        "device": device,
        "cached_phrases": cache_count,
    }


@app.delete("/cache")
async def clear_cache():
    cleared = 0
    for f in os.listdir(CACHE_DIR):
        if f.endswith(".wav"):
            os.remove(os.path.join(CACHE_DIR, f))
            cleared += 1
    return {"cleared": cleared}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003)
