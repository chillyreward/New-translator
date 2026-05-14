# Coqui XTTS v2 Voice Cloning Server — Setup Guide

This server clones a Kikuyu voice using your recorded audio samples and generates speech via the XTTS v2 model.

---

## Requirements

- Windows 10/11 (64-bit)
- Python 3.11 (not 3.12+ — TTS requires 3.11)
- At least 8GB RAM (16GB recommended)
- GPU optional but speeds up generation significantly

---

## Step 1 — Install Python 3.11

Download from: https://www.python.org/downloads/release/python-3119/

During install:
- ✅ Check **"Add Python to PATH"**
- Choose **"Customize installation"** → enable pip

Verify:
```bash
python --version
# Should show: Python 3.11.x
```

---

## Step 2 — Create a Virtual Environment

Open a terminal in the `coqui-server` folder:

```bash
cd C:\Users\swanti\Desktop\Gikuyu-Demo\coqui-server
python -m venv venv311
```

Activate it:
```bash
venv311\Scripts\activate
```

You should see `(venv311)` at the start of your terminal prompt.

---

## Step 3 — Install Dependencies

With the venv active:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- `TTS` (Coqui XTTS v2)
- `torch` (PyTorch — CPU version by default)
- `fastapi` + `uvicorn` (web server)
- `soundfile` (audio processing)

> ⚠️ This may take 10–20 minutes on first install. The TTS package is large.

---

## Step 4 — First Run (Model Download)

The first time you run the server, it downloads the XTTS v2 model (~2GB):

```bash
python main.py
```

You will see:
```
Loading XTTS v2 model...
Loaded 72 speaker samples for voice cloning
Model loaded on cpu
INFO:     Uvicorn running on http://0.0.0.0:5003
```

> The model is cached after the first download — subsequent starts are fast.

---

## Step 5 — Verify It's Working

Open a browser and go to:
```
http://localhost:5003/health
```

You should see:
```json
{
  "status": "ok",
  "speaker_samples": 72,
  "device": "cpu",
  "cached_phrases": 0
}
```

---

## Step 6 — Connect to the Translator App

In your `.env.local` file, uncomment:
```
COQUI_TTS_URL=http://localhost:5003
```

The translator will now use your cloned Kikuyu voice for all TTS output.

---

## Voice Samples

The server automatically loads all WAV files from:
```
public/audio/chunks/
```

Plus the main training file:
```
public/audio/voice-training-1.wav
```

To improve the voice clone, add more clean WAV recordings to the chunks folder and restart the server.

---

## Stopping the Server

Press `Ctrl+C` in the terminal running `python main.py`.

To deactivate the virtual environment:
```bash
deactivate
```

---

## Troubleshooting

| Error | Fix |
|---|---|
| `ModuleNotFoundError: TTS` | Run `pip install -r requirements.txt` with venv active |
| `Speaker WAV not found` | Make sure `public/audio/voice-training-1.wav` exists |
| `CUDA not available` | Normal — runs on CPU. GPU is optional |
| Port 5003 already in use | Kill the existing process or change the port in `main.py` |
| Slow generation | Expected on CPU. Each phrase takes 5–15 seconds. Results are cached after first generation |

---

## GPU Acceleration (Optional)

If you have an NVIDIA GPU, install the CUDA version of PyTorch for much faster generation:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

Then restart the server — it will automatically detect and use the GPU.
