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
import re
import hashlib
import os
import numpy as np
import soundfile as sf

app = FastAPI(title="Meta MMS-TTS Kikuyu Server")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR  = os.path.join(SCRIPT_DIR, ".wav-cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# ── Load model ────────────────────────────────────────────────────────────────
from transformers import VitsModel, AutoTokenizer

MODEL_ID  = "gateremark/kikuyu-tts-v1"

print(f"Loading {MODEL_ID} model...")
print("(First run downloads model — cached after that)")

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model     = VitsModel.from_pretrained(MODEL_ID)
model.eval()

device = "cuda" if torch.cuda.is_available() else "cpu"
model  = model.to(device)

print(f"Model loaded on {device}")


# ── Chunking helpers ──────────────────────────────────────────────────────────
# MMS/VITS degrades on long inputs — split into short sentences first.
# Max ~100 chars per chunk for best quality.
MAX_CHUNK_CHARS = 100

def split_into_chunks(text: str) -> list[str]:
    """
    Split text into short chunks at sentence boundaries.
    Falls back to comma/clause splits if sentences are still too long.
    """
    # Split on sentence-ending punctuation
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks = []
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if len(sentence) <= MAX_CHUNK_CHARS:
            chunks.append(sentence)
        else:
            # Further split on commas or semicolons
            sub = re.split(r'(?<=[,;])\s+', sentence)
            current = ""
            for part in sub:
                if len(current) + len(part) + 1 <= MAX_CHUNK_CHARS:
                    current = (current + " " + part).strip() if current else part
                else:
                    if current:
                        chunks.append(current)
                    # If single part still too long, split on word boundary
                    if len(part) > MAX_CHUNK_CHARS:
                        words = part.split()
                        current = ""
                        for word in words:
                            if len(current) + len(word) + 1 <= MAX_CHUNK_CHARS:
                                current = (current + " " + word).strip() if current else word
                            else:
                                if current:
                                    chunks.append(current)
                                current = word
                        if current:
                            chunks.append(current)
                        current = ""
                    else:
                        current = part
            if current:
                chunks.append(current)
    return [c for c in chunks if c.strip()]


def synthesize_chunk(text: str) -> np.ndarray:
    """Synthesize a single short chunk, return numpy waveform array."""
    inputs = tokenizer(text, return_tensors="pt").to(device)
    with torch.no_grad():
        output = model(**inputs)
    return output.waveform[0].cpu().numpy()


def add_silence(sample_rate: int, duration_ms: int = 200) -> np.ndarray:
    """Return a short silence array to insert between chunks."""
    samples = int(sample_rate * duration_ms / 1000)
    return np.zeros(samples, dtype=np.float32)


# ── Pronunciation normalizer ──────────────────────────────────────────────────
def normalize_pronunciation(text: str) -> str:
    """
    Prepare Kikuyu text for natural TTS output.

    - Expands common abbreviations
    - Ensures sentence-ending punctuation so the model knows where to pause
    - Normalizes diacritics spacing
    - Slows down number reading by spacing digits
    - Removes characters the tokenizer can't handle
    - Adds a comma pause after conjunctions for more natural rhythm
    """
    # Strip leading/trailing whitespace
    text = text.strip()

    # Normalize multiple spaces
    text = re.sub(r'  +', ' ', text)

    # Ensure sentences end with punctuation so chunker splits correctly
    if text and text[-1] not in '.!?,;:':
        text += '.'

    # Add natural pause after common Kikuyu conjunctions/connectors
    # These words often run together making speech rushed
    conjunctions = ['na', 'nĩ', 'no', 'to', 'tũ', 'mũ', 'nĩguo', 'nĩ ũndũ']
    for conj in conjunctions:
        # Add comma after conjunction when it appears mid-sentence before a phrase
        text = re.sub(rf'\b({conj})\b(?=\s+[A-ZĨŨ])', rf'\1,', text)

    # Normalize diacritics — ensure ĩ and ũ are proper Unicode (NFD → NFC)
    import unicodedata
    text = unicodedata.normalize('NFC', text)

    # Remove unsupported characters (keep Kikuyu alphabet + punctuation)
    # Kikuyu uses: a e g h i ĩ k m n o r t u ũ w y and their capitals
    text = re.sub(r'[^\w\s\.,!?\-;:\'ĩũĨŨãÃ]', '', text, flags=re.UNICODE)

    # Normalize whitespace again after replacements
    text = re.sub(r'  +', ' ', text).strip()

    return text


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
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    # Normalize pronunciation before synthesis
    text = normalize_pronunciation(text)
    print(f"[Normalized] {text[:80]}")

    # Check cache (keyed on normalized text)
    cache_path = get_cache_path(text)
    if os.path.exists(cache_path):
        print(f"[Cache HIT] {text[:50]}")
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    try:
        chunks = split_into_chunks(text)
        print(f"[Synthesizing] {len(chunks)} chunk(s) from: {text[:80]}...")

        sample_rate = model.config.sampling_rate
        audio_parts = []

        for i, chunk in enumerate(chunks):
            print(f"  Chunk {i+1}/{len(chunks)}: '{chunk[:60]}'")
            wav = synthesize_chunk(chunk)
            audio_parts.append(wav)
            # Add a short pause between chunks (not after the last one)
            if i < len(chunks) - 1:
                audio_parts.append(add_silence(sample_rate, duration_ms=180))

        # Concatenate all chunks into one waveform
        full_wav = np.concatenate(audio_parts)

        buf = io.BytesIO()
        sf.write(buf, full_wav, sample_rate, format="WAV", subtype="PCM_16")
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
        "max_chunk_chars": MAX_CHUNK_CHARS,
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
