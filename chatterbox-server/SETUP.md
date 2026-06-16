# Chatterbox TTS Server — Setup

Resemble AI Chatterbox — 24kHz, voice-cloned from c-elo reference audio.
Outperforms ElevenLabs in quality. Zero-shot voice cloning, no fine-tuning needed.

## Install

```bash
cd chatterbox-server
venv311\Scripts\activate
pip install -r requirements.txt
```

> First run downloads ~2GB model weights from HuggingFace automatically.

## Reference Voice

`celo_reference.wav` is already included — converted from c-elo's WhatsApp audio at 24kHz.
To update with a new reference voice:
```bash
ffmpeg -i "new_voice.mp4" -acodec pcm_s16le -ar 24000 -ac 1 celo_reference.wav -y
```

## Run

```bash
python main.py
```

Server: http://localhost:5003

## Test

```
http://localhost:5003/health
```

Should return:
```json
{
  "status": "ok",
  "engine": "chatterbox-tts",
  "sample_rate": 24000,
  "device": "cuda"  
}
```

## Quality Settings

In `/synthesize` POST body:
- `speed`: 0.6=slow, 0.75=normal, 0.9=fast (default: 0.75)
- `exaggeration`: 0=neutral, 0.3=slight emotion, 1.0=very expressive (default: 0.3)
- `cfg_weight`: 0.5=balanced, 1.0=strict voice clone (default: 0.5)

## TTS Priority Chain

1. **Modal MMS** (GPU, 16kHz→48kHz upsampled) — best Kikuyu phonemes
2. **Chatterbox** (local, 24kHz native) — best voice quality, c-elo sound
3. **OpenAI TTS** — reliable cloud fallback

## Notes

- GPU (CUDA): ~1-3s per phrase
- CPU: ~10-30s per phrase  
- Results cached in `public/audio/cache/`
- On Jambo server: CUDA available → GPU mode auto-detected
