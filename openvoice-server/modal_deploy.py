"""
OpenVoice v2 Voice Conversion on Modal Serverless GPU

Pipeline:
  MMS TTS audio (sent from Next.js) → OpenVoice v2 → c-elo voice WAV

Deploy:
    pip install modal
    modal token new
    modal deploy openvoice-server/modal_deploy.py

Endpoint:
    https://<workspace>--openvoice-v2-app.modal.run/convert

Update .env.local:
    OPENVOICE_URL=https://<workspace>--openvoice-v2-app.modal.run
"""

import modal

app = modal.App("openvoice-v2")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "ffmpeg")
    .pip_install(
        "torch>=2.2.0",
        "torchaudio>=2.2.0",
        "fastapi>=0.111.0",
        "uvicorn[standard]>=0.30.0",
        "python-multipart",
        "soundfile>=0.12.1",
        "numpy>=1.24.0",
        "pydantic>=2.0.0",
        "librosa>=0.10.0",
        "scipy",
        "tqdm",
        "inflect==7.0.0",
        "unidecode==1.3.7",
        "eng_to_ipa",
        "cn2an",
        "jieba",
        "langid",
        "pypinyin",
        "pydub",
        "wavmark",
    )
    .run_commands(
        "pip install 'myshell-openvoice @ git+https://github.com/myshell-ai/OpenVoice.git' --no-deps"
    )
)

# Volume to cache checkpoints and reference speaker embedding
volume = modal.Volume.from_name("openvoice-v2-cache", create_if_missing=True)
CACHE_DIR = "/cache"
CKPT_DIR  = f"{CACHE_DIR}/checkpoints_v2/converter"
REF_WAV   = f"{CACHE_DIR}/celo_reference.wav"


@app.cls(
    image=image,
    gpu="T4",
    volumes={CACHE_DIR: volume},
    timeout=120,
    scaledown_window=300,
)
class OpenVoiceConverter:

    @modal.enter()
    def load(self):
        import os, urllib.request, shutil, tempfile, torch
        from openvoice.api import ToneColorConverter

        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = device

        # Download checkpoints if not cached
        os.makedirs(CKPT_DIR, exist_ok=True)
        config_path = f"{CKPT_DIR}/config.json"
        ckpt_path   = f"{CKPT_DIR}/checkpoint.pth"

        HF_BASE = "https://huggingface.co/myshell-ai/OpenVoiceV2/resolve/main/converter"
        if not os.path.exists(config_path):
            print("[OpenVoice] Downloading config.json...")
            urllib.request.urlretrieve(f"{HF_BASE}/config.json", config_path)
        if not os.path.exists(ckpt_path):
            print("[OpenVoice] Downloading checkpoint.pth (~125 MB)...")
            urllib.request.urlretrieve(f"{HF_BASE}/checkpoint.pth", ckpt_path)
            volume.commit()

        # Load converter
        print(f"[OpenVoice] Loading ToneColorConverter on {device}...")
        self.converter = ToneColorConverter(config_path, device=device)
        self.converter.load_ckpt(ckpt_path)

        # Extract reference speaker embedding (c-elo voice)
        if not os.path.exists(REF_WAV):
            raise RuntimeError(
                f"Reference WAV not found at {REF_WAV}. "
                "Upload celo_reference.wav to the volume first — see instructions below."
            )

        print(f"[OpenVoice] Extracting speaker embedding from {REF_WAV}...")
        with tempfile.TemporaryDirectory() as tmp:
            ref_copy = f"{tmp}/ref.wav"
            shutil.copy2(REF_WAV, ref_copy)
            se_save  = f"{tmp}/se.pth"
            self.target_se = self.converter.extract_se([ref_copy], se_save_path=se_save)

        print(f"[OpenVoice] ✓ Ready on {device}")

    @modal.method()
    def convert(self, source_wav_bytes: bytes) -> bytes:
        import os, tempfile, shutil

        with tempfile.TemporaryDirectory() as tmp:
            src = f"{tmp}/input.wav"
            out = f"{tmp}/output.wav"

            with open(src, "wb") as f:
                f.write(source_wav_bytes)

            # Extract source speaker embedding
            se_save   = f"{tmp}/src_se.pth"
            source_se = self.converter.extract_se([src], se_save_path=se_save)

            # Convert to c-elo voice
            self.converter.convert(
                audio_src_path=src,
                src_se=source_se,
                tgt_se=self.target_se,
                output_path=out,
                message="@OpenVoice",
            )

            with open(out, "rb") as f:
                return f.read()


# ── FastAPI web endpoint ───────────────────────────────────────────────────────

@app.function(image=image)
@modal.asgi_app()
def openvoice_v2_app():
    from fastapi import FastAPI, UploadFile, File, Form
    from fastapi.responses import Response

    web_app = FastAPI(title="OpenVoice v2 — Voice Conversion")
    converter = OpenVoiceConverter()

    @web_app.post("/convert")
    async def convert(
        source_audio: UploadFile = File(...),
        text: str  = Form(""),
        speed: float = Form(0.75),
    ):
        src_bytes = await source_audio.read()
        if not src_bytes:
            return {"error": "source_audio is empty"}, 400
        result = converter.convert.remote(src_bytes)
        return Response(content=result, media_type="audio/wav")

    @web_app.get("/health")
    async def health():
        return {
            "status": "ok",
            "engine": "openvoice-v2",
            "platform": "modal-gpu",
        }

    return web_app


# ── Upload reference WAV to the Modal volume ─────────────────────────────────
@app.local_entrypoint()
def upload_reference():
    """
    Run once to upload celo_reference.wav to the Modal volume:
        modal run openvoice-server/modal_deploy.py
    """
    import os
    ref_local = os.path.join(os.path.dirname(__file__), "..", "chatterbox-server", "celo_reference.wav")
    ref_local = os.path.abspath(ref_local)

    if not os.path.exists(ref_local):
        print(f"ERROR: {ref_local} not found")
        return

    vol = modal.Volume.from_name("openvoice-v2-cache", create_if_missing=True)
    with vol.batch_upload() as b:
        b.put_file(ref_local, "/celo_reference.wav")
    print(f"✓ Uploaded {ref_local} → Modal volume /celo_reference.wav")
    print("Now deploy with: modal deploy openvoice-server/modal_deploy.py")


# ── Keep-alive ping every 4 minutes to avoid cold starts ─────────────────────
@app.function(image=image, schedule=modal.Period(minutes=4))
def keepalive():
    """Pings the converter every 4 min to keep the container warm."""
    import os, urllib.request
    # Send a tiny silent WAV to the /convert endpoint to keep it alive
    # 44-byte minimal valid WAV (silence)
    silent_wav = (
        b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00'
        b'\x01\x00\x80\xbb\x00\x00\x00w\x01\x00\x02\x00\x10\x00'
        b'data\x00\x00\x00\x00'
    )
    converter = OpenVoiceConverter()
    result = converter.convert.remote(silent_wav)
    print(f"[Keepalive] OpenVoice alive — {len(result)} bytes returned")
