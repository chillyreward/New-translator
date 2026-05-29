"""
Meta MMS-TTS Local Server — Kikuyu (kik)
Model: facebook/mms-tts-kik
Trained natively on Kikuyu — best pronunciation quality.

Setup:
    cd mms-server
    python -m venv venv
    venv\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Server runs on http://localhost:5004
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import torch
import io
import hashlib
import os
import soundfile as sf

app = FastAPI(title="Meta MMS-TTS Kikuyu Server")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR  = os.path.join(SCRIPT_DIR, ".wav-cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# ── Load model ────────────────────────────────────────────────────────────────
print("Loading facebook/mms-tts-kik model...")
print("(First run downloads ~500MB — cached after that)")

from transformers import VitsModel, AutoTokenizer

MODEL_ID  = "facebook/mms-tts-kik"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model     = VitsModel.from_pretrained(MODEL_ID)
model.eval()

device = "cuda" if torch.cuda.is_available() else "cpu"
model  = model.to(device)

print(f"Model loaded on {device}")


# ── Cache helpers ─────────────────────────────────────────────────────────────
def get_cache_path(text: str) -> str:
    key = hashlib.sha256(text.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{key}.wav")


# ── Request model ─────────────────────────────────────────────────────────────
class SynthRequest(BaseModel):
    text: str


# ── Routes ────────────────────────────────────────────────────────────────────
@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    cache_path = get_cache_path(req.text)
    if os.path.exists(cache_path):
        print(f"[Cache HIT] {req.text[:50]}")
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    print(f"[Synthesizing] {req.text[:80]}...")
    try:
        inputs = tokenizer(req.text, return_tensors="pt").to(device)

        with torch.no_grad():
            output = model(**inputs)

        # output.waveform shape: (1, samples)
        wav = output.waveform[0].cpu().numpy()
        sample_rate = model.config.sampling_rate

        buf = io.BytesIO()
        sf.write(buf, wav, sample_rate, format="WAV", subtype="PCM_16")
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
        "model": MODEL_ID,
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
    uvicorn.run(app, host="0.0.0.0", port=5004)
