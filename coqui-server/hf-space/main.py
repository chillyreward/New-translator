"""
Coqui XTTS v2 Voice Cloning Server
Deployed on Hugging Face Spaces
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import torch
import os
import hashlib
import io
import soundfile as sf

app = FastAPI(title="Kikuyu Voice Server")

SPEAKER_WAV = os.getenv("SPEAKER_WAV", "./speaker_samples/voice-training-1.wav")
CACHE_DIR = os.getenv("CACHE_DIR", "./cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Load all speaker samples
SAMPLES_DIR = "./speaker_samples"
SPEAKER_WAVS = []
if os.path.exists(SAMPLES_DIR):
    SPEAKER_WAVS = [
        os.path.join(SAMPLES_DIR, f)
        for f in os.listdir(SAMPLES_DIR)
        if f.endswith(".wav")
    ]

if not SPEAKER_WAVS and os.path.exists(SPEAKER_WAV):
    SPEAKER_WAVS = [SPEAKER_WAV]

print(f"Loaded {len(SPEAKER_WAVS)} speaker samples")

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
    language: str = "en"


@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    cache_path = get_cache_path(req.text, req.language)
    if os.path.exists(cache_path):
        print(f"[Cache HIT] {req.text[:40]}")
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    print(f"[Synthesizing] {req.text[:40]}...")
    try:
        wav = tts.tts(
            text=req.text,
            speaker_wav=SPEAKER_WAVS,
            language=req.language,
        )
        buf = io.BytesIO()
        sf.write(buf, wav, 24000, format="WAV", subtype="PCM_16")
        buf.seek(0)
        audio_bytes = buf.read()

        with open(cache_path, "wb") as f:
            f.write(audio_bytes)

        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "speaker_samples": len(SPEAKER_WAVS),
        "device": device,
        "cached_phrases": len([f for f in os.listdir(CACHE_DIR) if f.endswith(".wav")])
    }


@app.get("/")
async def root():
    return {"message": "Kikuyu Voice Server is running", "docs": "/docs"}
