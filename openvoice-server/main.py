"""
OpenVoice v2 Server — Zero-shot voice conversion
Uses c-elo reference audio to convert any speech to c-elo's voice.

Two modes:
  1. Text → TTS (built-in MeloTTS) → voice converted to c-elo
  2. Audio → voice converted to c-elo (pass source_audio in form data)

Setup:
    cd openvoice-server
    venv311\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Server: http://localhost:5004
"""

import os, io, sys, hashlib
import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI(title="OpenVoice v2 — Kikuyu Voice Server")

CACHE_DIR = os.getenv("CACHE_DIR", "../public/audio/cache")
os.makedirs(CACHE_DIR, exist_ok=True)

REFERENCE_WAV = os.path.join(os.path.dirname(__file__), "..", "chatterbox-server", "celo_reference.wav")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"[OpenVoice] Loading on {DEVICE}...")

# ── Load OpenVoice v2 ─────────────────────────────────────────────────────────
from openvoice import se_extractor
from openvoice.api import ToneColorConverter

CKPT_DIR = os.path.join(os.path.dirname(__file__), "checkpoints_v2", "converter")
CONFIG_PATH = os.path.join(CKPT_DIR, "config.json")
CKPT_PATH   = os.path.join(CKPT_DIR, "checkpoint.pth")

# Auto-download if not present
if not os.path.exists(CONFIG_PATH):
    print("[OpenVoice] Downloading checkpoints...")
    import urllib.request, zipfile
    url = "https://myshell-public-repo-hosting.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip"
    zip_path = os.path.join(os.path.dirname(__file__), "checkpoints_v2.zip")
    urllib.request.urlretrieve(url, zip_path, reporthook=lambda b, bs, t: print(f"  {b*bs/1024/1024:.1f}MB / {t/1024/1024:.1f}MB", end="\r"))
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(os.path.dirname(__file__))
    os.remove(zip_path)
    print("\n[OpenVoice] Checkpoints downloaded.")

tone_color_converter = ToneColorConverter(CONFIG_PATH, device=DEVICE)
tone_color_converter.load_ckpt(CKPT_PATH)

# ── MeloTTS for text synthesis (base voice before conversion) ─────────────────
from melo.api import TTS as MeloTTS

base_tts = MeloTTS(language="EN", device=DEVICE)
speaker_ids = base_tts.hps.data.spk2id

# ── Extract reference speaker embedding once ──────────────────────────────────
print(f"[OpenVoice] Extracting speaker embedding from: {REFERENCE_WAV}")
target_se, _ = se_extractor.get_se(REFERENCE_WAV, tone_color_converter, vad=True)
print(f"[OpenVoice] ✓ Ready | device={DEVICE}")


def get_cache_path(text: str, speed: float) -> str:
    key = hashlib.md5(f"ov2:{text}:{speed}".encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"openvoice_{key}.wav")


def synthesize_and_convert(text: str, speed: float = 0.75) -> bytes:
    cache_path = get_cache_path(text, speed)
    if os.path.exists(cache_path):
        print(f"[Cache HIT] {text[:40]}")
        with open(cache_path, "rb") as f:
            return f.read()

    # Step 1: MeloTTS base synthesis
    tmp_base = os.path.join(os.path.dirname(__file__), f"_tmp_base_{os.getpid()}.wav")
    speaker_key = "EN-Default" if "EN-Default" in speaker_ids else list(speaker_ids.keys())[0]
    base_tts.tts_to_file(
        text,
        speaker_ids[speaker_key],
        tmp_base,
        speed=speed,
    )

    # Step 2: Extract source speaker embedding
    source_se, _ = se_extractor.get_se(tmp_base, tone_color_converter, vad=True)

    # Step 3: Convert to c-elo's voice
    tmp_out = os.path.join(os.path.dirname(__file__), f"_tmp_out_{os.getpid()}.wav")
    tone_color_converter.convert(
        audio_src_path=tmp_base,
        src_se=source_se,
        tgt_se=target_se,
        output_path=tmp_out,
        message="@OpenVoice",
    )

    with open(tmp_out, "rb") as f:
        audio_bytes = f.read()

    # Cache and clean up
    with open(cache_path, "wb") as f:
        f.write(audio_bytes)

    for p in [tmp_base, tmp_out]:
        try: os.remove(p)
        except: pass

    return audio_bytes


def convert_audio_to_celo(source_wav_bytes: bytes) -> bytes:
    """Convert uploaded audio to c-elo's voice using OpenVoice."""
    tmp_src = os.path.join(os.path.dirname(__file__), f"_tmp_src_{os.getpid()}.wav")
    tmp_out = os.path.join(os.path.dirname(__file__), f"_tmp_out_{os.getpid()}.wav")

    with open(tmp_src, "wb") as f:
        f.write(source_wav_bytes)

    source_se, _ = se_extractor.get_se(tmp_src, tone_color_converter, vad=True)
    tone_color_converter.convert(
        audio_src_path=tmp_src,
        src_se=source_se,
        tgt_se=target_se,
        output_path=tmp_out,
        message="@OpenVoice",
    )

    with open(tmp_out, "rb") as f:
        audio_bytes = f.read()

    for p in [tmp_src, tmp_out]:
        try: os.remove(p)
        except: pass

    return audio_bytes


# ── Endpoints ─────────────────────────────────────────────────────────────────

class SynthRequest(BaseModel):
    text: str
    speed: float = 0.75


@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    """Text → MeloTTS → OpenVoice v2 (c-elo voice)"""
    if not req.text.strip():
        raise HTTPException(400, "No text")
    try:
        audio = synthesize_and_convert(req.text, max(0.5, min(1.5, req.speed)))
        return Response(content=audio, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/convert")
async def convert(
    text: str = Form(""),
    speed: float = Form(0.75),
    source_audio: UploadFile = File(None),
    reference_audio: UploadFile = File(None),
):
    """Audio → OpenVoice v2 voice conversion (c-elo voice)"""
    try:
        if source_audio:
            # Convert provided audio to c-elo voice
            src_bytes = await source_audio.read()
            audio = convert_audio_to_celo(src_bytes)
        elif text.strip():
            # Fall back to text synthesis
            audio = synthesize_and_convert(text, max(0.5, min(1.5, speed)))
        else:
            raise HTTPException(400, "Provide source_audio or text")
        return Response(content=audio, media_type="audio/wav")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "openvoice-v2",
        "device": DEVICE,
        "reference": REFERENCE_WAV,
    }


@app.delete("/cache")
async def clear_cache():
    cleared = sum(1 for f in os.listdir(CACHE_DIR) if f.startswith("openvoice_") and os.remove(os.path.join(CACHE_DIR, f)) is None)
    return {"cleared": cleared}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5004, log_level="info")
