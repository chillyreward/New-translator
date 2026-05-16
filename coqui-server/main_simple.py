"""
Simple Kikuyu Voice Server — no TTS model needed.
Serves pre-recorded WAV files directly.
For phrases not in the library, returns 404 so the app falls back to OpenAI TTS.
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, FileResponse
from pydantic import BaseModel
import os
import hashlib

app = FastAPI(title="Kikuyu Voice Server")

SAMPLES_DIR = os.getenv("SAMPLES_DIR", "./speaker_samples")
CACHE_DIR = os.getenv("CACHE_DIR", "./cache")

os.makedirs(CACHE_DIR, exist_ok=True)

# Build lookup map: normalized phrase → wav file path
phrase_map: dict[str, str] = {}

def normalize(text: str) -> str:
    return text.lower().strip().rstrip(".,!?")

# Load all WAV files from samples dir
if os.path.exists(SAMPLES_DIR):
    for filename in os.listdir(SAMPLES_DIR):
        if filename.endswith(".wav"):
            phrase = normalize(filename.replace(".wav", ""))
            phrase_map[phrase] = os.path.join(SAMPLES_DIR, filename)

print(f"Loaded {len(phrase_map)} pre-recorded phrases")


class SynthRequest(BaseModel):
    text: str
    language: str = "en"


@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    key = normalize(req.text)

    # Check if we have a pre-recorded file
    if key in phrase_map:
        wav_path = phrase_map[key]
        print(f"[Serving] {key}")
        with open(wav_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    # Not found — let the app fall back to OpenAI TTS
    raise HTTPException(
        status_code=404,
        detail=f"No recording found for: {req.text}"
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "phrases_available": len(phrase_map),
        "samples_dir": SAMPLES_DIR,
        "mode": "pre-recorded"
    }


@app.get("/phrases")
async def list_phrases():
    return {"phrases": sorted(phrase_map.keys())}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003)
