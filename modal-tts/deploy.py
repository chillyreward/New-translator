"""
Kikuyu MMS TTS on Modal Serverless GPU
Model: gateremark/kikuyu-tts-v1 (fine-tuned on Kikuyu)

Deploy:
    py -3.11 -m modal deploy deploy.py

Endpoint:
    https://<workspace>--kikuyu-tts-app.modal.run/synthesize

Update .env.local:
    MMS_TTS_URL=https://<workspace>--kikuyu-tts-app.modal.run
"""

import modal

app   = modal.App("kikuyu-tts")
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "transformers>=4.40.0",
        "torch>=2.2.0",
        "accelerate>=0.27.0",
        "soundfile>=0.12.1",
        "numpy>=1.24.0",
        "huggingface_hub>=0.20.0",
        "fastapi>=0.111.0",
        "pydantic>=2.0.0",
    )
)

model_volume = modal.Volume.from_name("kikuyu-tts-model", create_if_missing=True)
MODEL_DIR    = "/model"
MODEL_ID     = "gateremark/kikuyu-tts-v1"
MAX_CHUNK    = 100  # chars per chunk for best quality


@app.cls(
    image=image,
    gpu="T4",                   # T4 is cheapest GPU, plenty fast for TTS
    volumes={MODEL_DIR: model_volume},
    timeout=120,
    scaledown_window=120,       # Stay warm 2 minutes between requests
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class KikuyuTTS:

    @modal.enter()
    def load_model(self):
        import os, torch
        from transformers import VitsModel, AutoTokenizer
        from huggingface_hub import snapshot_download

        hf_token   = os.environ.get("HF_TOKEN")
        model_path = f"{MODEL_DIR}/kikuyu-tts"

        if not os.path.exists(f"{model_path}/config.json"):
            print(f"Downloading {MODEL_ID}...")
            snapshot_download(MODEL_ID, local_dir=model_path, token=hf_token)
            model_volume.commit()

        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model     = VitsModel.from_pretrained(model_path)
        self.model.eval().to("cuda")
        self.sr        = self.model.config.sampling_rate
        print(f"✓ TTS model ready on GPU | sample_rate={self.sr}")

    def _synthesize_chunk(self, text: str):
        import torch, numpy as np
        inputs = self.tokenizer(text, return_tensors="pt").to("cuda")
        with torch.no_grad():
            wav = self.model(**inputs).waveform[0].cpu().numpy()
        return wav

    def _split_chunks(self, text: str):
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        chunks = []
        for s in sentences:
            s = s.strip()
            if not s:
                continue
            if len(s) <= MAX_CHUNK:
                chunks.append(s)
            else:
                parts = re.split(r'(?<=[,;])\s+', s)
                cur = ""
                for p in parts:
                    if len(cur) + len(p) + 1 <= MAX_CHUNK:
                        cur = (cur + " " + p).strip() if cur else p
                    else:
                        if cur:
                            chunks.append(cur)
                        cur = p
                if cur:
                    chunks.append(cur)
        return [c for c in chunks if c.strip()] or [text]

    @modal.method()
    def synthesize(self, text: str) -> bytes:
        import io, numpy as np, soundfile as sf, unicodedata, re

        # Normalize text
        text = unicodedata.normalize('NFC', text.strip())
        if text and text[-1] not in '.!?,;:':
            text += '.'
        text = re.sub(r'  +', ' ', text)

        chunks  = self._split_chunks(text)
        silence = np.zeros(int(self.sr * 0.18), dtype=np.float32)
        parts   = []

        for i, chunk in enumerate(chunks):
            print(f"  TTS chunk {i+1}/{len(chunks)}: '{chunk[:60]}'")
            parts.append(self._synthesize_chunk(chunk))
            if i < len(chunks) - 1:
                parts.append(silence)

        full = np.concatenate(parts)
        buf  = io.BytesIO()
        sf.write(buf, full, self.sr, format="WAV", subtype="PCM_16")
        buf.seek(0)
        return buf.read()


# ── FastAPI endpoint ──────────────────────────────────────────────────────────
from fastapi import FastAPI, Response
from fastapi.responses import Response as FastResponse
from pydantic import BaseModel

web_app = FastAPI(title="Kikuyu MMS TTS API")


class TTSRequest(BaseModel):
    text: str


@app.function(image=image)
@modal.asgi_app()
def kikuyu_tts_app():
    tts = KikuyuTTS()

    @web_app.post("/synthesize")
    async def synthesize(req: TTSRequest):
        if not req.text.strip():
            return {"error": "No text"}, 400
        audio = tts.synthesize.remote(req.text)
        return FastResponse(content=audio, media_type="audio/wav")

    @web_app.get("/health")
    async def health():
        return {"status": "ok", "model": MODEL_ID, "platform": "modal-gpu"}

    return web_app


@app.local_entrypoint()
def test():
    tts    = KikuyuTTS()
    audio  = tts.synthesize.remote("Wĩ mwega? Nĩ ngatho muno.")
    with open("test_output.wav", "wb") as f:
        f.write(audio)
    print(f"✓ Saved test_output.wav ({len(audio)} bytes)")
