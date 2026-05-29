# Meta MMS-TTS Kikuyu Server

Runs `facebook/mms-tts-kik` locally — Meta's model trained natively on Kikuyu.
No internet needed after first model download.

## Setup

```bash
cd mms-server
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
python main.py
```

First run downloads the model (~500MB) from HuggingFace and caches it locally.
All subsequent runs load from cache instantly.

## Endpoints

- `POST /synthesize` — `{ "text": "Kikuyu text here" }` → returns WAV audio
- `GET  /health`     — check status
- `DELETE /cache`    — clear audio cache

## Connect to the App

In `.env.local`:
```
MMS_TTS_URL=http://localhost:5004
```

## GPU Acceleration

If you have an NVIDIA GPU:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

## Troubleshooting

| Error | Fix |
|---|---|
| `ModuleNotFoundError: transformers` | Run `pip install -r requirements.txt` with venv active |
| Model download fails | Check internet connection — only needed once |
| Slow generation | Expected on CPU (~3-5s). Results are cached after first synthesis |
