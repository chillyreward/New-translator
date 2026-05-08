"""
Coqui XTTS v2 Voice Cloning Server with audio caching.
Generated audio is cached to disk — repeat phrases are instant.

Setup:
    pip install -r requirements.txt
    python main.py
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

SPEAKER_WAV = os.getenv("SPEAKER_WAV", "../public/audio/voice-training-1.wav")

# Use multiple samples for better voice cloning
SPEAKER_WAVS = [
    "../public/audio/voice-training-1.wav",
    "dataset/chunks/how are you.wav",
    "dataset/chunks/thank you.wav",
    "dataset/chunks/come here.wav",
    "dataset/chunks/i love you.wav",
    "dataset/chunks/help me.wav",
]
# Filter to only existing files
SPEAKER_WAVS = [w for w in SPEAKER_WAVS if os.path.exists(w)]
if not SPEAKER_WAVS:
    SPEAKER_WAVS = [SPEAKER_WAV]
LANGUAGE    = os.getenv("LANGUAGE", "en")
CACHE_DIR   = os.getenv("CACHE_DIR", "../public/audio/cache")

# Create cache directory
os.makedirs(CACHE_DIR, exist_ok=True)

print("Loading XTTS v2 model...")
from TTS.api import TTS

device = "cuda" if torch.cuda.is_available() else "cpu"
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
print(f"Model loaded on {device}")


def get_cache_path(text: str, language: str) -> str:
    key = hashlib.md5(f"{text}:{language}".encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{key}.wav")


class SynthRequest(BaseModel):
    text: str
    language: str = LANGUAGE


@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    if not os.path.exists(SPEAKER_WAV):
        raise HTTPException(status_code=500, detail=f"Speaker WAV not found: {SPEAKER_WAV}")

    # Check cache first
    cache_path = get_cache_path(req.text, req.language)
    if os.path.exists(cache_path):
        print(f"[Cache HIT] {req.text[:40]}")
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    print(f"[Synthesizing] {req.text[:40]}...")
    try:
        wav = tts.tts(
            text=req.text,
            speaker_wav=SPEAKER_WAVS,  # list of samples = better clone
            language=req.language,
        )

        buf = io.BytesIO()
        sf.write(buf, wav, 16000, format="WAV", subtype="PCM_16")  # 16kHz, mono, 16-bit
        buf.seek(0)
        audio_bytes = buf.read()

        # Save to cache
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
        "speaker_wav": SPEAKER_WAV,
        "speaker_exists": os.path.exists(SPEAKER_WAV),
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
