"""
RVC (Retrieval-based Voice Conversion) Server
Converts MMS TTS audio to c-elo's voice using a trained RVC model.

Uses rvc-python with fairseq-fixed (pre-built wheel, Windows compatible).

Pipeline:
  MMS TTS (Kikuyu phonemes) → RVC (c-elo voice) → 48kHz WAV

Setup:
    cd rvc-server
    venv311\\Scripts\\python.exe do_install.py
    venv311\\Scripts\\python.exe main.py

Server: http://localhost:5005
"""

import os, io, hashlib
import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import Response

app = FastAPI(title="RVC Voice Conversion Server")

CACHE_DIR = os.getenv("CACHE_DIR", "../public/audio/cache")
os.makedirs(CACHE_DIR, exist_ok=True)

DEVICE  = "cuda" if torch.cuda.is_available() else "cpu"

# ── Model paths ───────────────────────────────────────────────────────────────
MODEL_DIR  = os.path.join(os.path.dirname(__file__), "models")
INDEX_DIR  = os.path.join(os.path.dirname(__file__), "index")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(INDEX_DIR, exist_ok=True)

MODEL_PATH = os.getenv("RVC_MODEL_PATH", os.path.join(MODEL_DIR, "celo_voice.pth"))
INDEX_PATH = os.getenv("RVC_INDEX_PATH", os.path.join(INDEX_DIR, "celo_voice.index"))


def download_pretrained_model() -> bool:
    """Download a pretrained RVC model as placeholder until custom model is trained."""
    import urllib.request
    # Aria v2 — clean female voice, reasonable placeholder
    model_url = "https://huggingface.co/Rejekts/project/resolve/main/Aria_En_v2.pth"
    if not os.path.exists(MODEL_PATH):
        print(f"[RVC] Downloading pretrained model to {MODEL_PATH}...")
        try:
            urllib.request.urlretrieve(model_url, MODEL_PATH)
            print("[RVC] Model downloaded.")
        except Exception as e:
            print(f"[RVC] WARNING: Could not download pretrained model: {e}")
            return False
    return True


# ── Load rvc-python ───────────────────────────────────────────────────────────
MODEL_LOADED = False
rvc_pipeline = None

try:
    from rvc_python.infer import RVCInference
    rvc_pipeline = RVCInference(device=DEVICE)

    if not os.path.exists(MODEL_PATH):
        download_pretrained_model()

    if os.path.exists(MODEL_PATH):
        index = INDEX_PATH if os.path.exists(INDEX_PATH) else ""
        rvc_pipeline.load_model(MODEL_PATH, index)
        print(f"[RVC] ✓ Loaded: {os.path.basename(MODEL_PATH)} on {DEVICE}")
        MODEL_LOADED = True
    else:
        print("[RVC] No model — running in passthrough mode")

except ImportError:
    print("[RVC] rvc-python not installed — running in passthrough mode")
    print("[RVC] Install with: venv311\\Scripts\\python.exe do_install.py")


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_cache_path(audio_hash: str, pitch: int) -> str:
    return os.path.join(CACHE_DIR, f"rvc_{audio_hash}_{pitch}.wav")


def convert_audio(audio_bytes: bytes, pitch_shift: int = 0, index_rate: float = 0.75) -> bytes:
    """Convert audio using RVC model. Falls back to passthrough if no model."""
    if not MODEL_LOADED or rvc_pipeline is None:
        print("[RVC] Passthrough mode — no model loaded")
        return audio_bytes

    tmp_in  = os.path.join(os.path.dirname(__file__), f"_tmp_in_{os.getpid()}.wav")
    tmp_out = os.path.join(os.path.dirname(__file__), f"_tmp_out_{os.getpid()}.wav")

    with open(tmp_in, "wb") as f:
        f.write(audio_bytes)

    try:
        rvc_pipeline.infer(
            input_path=tmp_in,
            output_path=tmp_out,
            f0_up_key=pitch_shift,
            f0_method="rmvpe",
            index_rate=index_rate,
            protect=0.33,
            filter_radius=3,
            resample_sr=48000,
            rms_mix_rate=0.25,
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
            try:
                os.remove(p)
            except OSError:
                pass


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
    if rvc_pipeline is None:
        raise HTTPException(503, "rvc-python not installed")
    try:
        idx = index_path if os.path.exists(index_path) else ""
        rvc_pipeline.load_model(model_path, idx)
        MODEL_LOADED = True
        return {"status": "ok", "model": model_path}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.delete("/cache")
async def clear_cache():
    cleared = 0
    for f in os.listdir(CACHE_DIR):
        if f.startswith("rvc_") and f.endswith(".wav"):
            os.remove(os.path.join(CACHE_DIR, f))
            cleared += 1
    return {"cleared": cleared}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005, log_level="info")
