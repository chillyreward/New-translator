# Coqui XTTS v2 — Setup & Training Guide

Fine-tunes XTTS v2 on your Kikuyu voice recordings using `dataset/metadata.csv`,
then serves the trained model via a FastAPI endpoint.

---

## Requirements

- Windows 10/11 (64-bit)
- Python 3.11 (not 3.12+ — TTS requires 3.11)
- At least 8GB RAM (16GB recommended for training)
- GPU optional but strongly recommended for training

---

## Step 1 — Create Virtual Environment

```bash
cd C:\Users\swanti\Desktop\Gikuyu-Demo\coqui-server
python -m venv venv311
venv311\Scripts\activate
```

---

## Step 2 — Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> First install takes 10–20 minutes. TTS + torch are large packages.

---

## Step 3 — Verify Your Dataset

Your `dataset/metadata.csv` should look like:

```
audio_file|text|speaker_name
chunks/hello.wav|kohana atia|speaker
chunks/how are you.wav|Uhoro waku|speaker
...
```

WAV files must exist in `../public/audio/chunks/`.

Check your dataset:
```bash
python -c "import csv; rows=list(csv.DictReader(open('dataset/metadata.csv'),delimiter='|')); print(f'{len(rows)} samples found')"
```

---

## Step 4 — Fine-Tune the Model

```bash
python train.py
```

What it does:
1. Copies WAVs from `public/audio/chunks/` into `dataset/audio/`
2. Splits metadata 90/10 into train/eval sets
3. Downloads base XTTS v2 (~2GB, cached after first run)
4. Fine-tunes for 30 epochs on your Kikuyu voice
5. Saves the best checkpoint to `./output/best_model.pth`

Training time:
- CPU: ~2–4 hours
- GPU (RTX 3060+): ~15–30 minutes

---

## Step 5 — Run the Server

```bash
python main.py
```

The server auto-detects `./output/best_model.pth`:
- If found → loads your **fine-tuned model**
- If not found → falls back to **zero-shot cloning** with base XTTS v2

Check which mode is active:
```
http://localhost:5003/health
```

```json
{
  "status": "ok",
  "mode": "fine-tuned",
  "speaker_samples": 72,
  "device": "cpu"
}
```

---

## Step 6 — Connect to the App

In `.env.local`:
```
COQUI_TTS_URL=http://localhost:5003
```

---

## Re-training

To retrain after adding more recordings to `public/audio/chunks/`:
1. Update `dataset/metadata.csv` with the new entries
2. Run `python train.py` again
3. Restart `python main.py`

---

## Troubleshooting

| Error | Fix |
|---|---|
| `ModuleNotFoundError: TTS` | Run `pip install -r requirements.txt` with venv active |
| `ModuleNotFoundError: trainer` | Run `pip install trainer>=0.0.36` |
| Missing WAV files | Check filenames in metadata.csv match files in `public/audio/chunks/` |
| CUDA out of memory | Reduce `batch_size` to 1 in `train.py` |
| Slow generation | Expected on CPU. Results are cached after first synthesis |

---

## GPU Acceleration

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```
