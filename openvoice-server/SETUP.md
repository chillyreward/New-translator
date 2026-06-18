# OpenVoice v2 Server — Setup

Voice conversion only — converts MMS Kikuyu audio to c-elo's voice.
No MeloTTS, no `av`, no C++ compiler required.

## Pipeline

```
Text → MMS TTS (Modal GPU, Kikuyu phonemes) → OpenVoice v2 (c-elo voice) → WAV
```

The Next.js `/api/speak` route calls MMS first, then sends that audio
as `source_audio` to this server's `/convert` endpoint. OpenVoice only
handles the voice conversion step.

## Install (first time only)

```bat
cd openvoice-server
setup.bat
```

What setup does:
1. Creates `venv311` (Python 3.11)
2. Installs PyTorch CPU build (~800 MB)
3. Installs FastAPI + soundfile
4. Installs OpenVoice v2 from GitHub (~50 MB clone, no compilation)

First `start.bat` run downloads OpenVoice v2 checkpoints automatically from the official Hugging Face repo (`myshell-ai/OpenVoiceV2`). The two files downloaded are `converter/config.json` and `converter/checkpoint.pth` (~500 MB total).

> **Note:** Speaker embedding extraction bypasses `se_extractor.get_se()` entirely and calls `tone_color_converter.extract_se()` directly. This avoids a bug in `se_extractor` where it passes `device="cuda"` to `faster-whisper` even on CPU-only machines, which would cause a crash at startup and on every `/convert` request.

## Run

```bat
start.bat
```

Server: http://localhost:5004

## Test

```
http://localhost:5004/health
```

Expected response:
```json
{
  "status": "ok",
  "engine": "openvoice-v2",
  "mode": "voice-conversion-only",
  "device": "cpu"
}
```

## API

### POST /convert

| Field | Type | Description |
|---|---|---|
| `source_audio` | file (WAV) | Audio to convert (from MMS or any TTS) |
| `text` | string | Ignored — kept for API compatibility |
| `speed` | float | Ignored — speed is controlled at MMS stage |

Returns: `audio/wav` — source audio re-voiced as c-elo

### GET /health
### DELETE /cache — clears cached conversions

## Reference voice

Located at `../chatterbox-server/celo_reference.wav` (24kHz mono WAV).
Speaker embedding is extracted once at startup.

To swap voices, replace `celo_reference.wav` and restart.

## GPU acceleration (optional)

To use CUDA instead of CPU:
1. Replace the torch install in `setup.bat`:
   ```
   pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```
2. Restart — the server auto-detects CUDA.
