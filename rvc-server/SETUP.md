# RVC Server — Setup

Retrieval-based Voice Conversion — converts MMS audio to c-elo's voice
using a trained RVC model.

Uses **rvc-python** + **fairseq-fixed** (pre-built wheel — no source compile on Windows).

> **Why not `pip install -r requirements.txt`?**  
> `rvc-python` depends on `fairseq`, which fails to build from source on Windows
> (missing `version.txt` in cloned repos, symlink privilege errors).  
> `do_install.py` works around this by installing `fairseq-fixed` first (a pre-packaged
> fork that ships a proper wheel for Python 3.11/3.12), then installs `rvc-python`
> with `--no-deps` so pip won't attempt a second fairseq source build.

## Install

```bat
cd rvc-server
py -3.11 -m venv venv311
venv311\Scripts\python.exe do_install.py
```

Installation steps performed by `do_install.py`:

1. Upgrade `pip`, `setuptools`, `wheel`
2. Install PyTorch 2.6.0 (CPU) + torchaudio
3. Install FastAPI, uvicorn, soundfile, numpy, pydantic, python-multipart
4. Install `fairseq-fixed` (pre-built wheel, no source compile)
5. Install pitch extraction libs: praat-parselmouth, pyworld, faiss-cpu
6. Install `rvc-python` with `--no-deps`
7. Install remaining rvc-python runtime deps: ffmpeg-python, librosa, scipy, tqdm, numba
8. Install deps skipped by `--no-deps`: av, loguru, torchcrepe, omegaconf==2.3.0

## Run

```bat
venv311\Scripts\python.exe main.py
```

Server: http://localhost:5005

## Pipeline

```
Text → MMS TTS (Kikuyu phonemes) → RVC (c-elo voice) → 48kHz WAV
```

## Model Status

On first run, the server starts in **passthrough mode** — it returns the
input audio unchanged until a model is loaded.

### Use a pretrained placeholder

The server auto-downloads `Aria_En_v2.pth` (clean female voice) if no model
file is found at startup. It won't sound like c-elo but demonstrates the
full pipeline.

### Train a custom c-elo model (recommended)

1. Upload `chatterbox-server/celo_reference.wav` (or the full 7.4 min audio) to Colab
2. Open: https://colab.research.google.com/github/RVC-Project/Retrieval-based-Voice-Conversion-WebUI/blob/main/Retrieval_based_Voice_Conversion_WebUI.ipynb
3. Train for 300–500 steps (~20 minutes on T4)
4. Download `celo_voice.pth` and `celo_voice.index`
5. Place them in `rvc-server/models/` and `rvc-server/index/`
6. Restart the server — it auto-loads the model

## Set custom model path via env

```
RVC_MODEL_PATH=C:\path\to\your\model.pth
RVC_INDEX_PATH=C:\path\to\your\model.index
```

## Hot-reload model without restart

```bash
curl -X POST http://localhost:5005/load_model \
  -F "model_path=./models/celo_voice.pth" \
  -F "index_path=./index/celo_voice.index"
```

Returns `503` if `rvc-python` is not installed.

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/convert` | Convert uploaded WAV to RVC target voice |
| `GET` | `/health` | Server status, model loaded, device |
| `POST` | `/load_model` | Hot-reload a model without restarting |
| `DELETE` | `/cache` | Clear cached conversion results |

### POST /convert

Form fields:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `audio` | file | required | WAV audio file |
| `pitch_shift` | int | `0` | Semitone shift |
| `index_rate` | float | `0.75` | Index influence (0–1) |
| `f0_method` | string | `"rmvpe"` | Pitch extraction method |

Returns WAV audio (`audio/wav`). Results are cached by MD5 hash + pitch.
