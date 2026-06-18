"""
OpenVoice v2 Server — Voice Conversion Only
Converts MMS TTS audio (with correct Kikuyu phonemes) to c-elo's voice.

No MeloTTS / no text synthesis here — the Next.js route sends MMS audio
as source_audio, so this server only needs to do speaker conversion.

Pipeline:
  Next.js → MMS (Modal GPU, Kikuyu phonemes) → OpenVoice v2 (c-elo voice)

Setup:
    cd openvoice-server
    setup.bat          # first time only
    start.bat          # every time

Server: http://localhost:5004
"""

import os, hashlib, tempfile
import torch
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import Response

app = FastAPI(title="OpenVoice v2 — Voice Conversion Server")

CACHE_DIR = os.getenv("CACHE_DIR", "../public/audio/cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Reference audio — c-elo's voice (24kHz mono WAV)
REFERENCE_WAV = os.path.join(
    os.path.dirname(__file__), "..", "chatterbox-server", "celo_reference.wav"
)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ── Load OpenVoice v2 ─────────────────────────────────────────────────────────
print(f"[OpenVoice] Loading tone color converter on {DEVICE}...")

from openvoice import se_extractor
from openvoice.api import ToneColorConverter

CKPT_DIR    = os.path.join(os.path.dirname(__file__), "checkpoints_v2", "converter")
CONFIG_PATH = os.path.join(CKPT_DIR, "config.json")
CKPT_PATH   = os.path.join(CKPT_DIR, "checkpoint.pth")

# Auto-download checkpoints from Hugging Face if not present
# (The original MyShell S3 URL returns 403; official HF repo is the mirror)
if not os.path.exists(CONFIG_PATH):
    print("[OpenVoice] Downloading v2 checkpoints from Hugging Face...")
    import urllib.request
    os.makedirs(CKPT_DIR, exist_ok=True)

    HF_BASE = "https://huggingface.co/myshell-ai/OpenVoiceV2/resolve/main/converter"
    files = {
        "config.json":    f"{HF_BASE}/config.json",
        "checkpoint.pth": f"{HF_BASE}/checkpoint.pth",
    }

    for fname, url in files.items():
        dest = os.path.join(CKPT_DIR, fname)
        print(f"[OpenVoice]   {fname} ...", end=" ", flush=True)
        urllib.request.urlretrieve(url, dest)
        size_mb = os.path.getsize(dest) / 1024 / 1024
        print(f"{size_mb:.1f} MB")

    print("[OpenVoice] Checkpoints downloaded.")

tone_color_converter = ToneColorConverter(CONFIG_PATH, device=DEVICE)
tone_color_converter.load_ckpt(CKPT_PATH)

# Extract target speaker embedding from c-elo reference once at startup
if not os.path.exists(REFERENCE_WAV):
    raise RuntimeError(
        f"Reference WAV not found: {REFERENCE_WAV}\n"
        "Run: ffmpeg -i <source> -ar 24000 -ac 1 chatterbox-server/celo_reference.wav"
    )

print(f"[OpenVoice] Extracting speaker embedding from: {REFERENCE_WAV}")
# Bypass se_extractor.get_se entirely — it calls faster-whisper with device="cuda"
# even on CPU-only machines. We export the reference as a single temp WAV segment
# and call extract_se directly, which avoids the Whisper segmentation step.
with tempfile.TemporaryDirectory() as _tmpdir:
    import shutil
    _ref_copy = os.path.join(_tmpdir, "ref.wav")
    shutil.copy2(REFERENCE_WAV, _ref_copy)
    _se_save = os.path.join(_tmpdir, "se.pth")
    target_se = tone_color_converter.extract_se([_ref_copy], se_save_path=_se_save)
print(f"[OpenVoice] ✓ Ready | device={DEVICE}")


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_cache_path(audio_hash: str) -> str:
    return os.path.join(CACHE_DIR, f"openvoice_{audio_hash}.wav")


def convert_to_celo(source_wav_bytes: bytes) -> bytes:
    """Convert any WAV audio to c-elo's voice using OpenVoice v2."""
    audio_hash = hashlib.md5(source_wav_bytes).hexdigest()[:16]
    cache_path = get_cache_path(audio_hash)

    if os.path.exists(cache_path):
        print(f"[Cache HIT] {audio_hash}")
        with open(cache_path, "rb") as f:
            return f.read()

    pid = os.getpid()
    tmp_src = os.path.join(os.path.dirname(__file__), f"_src_{pid}.wav")
    tmp_out = os.path.join(os.path.dirname(__file__), f"_out_{pid}.wav")

    try:
        with open(tmp_src, "wb") as f:
            f.write(source_wav_bytes)

        # Extract source speaker embedding directly (bypass se_extractor to avoid
        # faster-whisper hardcoding device="cuda" on CPU-only machines)
        with tempfile.TemporaryDirectory() as _se_tmp:
            _se_save = os.path.join(_se_tmp, "se.pth")
            source_se = tone_color_converter.extract_se([tmp_src], se_save_path=_se_save)

        # Convert to c-elo's voice
        tone_color_converter.convert(
            audio_src_path=tmp_src,
            src_se=source_se,
            tgt_se=target_se,
            output_path=tmp_out,
            message="@OpenVoice",
        )

        with open(tmp_out, "rb") as f:
            result = f.read()

        # Cache result
        with open(cache_path, "wb") as f:
            f.write(result)

        return result

    finally:
        for p in [tmp_src, tmp_out]:
            try:
                os.remove(p)
            except OSError:
                pass


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/convert")
async def convert(
    source_audio: UploadFile = File(...),
    # text and speed accepted but ignored — kept for API compatibility
    text: str = Form(""),
    speed: float = Form(0.75),
    reference_audio: UploadFile = File(None),
):
    """
    Convert uploaded WAV audio to c-elo's voice.
    source_audio — WAV bytes from MMS (or any other TTS engine)
    """
    try:
        src_bytes = await source_audio.read()
        if not src_bytes:
            raise HTTPException(400, "source_audio is empty")

        audio = convert_to_celo(src_bytes)
        return Response(content=audio, media_type="audio/wav")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[OpenVoice] Error: {e}")
        raise HTTPException(500, str(e))


@app.get("/health")
async def health():
    cache_count = len([f for f in os.listdir(CACHE_DIR) if f.startswith("openvoice_")])
    return {
        "status": "ok",
        "engine": "openvoice-v2",
        "mode": "voice-conversion-only",  # no MeloTTS
        "device": DEVICE,
        "reference": REFERENCE_WAV,
        "cached_phrases": cache_count,
    }


@app.delete("/cache")
async def clear_cache():
    cleared = 0
    for f in os.listdir(CACHE_DIR):
        if f.startswith("openvoice_") and f.endswith(".wav"):
            os.remove(os.path.join(CACHE_DIR, f))
            cleared += 1
    return {"cleared": cleared}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5004, log_level="info")
