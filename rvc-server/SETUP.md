# RVC Server — Setup

Retrieval-based Voice Conversion — converts MMS audio to c-elo's voice
using a trained RVC model.

## Install

```bash
cd rvc-server
py -3.11 -m venv venv311
venv311\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
venv311\Scripts\activate
python main.py
```

Server: http://localhost:5005

## Model Status

On first run, the server starts in **passthrough mode** — it returns the
input audio unchanged until a trained model is loaded.

### Train a custom c-elo model (recommended)

Use the Colab notebook to train on the YouTube audio:

1. Upload `chatterbox-server/celo_reference.wav` (or the full 7.4min audio) to Colab
2. Open: https://colab.research.google.com/github/RVC-Project/Retrieval-based-Voice-Conversion-WebUI/blob/main/Retrieval_based_Voice_Conversion_WebUI.ipynb
3. Train for 300-500 steps (~20 minutes on T4)
4. Download: `celo_voice.pth` and `celo_voice.index`
5. Place them in `rvc-server/models/` and `rvc-server/index/`
6. Restart the server — it auto-loads the model

### Or use a pretrained model

The server auto-downloads `Aria_En_v2.pth` as a placeholder on first run.
It won't sound like c-elo but will demonstrate the voice conversion pipeline.

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

## Pipeline

```
Text → MMS TTS (Kikuyu phonemes) → RVC (c-elo voice) → 48kHz WAV
```
