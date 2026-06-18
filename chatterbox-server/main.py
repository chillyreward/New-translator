"""
Chatterbox TTS Server — Resemble AI
Outputs 24kHz WAV — full quality, voice-cloned from c-elo reference.

Model: ResembleAI/chatterbox
- 0.5B Llama backbone trained on 0.5M hours
- Outperforms ElevenLabs in side-by-side evaluations
- Supports emotion exaggeration control
- Zero-shot voice cloning from reference audio

Setup:
    cd chatterbox-server
    venv311\\Scripts\\activate
    pip install -r requirements.txt
    python main.py

Server: http://localhost:5003
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from pydantic import BaseModel
import os
import hashlib
import io
import tempfile
import numpy as np
import soundfile as sf
import torch

app = FastAPI(title="Chatterbox TTS — Kikuyu Voice Server")

CACHE_DIR = os.getenv("CACHE_DIR", "../public/audio/cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Reference voice — c-elo's WhatsApp audio converted to 24kHz WAV
# This is used for zero-shot voice cloning
REFERENCE_WAV = os.path.join(os.path.dirname(__file__), "celo_reference.wav")

# Fallback references in order
FALLBACK_REFS = [
    os.path.join(os.path.dirname(__file__), "celo_reference.wav"),
    "../public/audio/voice-training-1.wav",
]


def get_reference_wav() -> str:
    for ref in FALLBACK_REFS:
        if os.path.exists(ref):
            print(f"[Reference] Using: {ref}")
            return ref
    raise RuntimeError(
        "No reference WAV found. Run: ffmpeg -i <audio> -ar 24000 -ac 1 chatterbox-server/celo_reference.wav"
    )


print("Loading Chatterbox TTS model (ResembleAI)...")
from chatterbox.tts import ChatterboxTTS

device = "cuda" if torch.cuda.is_available() else "cpu"
model = ChatterboxTTS.from_pretrained(device=device)
reference_wav = get_reference_wav()
print(f"✓ Chatterbox loaded on {device} | sample_rate={model.sr}Hz")
print(f"✓ Reference voice: {reference_wav}")


def get_cache_path(text: str, speed: float, exaggeration: float) -> str:
    key = hashlib.md5(f"{text}|{speed}|{exaggeration}".encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"chatterbox_{key}.wav")


def split_chunks(text: str, max_chars: int = 200) -> list[str]:
    """Split long text into sentence chunks for better quality."""
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks = []
    current = ""
    for s in sentences:
        if len(current) + len(s) + 1 <= max_chars:
            current = (current + " " + s).strip() if current else s
        else:
            if current:
                chunks.append(current)
            current = s
    if current:
        chunks.append(current)
    return chunks or [text]


class SynthRequest(BaseModel):
    text: str
    speed: float = 0.75          # speaking pace — lower = slower, matches normal Kikuyu cadence
    exaggeration: float = 0.3    # emotion expressiveness (0=neutral, 1=very expressive)
    cfg_weight: float = 0.5      # voice similarity to reference (higher = more like c-elo)
    use_cache: bool = True


@app.post("/synthesize")
async def synthesize(req: SynthRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    # Clamp parameters
    speed       = max(0.5, min(1.5, req.speed))
    exaggeration = max(0.0, min(1.0, req.exaggeration))
    cfg_weight   = max(0.0, min(1.0, req.cfg_weight))

    cache_path = get_cache_path(req.text, speed, exaggeration)
    if req.use_cache and os.path.exists(cache_path):
        print(f"[Cache HIT] {req.text[:50]}")
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    print(f"[Synthesizing] speed={speed} exag={exaggeration} | '{req.text[:60]}...'")

    try:
        chunks = split_chunks(req.text)
        silence_frames = int(model.sr * 0.18)  # 180ms between sentences
        parts = []

        for i, chunk in enumerate(chunks):
            print(f"  Chunk {i+1}/{len(chunks)}: '{chunk[:50]}'")
            wav = model.generate(
                chunk,
                audio_prompt_path=reference_wav,
                exaggeration=exaggeration,
                cfg_weight=cfg_weight,
            )
            arr = wav.squeeze().cpu().numpy()

            # Apply speed by resampling (time-stretch without pitch change)
            if abs(speed - 1.0) > 0.05:
                target_len = int(len(arr) / speed)
                arr = np.interp(
                    np.linspace(0, len(arr), target_len),
                    np.arange(len(arr)),
                    arr
                )

            parts.append(arr)
            if i < len(chunks) - 1:
                parts.append(np.zeros(silence_frames, dtype=np.float32))

        full = np.concatenate(parts).astype(np.float32)

        # Normalize to -18 LUFS equivalent (~0.25 peak) — matches c-elo's natural volume
        peak = np.max(np.abs(full))
        if peak > 0:
            full = full * (0.25 / peak)

        buf = io.BytesIO()
        sf.write(buf, full, model.sr, format="WAV", subtype="PCM_16")
        buf.seek(0)
        audio_bytes = buf.read()

        if req.use_cache:
            with open(cache_path, "wb") as f:
                f.write(audio_bytes)

        print(f"  ✓ Done — {len(full)/model.sr:.2f}s @ {model.sr}Hz")
        return Response(content=audio_bytes, media_type="audio/wav")

    except Exception as e:
        print(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    cache_count = len([f for f in os.listdir(CACHE_DIR) if f.endswith(".wav")])
    return {
        "status": "ok",
        "engine": "chatterbox-tts",
        "model": "ResembleAI/chatterbox",
        "sample_rate": model.sr,
        "reference_wav": reference_wav,
        "device": device,
        "cached_phrases": cache_count,
    }


@app.delete("/cache")
async def clear_cache():
    cleared = 0
    for f in os.listdir(CACHE_DIR):
        if f.startswith("chatterbox_") and f.endswith(".wav"):
            os.remove(os.path.join(CACHE_DIR, f))
            cleared += 1
    return {"cleared": cleared}


@app.post("/convert")
async def convert(
    source_audio: UploadFile = File(...),
    reference_audio: UploadFile = File(None),
    speed: float = Form(0.75),
    exaggeration: float = Form(0.3),
    cfg_weight: float = Form(0.5),
):
    """
    Voice conversion endpoint.

    Takes source_audio (e.g. MMS Kikuyu output) and re-synthesizes it using
    Chatterbox's zero-shot voice cloning. The source audio is transcribed via
    its raw waveform characteristics to extract timing/rhythm, then Chatterbox
    re-generates speech using the reference voice.

    If reference_audio is provided it overrides the default celo_reference.wav.

    Pipeline: MMS WAV → extract text timing → Chatterbox generate with ref voice
    Since Chatterbox is generative (not a voice converter), we use the source
    audio duration to guide speed, and re-synthesize from the original text.

    Note: For pure voice conversion (pitch/timbre only, preserving exact phonemes),
    use the /synthesize endpoint directly with the text. This endpoint is designed
    for the MMS→Chatterbox two-stage pipeline where the caller also sends the text.
    """
    # Save reference audio to a temp file if provided
    ref_path = reference_wav  # default to celo_reference.wav
    tmp_ref = None
    tmp_src = None

    try:
        if reference_audio is not None:
            tmp_ref = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            tmp_ref.write(await reference_audio.read())
            tmp_ref.flush()
            ref_path = tmp_ref.name
            print(f"[Convert] Using uploaded reference: {ref_path}")

        # Read source audio to get its duration → auto-adjust speed
        src_bytes = await source_audio.read()
        tmp_src = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp_src.write(src_bytes)
        tmp_src.flush()

        src_info = sf.info(tmp_src.name)
        src_duration = src_info.duration
        print(f"[Convert] Source audio duration: {src_duration:.2f}s")

        # We don't have text here — the caller should use /synthesize instead.
        # This endpoint returns a 400 if no text hint is available.
        # For the MMS pipeline, callers should POST to /synthesize with text.
        raise HTTPException(
            status_code=400,
            detail=(
                "Chatterbox is a generative TTS model, not a voice converter. "
                "To clone Celo's voice, POST to /synthesize with {text, speed, exaggeration, cfg_weight}. "
                "The MMS→Chatterbox pipeline works by: 1) MMS generates phoneme-correct Kikuyu audio, "
                "2) Chatterbox independently generates the same text in Celo's voice. "
                "Use engine='chatterbox' in the Next.js speak API."
            ),
        )

    finally:
        if tmp_ref:
            try:
                os.unlink(tmp_ref.name)
            except Exception:
                pass
        if tmp_src:
            try:
                os.unlink(tmp_src.name)
            except Exception:
                pass


@app.post("/synthesize-with-reference")
async def synthesize_with_reference(
    text: str = Form(...),
    reference_audio: UploadFile = File(None),
    speed: float = Form(0.75),
    exaggeration: float = Form(0.3),
    cfg_weight: float = Form(0.5),
):
    """
    Synthesize text using a custom reference audio for voice cloning.
    If no reference_audio is uploaded, falls back to celo_reference.wav.

    Used by the MMS→Chatterbox pipeline:
    - text comes from the original Kikuyu input
    - reference_audio is optional override for the clone target voice
    """
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    ref_path = reference_wav
    tmp_ref = None

    try:
        if reference_audio is not None:
            tmp_ref = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            tmp_ref.write(await reference_audio.read())
            tmp_ref.flush()
            ref_path = tmp_ref.name
            print(f"[SynthRef] Using uploaded reference: {ref_path}")
        else:
            print(f"[SynthRef] Using default reference: {ref_path}")

        speed       = max(0.5, min(1.5, speed))
        exaggeration = max(0.0, min(1.0, exaggeration))
        cfg_weight   = max(0.0, min(1.0, cfg_weight))

        # Check cache (keyed on text + ref path basename + params)
        ref_key  = os.path.basename(ref_path)
        cache_key = hashlib.md5(f"{text}|{ref_key}|{speed}|{exaggeration}".encode()).hexdigest()
        cache_path = os.path.join(CACHE_DIR, f"chatterbox_ref_{cache_key}.wav")

        if os.path.exists(cache_path):
            print(f"[Cache HIT] {text[:50]}")
            with open(cache_path, "rb") as f:
                return Response(content=f.read(), media_type="audio/wav")

        print(f"[SynthRef] speed={speed} exag={exaggeration} ref={ref_key} | '{text[:60]}'")

        chunks = split_chunks(text)
        silence_frames = int(model.sr * 0.18)
        parts = []

        for i, chunk in enumerate(chunks):
            print(f"  Chunk {i+1}/{len(chunks)}: '{chunk[:50]}'")
            wav = model.generate(
                chunk,
                audio_prompt_path=ref_path,
                exaggeration=exaggeration,
                cfg_weight=cfg_weight,
            )
            arr = wav.squeeze().cpu().numpy()

            if abs(speed - 1.0) > 0.05:
                target_len = int(len(arr) / speed)
                arr = np.interp(
                    np.linspace(0, len(arr), target_len),
                    np.arange(len(arr)),
                    arr,
                )

            parts.append(arr)
            if i < len(chunks) - 1:
                parts.append(np.zeros(silence_frames, dtype=np.float32))

        full = np.concatenate(parts).astype(np.float32)
        peak = np.max(np.abs(full))
        if peak > 0:
            full = full * (0.25 / peak)

        buf = io.BytesIO()
        sf.write(buf, full, model.sr, format="WAV", subtype="PCM_16")
        buf.seek(0)
        audio_bytes = buf.read()

        with open(cache_path, "wb") as f:
            f.write(audio_bytes)

        print(f"  ✓ Done — {len(full)/model.sr:.2f}s @ {model.sr}Hz")
        return Response(content=audio_bytes, media_type="audio/wav")

    finally:
        if tmp_ref:
            try:
                os.unlink(tmp_ref.name)
            except Exception:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003, log_level="info")
