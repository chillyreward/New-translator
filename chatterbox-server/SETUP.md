# Chatterbox TTS Server Setup

## Install

```bash
cd chatterbox-server
python -m venv venv311
venv311\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

Server starts on http://localhost:5003

## Test

```
http://localhost:5003/health
```

## Notes

- Uses voice-training-1.wav as primary reference
- Falls back to chunks if not found
- Results cached in public/audio/cache/
- Works on CPU (slow ~10-30s per phrase) or GPU (fast ~1-3s)
