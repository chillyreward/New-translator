"""
Helsinki-NLP English→Kikuyu Translation Server
Model: Helsinki-NLP/opus-mt-en-kik
Fine-tuned specifically for English to Kikuyu translation.

Setup:
    cd helsinki-server
    python -m venv venv
    venv\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Server runs on http://localhost:5005
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import hashlib
import os
import json

app = FastAPI(title="Helsinki-NLP English→Kikuyu Translation Server")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_FILE  = os.path.join(SCRIPT_DIR, ".translation-cache.json")

# ── Load cache ────────────────────────────────────────────────────────────────
def load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_cache(cache: dict):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

translation_cache = load_cache()

# ── Load model ────────────────────────────────────────────────────────────────
print("Loading Helsinki-NLP/opus-mt-en-kik model...")
print("(First run downloads ~300MB — cached after that)")

from transformers import MarianMTModel, MarianTokenizer

MODEL_ID  = "Helsinki-NLP/opus-mt-en-kik"
tokenizer = MarianTokenizer.from_pretrained(MODEL_ID)
model     = MarianMTModel.from_pretrained(MODEL_ID)
model.eval()

print("Model loaded successfully")


# ── Request model ─────────────────────────────────────────────────────────────
class TranslateRequest(BaseModel):
    text: str


# ── Routes ────────────────────────────────────────────────────────────────────
@app.post("/translate")
async def translate(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    # Check cache
    cache_key = hashlib.sha256(req.text.encode()).hexdigest()
    if cache_key in translation_cache:
        print(f"[Cache HIT] {req.text[:50]}")
        return JSONResponse({"translation": translation_cache[cache_key], "cached": True})

    print(f"[Translating] {req.text[:80]}...")
    try:
        inputs = tokenizer(req.text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        translated = model.generate(**inputs, num_beams=4, early_stopping=True)
        result = tokenizer.decode(translated[0], skip_special_tokens=True)

        # Save to cache
        translation_cache[cache_key] = result
        save_cache(translation_cache)
        print(f"[Result] {result}")

        return JSONResponse({"translation": result})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "cached_translations": len(translation_cache),
    }


@app.delete("/cache")
async def clear_cache():
    global translation_cache
    count = len(translation_cache)
    translation_cache = {}
    save_cache(translation_cache)
    return {"cleared": count}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005)
