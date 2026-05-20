"""
Piper TTS FastAPI server
Run: uvicorn main:app --host 0.0.0.0 --port 5002
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import subprocess
import tempfile
import hashlib
import os

app = FastAPI()

# Path to your downloaded .onnx voice model
VOICE_MODEL = os.getenv("PIPER_VOICE", "./sw_KE-low.onnx")

# Hidden WAV cache directory — dot-prefixed so it's hidden on Unix/macOS
CACHE_DIR = os.path.join(os.path.dirname(__file__), ".wav-cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def _cache_path(text: str) -> str:
    """Return the cache file path for a given text input."""
    key = hashlib.sha256(f"{VOICE_MODEL}:{text}".encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{key}.wav")


class TTSRequest(BaseModel):
    text: str


@app.post("/synthesize")
async def synthesize(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    cached = _cache_path(req.text)

    # Serve from cache if available
    if os.path.exists(cached):
        with open(cached, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            ["piper", "--model", VOICE_MODEL, "--output_file", tmp_path],
            input=req.text.encode(),
            capture_output=True,
            timeout=30,
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Piper error: {result.stderr.decode()}"
            )

        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()

        # Persist to cache
        with open(cached, "wb") as f:
            f.write(audio_bytes)

        return Response(content=audio_bytes, media_type="audio/wav")

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/health")
async def health():
    return {"status": "ok", "model": VOICE_MODEL}
