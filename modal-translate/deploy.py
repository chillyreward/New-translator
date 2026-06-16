"""
Kikuyu TranslateGemma-4B V7 on Modal Serverless GPU
Model: gateremark/kikuyu_translategemma_4b_v7_highrank_rslora
BLEU: 21.93, chrF++: 42.87

Uses standard HuggingFace transformers — stable, no build deps.
Same model weights as the unsloth path, same output quality.

Deploy:
    py -3.11 -m modal deploy deploy.py
"""

import modal

app = modal.App("kikuyu-translate")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "transformers>=4.44.0",
        "torch>=2.3.0",
        "accelerate>=0.27.0",
        "fastapi>=0.111.0",
        "sentencepiece>=0.1.99",
        "huggingface_hub>=0.23.0",
        "pydantic>=2.0.0",
    )
)

model_volume = modal.Volume.from_name("kikuyu-gemma-v7-stable", create_if_missing=True)
MODEL_DIR = "/model"
MODEL_ID  = "gateremark/kikuyu_translategemma_4b_v7_highrank_rslora"


@app.cls(
    image=image,
    gpu="A10G",
    volumes={MODEL_DIR: model_volume},
    timeout=900,
    scaledown_window=300,
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class KikuyuTranslator:

    @modal.enter()
    def load_model(self):
        import os, torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from huggingface_hub import snapshot_download

        hf_token   = os.environ.get("HF_TOKEN")
        model_path = f"{MODEL_DIR}/kikuyu-4b-v7-stable"

        if not os.path.exists(f"{model_path}/model-00001-of-00002.safetensors"):
            print(f"[Init] Downloading {MODEL_ID}...")
            snapshot_download(MODEL_ID, local_dir=model_path, token=hf_token)
            model_volume.commit()
            print("[Init] Cached.")

        print("[Init] Loading model...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        if self.tokenizer.pad_token_id is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        self.tokenizer.padding_side = "left"

        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )
        self.model.config.pad_token_id = self.tokenizer.pad_token_id
        self.model.eval()

        self.terminators = []
        for tok in ["<end_of_turn>", "<eos>"]:
            try:
                tid = self.tokenizer.convert_tokens_to_ids(tok)
                if isinstance(tid, int) and tid >= 0:
                    self.terminators.append(tid)
            except Exception:
                pass
        if self.tokenizer.eos_token_id:
            self.terminators.append(self.tokenizer.eos_token_id)
        self.terminators = list(set(self.terminators))
        print(f"[Init] ✓ Ready | terminators={self.terminators}")

    @modal.method()
    def translate(self, text: str, source_lang: str = "en") -> str:
        import torch

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "source_lang_code": source_lang,
                        "target_lang_code": "ki",
                        "text": text,
                    }
                ],
            }
        ]

        formatted = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self.tokenizer([formatted], return_tensors="pt", padding=True)
        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        input_len = inputs["input_ids"].shape[1]

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=256,
                do_sample=False,
                eos_token_id=self.terminators,
                pad_token_id=self.tokenizer.pad_token_id,
            )

        return self.tokenizer.decode(
            outputs[0][input_len:],
            skip_special_tokens=True,
        ).strip()


# ── FastAPI endpoint ──────────────────────────────────────────────────────────
from fastapi import FastAPI
from pydantic import BaseModel

web_app = FastAPI(title="Kikuyu TranslateGemma 4B V7")


class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "en"


@app.function(image=image)
@modal.asgi_app()
def kikuyu_translate_app():
    translator = KikuyuTranslator()

    @web_app.post("/translate")
    async def translate(req: TranslateRequest):
        if not req.text.strip():
            return {"error": "No text"}, 400
        result = translator.translate.remote(req.text, req.source_lang)
        return {"translation": result, "model": MODEL_ID}

    @web_app.get("/health")
    async def health():
        return {"status": "ok", "model": MODEL_ID, "bleu": 21.93}

    return web_app


@app.local_entrypoint()
def test():
    t = KikuyuTranslator()
    for text in ["Hello, how are you?", "Start each day with a task completed."]:
        print(f"EN: {text}\nKI: {t.translate.remote(text)}\n")


# ── Keep-alive every 4 minutes ────────────────────────────────────────────────
@app.function(image=image, schedule=modal.Period(minutes=4))
def keepalive():
    t = KikuyuTranslator()
    result = t.translate.remote("hello")
    print(f"[Keepalive] → {result}")
