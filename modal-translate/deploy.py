"""
Kikuyu TranslateGemma-4B V7 on Modal Serverless GPU
Model: gateremark/kikuyu_translategemma_4b_v7_highrank_rslora
Base:  google/translategemma-4b-it
Method: rsLoRA r=256, alpha=256 — BLEU 21.93, chrF++ 42.87

Inference pattern follows the official model card exactly:
  - FastLanguageModel for loading
  - processor.apply_chat_template() for prompt formatting
  - text_tokenizer for encode/decode
  - do_sample=False (deterministic), target_lang_code="ki"

Deploy:
    py -3.11 -m modal deploy deploy.py

Endpoint:
    POST https://<workspace>--kikuyu-translate-kikuyu-translate-app.modal.run/translate
    Body: { "text": "Hello", "source_lang": "en" }
"""

import modal

app = modal.App("kikuyu-translate")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "unsloth[colab-new]",          # Unsloth — recommended loader for this model
        "transformers>=4.40.0",
        "torch>=2.2.0",
        "accelerate>=0.27.0",
        "fastapi>=0.111.0",
        "sentencepiece>=0.1.99",
        "huggingface_hub>=0.20.0",
        "pydantic>=2.0.0",
        "trl>=0.8.0",
        "xformers",
    )
)

model_volume = modal.Volume.from_name("kikuyu-gemma-model-v7", create_if_missing=True)
MODEL_DIR = "/model"
MODEL_ID  = "gateremark/kikuyu_translategemma_4b_v7_highrank_rslora"


@app.cls(
    image=image,
    gpu="A10G",                        # A10G for BF16 inference
    volumes={MODEL_DIR: model_volume},
    timeout=900,
    scaledown_window=300,
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class KikuyuTranslator:

    @modal.enter()
    def load_model(self):
        import os, torch
        from unsloth import FastLanguageModel
        from huggingface_hub import snapshot_download

        hf_token   = os.environ.get("HF_TOKEN")
        model_path = f"{MODEL_DIR}/kikuyu-4b-v7"

        # Download if not cached in the volume
        if not os.path.exists(f"{model_path}/model-00001-of-00002.safetensors"):
            print(f"[Init] Downloading {MODEL_ID}...")
            snapshot_download(MODEL_ID, local_dir=model_path, token=hf_token)
            model_volume.commit()
            print("[Init] Model cached to volume.")

        print("[Init] Loading model with FastLanguageModel...")
        self.model, self.processor = FastLanguageModel.from_pretrained(
            model_name=model_path,
            max_seq_length=4096,
            dtype=None,           # auto — BF16 on A10G
            load_in_4bit=False,   # full precision for best quality
        )

        # Get text tokenizer (processor wraps it for multimodal models)
        self.text_tokenizer = (
            getattr(self.processor, "tokenizer", None)
            or getattr(self.processor, "text_tokenizer", None)
            or self.processor
        )

        if self.text_tokenizer.pad_token_id is None:
            self.text_tokenizer.pad_token = self.text_tokenizer.eos_token
        self.model.config.pad_token_id = self.text_tokenizer.pad_token_id
        self.text_tokenizer.padding_side = "left"

        # Switch to fast inference mode
        FastLanguageModel.for_inference(self.model)

        # Build terminator list
        self.terminators = []
        for token_id in [
            self.text_tokenizer.eos_token_id,
            self.text_tokenizer.convert_tokens_to_ids("<end_of_turn>"),
            self.text_tokenizer.convert_tokens_to_ids("<eos>"),
        ]:
            if (
                isinstance(token_id, int)
                and token_id >= 0
                and token_id != getattr(self.text_tokenizer, "unk_token_id", None)
                and token_id not in self.terminators
            ):
                self.terminators.append(token_id)

        print(f"[Init] ✓ KikuyuTranslateGemma-4B V7 ready | terminators={self.terminators}")

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
                        "target_lang_code": "ki",   # Kikuyu ISO code
                        "text": text,
                    }
                ],
            }
        ]

        # Use processor for chat template (matches model card recommendation)
        formatted_text = self.processor.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        # Use text_tokenizer for actual encoding
        inputs = self.text_tokenizer(
            [formatted_text],
            return_tensors="pt",
            padding=True,
        )
        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        input_len = inputs["input_ids"].shape[1]

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=256,
                do_sample=False,            # deterministic — recommended for translation
                eos_token_id=self.terminators,
                pad_token_id=self.text_tokenizer.pad_token_id,
            )

        result = self.text_tokenizer.decode(
            outputs[0][input_len:],
            skip_special_tokens=True,
        )
        return result.strip()


# ── FastAPI web endpoint ───────────────────────────────────────────────────────
from fastapi import FastAPI
from pydantic import BaseModel

web_app = FastAPI(title="Kikuyu TranslateGemma 4B V7 API")


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
            return {"error": "No text provided"}, 400
        result = translator.translate.remote(req.text, req.source_lang)
        return {"translation": result, "model": MODEL_ID}

    @web_app.get("/health")
    async def health():
        return {"status": "ok", "model": MODEL_ID, "bleu": 21.93, "chrf": 42.87}

    return web_app


@app.local_entrypoint()
def test():
    translator = KikuyuTranslator()
    tests = [
        "Hello, how are you?",
        "The weather is beautiful today.",
        "I love learning new languages.",
        "Start each day with a task completed.",
    ]
    for t in tests:
        result = translator.translate.remote(t)
        print(f"EN: {t}")
        print(f"KI: {result}\n")


# ── Keep-alive every 4 minutes to prevent cold starts ────────────────────────
@app.function(image=image, schedule=modal.Period(minutes=4))
def keepalive():
    translator = KikuyuTranslator()
    result = translator.translate.remote("hello")
    print(f"[Keepalive] ping → {result}")
