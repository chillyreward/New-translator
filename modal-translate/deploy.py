"""
Kikuyu TranslateGemma-4B V7 on Modal — Unsloth inference
Model: gateremark/kikuyu_translategemma_4b_v7_highrank_rslora
BLEU: 21.93, chrF++: 42.87

The model card recommends Unsloth for inference but it's a TEXT-ONLY model
(no vision/processor). We use FastLanguageModel with load_in_4bit=False
and access the underlying text tokenizer directly — NOT AutoProcessor.

Deploy:
    py -3.11 -m modal deploy deploy.py
"""

import modal

app = modal.App("kikuyu-translate")

# Use Modal's official CUDA image — has compatible torch + CUDA pre-installed
image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04",
        add_python="3.11",
    )
    .pip_install(
        "torch==2.3.0",
        "transformers==4.44.0",
        "accelerate>=0.27.0",
        "sentencepiece>=0.1.99",
        "huggingface_hub>=0.20.0",
        "fastapi>=0.111.0",
        "pydantic>=2.0.0",
        "triton",
        "unsloth",          # PyPI wheel — no build tools needed
        "unsloth_zoo",
    )
)

model_volume = modal.Volume.from_name("kikuyu-gemma-unsloth", create_if_missing=True)
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
        from huggingface_hub import snapshot_download

        hf_token   = os.environ.get("HF_TOKEN")
        model_path = f"{MODEL_DIR}/kikuyu-4b-v7-unsloth"

        if not os.path.exists(f"{model_path}/model-00001-of-00002.safetensors"):
            print(f"[Init] Downloading {MODEL_ID}...")
            snapshot_download(MODEL_ID, local_dir=model_path, token=hf_token)
            model_volume.commit()
            print("[Init] Cached to volume.")

        print("[Init] Loading with Unsloth FastLanguageModel...")
        from unsloth import FastLanguageModel

        # Use FastLanguageModel — text-only, not vision
        # This avoids the AutoProcessor error from the vision code path
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name=model_path,
            max_seq_length=4096,
            dtype=torch.bfloat16,
            load_in_4bit=False,
        )

        if self.tokenizer.pad_token_id is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        self.model.config.pad_token_id = self.tokenizer.pad_token_id
        self.tokenizer.padding_side = "left"

        # Switch to fast inference mode
        FastLanguageModel.for_inference(self.model)

        # Build terminator list
        self.terminators = []
        for tok in [
            self.tokenizer.eos_token_id,
            self.tokenizer.convert_tokens_to_ids("<end_of_turn>"),
            self.tokenizer.convert_tokens_to_ids("<eos>"),
        ]:
            if (
                isinstance(tok, int)
                and tok >= 0
                and tok != getattr(self.tokenizer, "unk_token_id", None)
                and tok not in self.terminators
            ):
                self.terminators.append(tok)

        print(f"[Init] ✓ Ready | terminators={self.terminators}")

    @modal.method()
    def translate(self, text: str, source_lang: str = "en") -> str:
        import torch

        # TranslateGemma chat template with lang codes
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

        inputs = self.tokenizer(
            [formatted],
            return_tensors="pt",
            padding=True,
        )
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

        result = self.tokenizer.decode(
            outputs[0][input_len:],
            skip_special_tokens=True,
        )
        return result.strip()


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
        result = t.translate.remote(text)
        print(f"EN: {text}\nKI: {result}\n")


# ── Keep-alive every 4 minutes ────────────────────────────────────────────────
@app.function(image=image, schedule=modal.Period(minutes=4))
def keepalive():
    t = KikuyuTranslator()
    result = t.translate.remote("hello")
    print(f"[Keepalive] → {result}")
