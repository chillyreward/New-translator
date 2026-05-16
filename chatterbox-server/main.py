"""
Chatterbox TTS Voice Cloning Server
Uses your WAV chunks as voice reference for cloning.

Setup:
    cd chatterbox-server
    python -m venv venv311
    venv311\\Scripts\\activate
    pip install chatterbox-tts fastapi uvicorn soundfile
    python main.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import os
import hashlib
import io
import soundfile as sf
import torch

app = FastAPI(title="Chatterbox TTS Kikuyu Voice Server")

CACHE_DIR = os.getenv("CACHE_DIR", "../public/audio/cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Load best speaker reference WAVs from chunks
_CHUNKS_DIR = "../public/audio/chunks"
_MAIN_SAMPLE = "../public/audio/voice-training-1.wav"

# Pick the best reference — longer phrases work better for voice cloning
PREFERRED_REFS = [
    "that girl has nice cheeks.wav",
    "i will slap you.wav",
    "come into the house.wav",
    "stop laughing.wav",
    "thank you so much.wav",
    "i will call you.wav",
    "i am going to the hospital.wav",
    "how are you.wav",
    "i love you.wav",
    "help me.wav",
]

def get_reference_wav() -> str:
    """Return the best available reference WAV for voice cloning."""
    # Try main training file first
    if os.path.exists(_MAIN_SAMPLE):
        return _MAIN_SAMPLE
    # Fall back to preferred chunks
    for fname in PREFERRED_REFS:
        path = os.path.join(_CHUNKS_DIR, fname)
        if os.path.exists(path):
            return path
    # Last resort: any chunk
    if os.path.exists(_CHUNKS_DIR):
        wavs = [f for f in os.listdir(_CHUNKS_DIR) if f.endswith(".wav")]
        if wavs:
            return os.path.join(_CHUNKS_DIR, wavs[0])
    raise RuntimeError("No reference WAV found")

print("Loading Chatterbox TTS model...")
from chatterbox.tts import ChatterboxTTS

device = "cuda" if torch.cuda.is_available() else "cpu"
model = ChatterboxTTS.from_pretrained(device=device)
reference_wav = get_reference_wav()
print(f"Model loaded on {device}")
print(f"Reference voice: {reference_wav}")


def get_cache_path(text: str) -> str:
    key = hashlib.md5(text.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"cb_{key}.wav")


class SynthRequest(BaseModel):
    text: str
    language: str = "en"


@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    cache_path = get_cache_path(req.text)
    if os.path.exists(cache_path):
        print(f"[Cache HIT] {req.text[:40]}")
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    print(f"[Synthesizing] {req.text[:40]}...")
    try:
        wav = model.generate(
            req.text,
            audio_prompt_path=reference_wav,
            exaggeration=0.3,   # 0=neutral, 1=expressive
            cfg_weight=0.5,     # voice similarity weight
        )

        buf = io.BytesIO()
        sf.write(buf, wav.squeeze().numpy(), model.sr, format="WAV")
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
        "engine": "chatterbox-tts",
        "reference_wav": reference_wav,
        "device": device,
        "cached_phrases": cache_count,
    }


@app.delete("/cache")
async def clear_cache():
    cleared = 0
    for f in os.listdir(CACHE_DIR):
        if f.startswith("cb_") and f.endswith(".wav"):
            os.remove(os.path.join(CACHE_DIR, f))
            cleared += 1
    return {"cleared": cleared}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003)
