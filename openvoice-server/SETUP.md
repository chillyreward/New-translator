# OpenVoice v2 Server — Setup

Zero-shot voice conversion — converts any TTS audio to c-elo's voice using
the 30-second reference clip. No training required.

## Install

```bash
cd openvoice-server
py -3.11 -m venv venv311
venv311\Scripts\activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('averaged_perceptron_tagger_eng')"
```

First run downloads ~500MB OpenVoice v2 checkpoints automatically.

## Run

```bash
venv311\Scripts\activate
python main.py
```

Server: http://localhost:5004

## Test

```
http://localhost:5004/health
```

## How it works

1. Text input → MeloTTS generates base English speech
2. OpenVoice v2 extracts speaker embedding from base speech
3. Converts speaker to match c-elo's voice (from celo_reference.wav)
4. Returns 24kHz WAV

For best Kikuyu results, the route sends MMS audio as source_audio
so Kikuyu phonemes are preserved and only the voice is changed.
