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

## API Endpoints

### `POST /synthesize`
Generate speech from text using the c-elo reference voice.

Request body (JSON):
- `text`: string — text to synthesize
- `speed`: 0.6=slow, 0.75=normal, 0.9=fast (default: 0.75)
- `exaggeration`: 0=neutral, 0.3=slight emotion, 1.0=very expressive (default: 0.3)
- `cfg_weight`: 0.5=balanced, 1.0=strict voice clone (default: 0.5)
- `use_cache`: boolean — skip synthesis if cached WAV exists (default: true)

Returns: `audio/wav` — 24kHz PCM_16 WAV

### `GET /health`
Returns server status, model info, device, and cached phrase count.

### `DELETE /cache`
Clears all cached synthesized WAV files from `public/audio/cache/`.

---

### `POST /synthesize-with-reference`
Synthesize text using a custom reference audio for voice cloning. Falls back to `celo_reference.wav` if no reference is uploaded.

Designed for the **MMS→Chatterbox two-stage pipeline**: MMS generates phoneme-correct Kikuyu audio, then this endpoint re-generates the same text in the target speaker's voice.

Request: `multipart/form-data`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | string | **required** | Text to synthesize |
| `reference_audio` | file (WAV) | optional | Override voice reference; falls back to `celo_reference.wav` |
| `speed` | float | `0.75` | Speaking pace (0.5–1.5) |
| `exaggeration` | float | `0.3` | Emotion expressiveness (0.0–1.0) |
| `cfg_weight` | float | `0.5` | Voice similarity to reference (0.0–1.0) |

Returns: `audio/wav` — 24 kHz PCM_16 WAV

Cache is keyed on `(text, reference basename, speed, exaggeration)`.

---

### `POST /convert`
> **Note:** This endpoint always returns HTTP 400. Chatterbox is a generative TTS model and cannot perform direct voice conversion (pitch/timbre transplant). Use `POST /synthesize` or `POST /synthesize-with-reference` instead.

The endpoint exists to document the intended MMS→Chatterbox pipeline and provides a clear error message guiding callers to the correct endpoint.

## TTS Priority Chain

1. **Modal MMS** (GPU, 16kHz→48kHz upsampled) — best Kikuyu phonemes
2. **Chatterbox** (local, 24kHz native) — best voice quality, c-elo sound
3. **OpenAI TTS** — reliable cloud fallback

## Notes

- GPU (CUDA): ~1-3s per phrase
- CPU: ~10-30s per phrase  
- Results cached in `public/audio/cache/`
- On Jambo server: CUDA available → GPU mode auto-detected
