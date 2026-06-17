"""
RVC (Retrieval-based Voice Conversion) Server
Converts MMS TTS audio to c-elo's voice using a trained RVC model.

Two modes:
  A) Pretrained model — use a public RVC model as placeholder
  B) Custom model — train on celo_reference.wav (via Colab notebook)

The server accepts WAV audio and returns voice-converted WAV.

Setup:
    cd rvc-server
    py -3.11 -m venv venv311
    venv311\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Server: http://localhost:5005
"""

import os, io, hashlib, sys
import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import Response

app = FastAPI(title="RVC Voice Conversion Server")

CACHE_DIR = os.getenv("CACHE_DIR", "../public/audio/cache")
os.makedirs(CACHE_DIR, exist_ok=True)

DEVICE  = "cuda" if torch.cuda.is_available() else "cpu"
SR      = 40000  # RVC native sample rate

# ── Model paths ───────────────────────────────────────────────────────────────
MODEL_DIR  = os.path.join(os.path.dirname(__file__), "models")
INDEX_DIR  = os.path.join(os.path.dirname(__file__), "index")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(INDEX_DIR, exist_ok=True)

# Model file — set CUSTOM_MODEL_PATH env var to use your trained model
# Default: download a pretrained female voice as placeholder
MODEL_PATH = os.getenv(
    "RVC_MODEL_PATH",
    os.path.join(MODEL_DIR, "celo_voice.pth")
)
INDEX_PATH = os.getenv(
    "RVC_INDEX_PATH",
    os.path.join(INDEX_DIR, "celo_voice.index")
)


def download_pretrained_model():
    """Download a pretrained RVC model as placeholder until custom model is trained."""
    import urllib.request
    # Use Aria pretrained model (clean female voice — reasonable placeholder)
    model_url = "https://huggingface.co/Rejekts/project/resolve/main/Aria_En_v2.pth"
    index_url  = None  # index is optional

    if not os.path.exists(MODEL_PATH):
        print(f"[RVC] Downloading pretrained model to {MODEL_PATH}...")
        try:
            urllib.request.urlretrieve(model_url, MODEL_PATH)
            print("[RVC] Model downloaded.")
        except Exception as e:
            print(f"[RVC] WARNING: Could not download pretrained model: {e}")
            print("[RVC] Will run in passthrough mode until a model is available.")
            return False
    return True


# ── Load RVC pipeline ─────────────────────────────────────────────────────────
try:
    from rvc_python.infer import RVCInference
    rvc = RVCInference(device=DEVICE)

    model_available = os.path.exists(MODEL_PATH) or download_pretrained_model()

    if model_available and os.path.exists(MODEL_PATH):
        index = INDEX_PATH if os.path.exists(INDEX_PATH) else ""
        rvc.load_model(MODEL_PATH, index)
        print(f"[RVC] ✓ Loaded model: {os.path.basename(MODEL_PATH)} on {DEVICE}")
        MODEL_LOADED = True
    else:
        print("[RVC] No model loaded — running in passthrough mode")
        MODEL_LOADED = False

except ImportError:
    print("[RVC] rvc-python not installed — running in passthrough mode")
    rvc = None
    MODEL_LOADED = False


def get_cache_path(audio_hash: str, pitch: int) -> str:
    return os.path.join(CACHE_DIR, f"rvc_{audio_hash}_{pitch}.wav")


def convert_audio(audio_bytes: bytes, pitch_shift: int = 0, index_rate: float = 0.75) -> bytes:
    """Convert audio using RVC model. Falls back to passthrough if no model."""

    if not MODEL_LOADED or rvc is None:
        # Passthrough — return input unchanged (model not yet trained)
        print("[RVC] Passthrough mode — no model loaded")
        return audio_bytes

    # Write input to temp file
    tmp_in  = os.path.join(os.path.dirname(__file__), f"_tmp_in_{os.getpid()}.wav")
    tmp_out = os.path.join(os.path.dirname(__file__), f"_tmp_out_{os.getpid()}.wav")

    with open(tmp_in, "wb") as f:
        f.write(audio_bytes)

    try:
        rvc.infer(
            input_path=tmp_in,
            output_path=tmp_out,
            f0_up_key=pitch_shift,          # semitones shift (0 = same pitch)
            f0_method="rmvpe",              # best pitch extraction
            index_rate=index_rate,          # how much to use the index (0-1)
            protect=0.33,                   # protect voiceless consonants
            filter_radius=3,               # median filter for pitch
            resample_sr=48000,             # output at 48kHz
            rms_mix_rate=0.25,             # envelope mixing
        )

        if os.path.exists(tmp_out):
            with open(tmp_out, "rb") as f:
                return f.read()
        else:
            print("[RVC] Output file not created — returning input")
            return audio_bytes

    except Exception as e:
        print(f"[RVC] Conversion error: {e}")
        return audio_bytes
    finally:
        for p in [tmp_in, tmp_out]:
            try: os.remove(p)
            except: pass


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/convert")
async def convert(
    audio: UploadFile = File(None),
    pitch_shift: int  = Form(0),
    index_rate: float = Form(0.75),
    f0_method: str    = Form("rmvpe"),
):
    """Convert uploaded WAV audio to RVC target voice."""
    if not audio:
        raise HTTPException(400, "No audio file provided")

    try:
        audio_bytes  = await audio.read()
        audio_hash   = hashlib.md5(audio_bytes).hexdigest()[:12]
        cache_path   = get_cache_path(audio_hash, pitch_shift)

        if os.path.exists(cache_path):
            print(f"[Cache HIT] {audio_hash}")
            with open(cache_path, "rb") as f:
                return Response(content=f.read(), media_type="audio/wav")

        result = convert_audio(audio_bytes, pitch_shift, index_rate)

        with open(cache_path, "wb") as f:
            f.write(result)

        return Response(content=result, media_type="audio/wav")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "rvc",
        "model_loaded": MODEL_LOADED,
        "model_path": MODEL_PATH if MODEL_LOADED else None,
        "device": DEVICE,
        "mode": "voice-conversion" if MODEL_LOADED else "passthrough",
    }


@app.post("/load_model")
async def load_model(model_path: str = Form(...), index_path: str = Form("")):
    """Hot-reload a new RVC model without restarting the server."""
    global MODEL_LOADED
    if not os.path.exists(model_path):
        raise HTTPException(404, f"Model not found: {model_path}")
    try:
        rvc.load_model(model_path, index_path if os.path.exists(index_path) else "")
        MODEL_LOADED = True
        return {"status": "ok", "model": model_path}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.delete("/cache")
async def clear_cache():
    cleared = sum(
        1 for f in os.listdir(CACHE_DIR)
        if f.startswith("rvc_") and os.remove(os.path.join(CACHE_DIR, f)) is None
    )
    return {"cleared": cleared}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005, log_level="info")
