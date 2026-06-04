"""
Kikuyu TranslateGemma — HuggingFace Inference API proxy
Model: gateremark/kikuyu_translategemma_12b_merged_V2

No local GPU needed — calls HF Inference API using your HF token.
Free tier: ~1000 requests/day. Upgrade at huggingface.co/pricing.

Setup:
    cd gemma-translate-server
    python -m venv venv
    venv\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Server runs on http://localhost:5006
Requires: HF_TOKEN environment variable (from .env.local or system env)
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import hashlib
import os
import json
import requests

app = FastAPI(title="Kikuyu TranslateGemma API Proxy")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_FILE  = os.path.join(SCRIPT_DIR, ".translation-cache.json")

MODEL_ID   = "gateremark/kikuyu_translategemma_12b_merged_V2"
HF_API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}/v1/chat/completions"

# ── Translation cache ─────────────────────────────────────────────────────────
def load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_cache(cache: dict):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

translation_cache = load_cache()

# ── Check HF token ────────────────────────────────────────────────────────────
HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
if not HF_TOKEN:
    print("[WARN] No HF_TOKEN found. Set HUGGINGFACE_API_KEY in your environment.")
    print("       Get a token at: https://huggingface.co/settings/tokens")
else:
    print(f"✓ HF token loaded")

print(f"✓ Using model: {MODEL_ID} via HuggingFace Inference API")
print(f"✓ Server starting on http://localhost:5006")


# ── Translation function ──────────────────────────────────────────────────────
def translate_via_hf_api(text: str, source_lang: str = "en") -> str:
    """Call HF Inference API with the TranslateGemma chat template."""
    if not HF_TOKEN:
        raise ValueError("HF_TOKEN not set. Add HUGGINGFACE_API_KEY to your .env.local")

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
    }

    # Use simple text prompt — the custom content type isn't supported via Inference API
    src = "Kiswahili" if source_lang == "sw" else "English"
    prompt = f"Translate the following {src} text to Kikuyu. Return only the Kikuyu translation, nothing else.\n\n{text}"

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 256,
            "temperature": 0.3,
            "do_sample": True,
            "return_full_text": False,
        }
    }

    # Use the standard text-generation endpoint
    url = f"https://api-inference.huggingface.co/models/{MODEL_ID}"
    response = requests.post(url, headers=headers, json=payload, timeout=60)

    print(f"[HF API] status={response.status_code} response={response.text[:200]}")

    if response.status_code == 503:
        raise ValueError("Model is loading on HF servers — retry in 20 seconds")

    if not response.ok:
        err = response.json() if response.content else {}
        raise ValueError(err.get("error", f"HF API error: {response.status_code} — {response.text[:200]}"))

    data = response.json()

    # Response is a list of generated texts
    if isinstance(data, list) and len(data) > 0:
        result = data[0].get("generated_text", "")
        return result.strip()

    raise ValueError(f"Unexpected response format: {data}")


# ── Request model ─────────────────────────────────────────────────────────────
class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "en"


# ── Routes ────────────────────────────────────────────────────────────────────
@app.post("/translate")
async def translate_route(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    cache_key = hashlib.sha256(f"{req.source_lang}:{req.text}".encode()).hexdigest()
    if cache_key in translation_cache:
        print(f"[Cache HIT] {req.text[:50]}")
        return JSONResponse({"translation": translation_cache[cache_key], "cached": True})

    print(f"[Translating via HF API] {req.text[:80]}...")
    try:
        result = translate_via_hf_api(req.text, req.source_lang)
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
        "mode": "huggingface-inference-api",
        "token_set": bool(HF_TOKEN),
        "cached_translations": len(translation_cache),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5006)
