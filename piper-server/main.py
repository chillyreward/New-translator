"""
Piper TTS FastAPI server
Run: uvicorn main:app --host 0.0.0.0 --port 5002
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import subprocess
import tempfile
import os

app = FastAPI()

# Path to your downloaded .onnx voice model
VOICE_MODEL = os.getenv("PIPER_VOICE", "./sw_KE-low.onnx")


class TTSRequest(BaseModel):
    text: str


@app.post("/synthesize")
async def synthesize(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

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

        return Response(content=audio_bytes, media_type="audio/wav")

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/health")
async def health():
    return {"status": "ok", "model": VOICE_MODEL}
