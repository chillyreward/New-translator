# NeuroGrowthTech — AI Marketing for African Languages

A Next.js application that translates English or Kiswahili text to Kikuyu (Gikuyu) and speaks it aloud. Branded as **NeuroGrowthTech**, it provides AI-powered translation and marketing tools to reach Kikuyu, Swahili, and African language speakers with intelligent content.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chillyreward/Gikuyu-Demo)

**Site:** [neurogrowthtech.com](https://neurogrowthtech.com)

## Features

### 🖥️ TranslationCard Component
The main UI is built around `components/TranslationCard.tsx` — a two-panel card with source input on the left and dual Gikuyu output (GPT-4o and Helsinki-NLP) on the right.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialText` | `string` | `""` | Pre-fills the source text area on mount |

**Source language options:** Auto-detect · English · Kiswahili

**Loading states tracked internally:** `idle` · `translating` · `listening` · `transcribing` · `youtube` · `video`

> **Note:** The `speaking` loading state has been removed. TTS is no longer triggered inline after translation. Use the **Speak** button or the volume icons to open the `/speak` page instead.

### 🎙️ Multiple Input Methods
- **Text Input**: Type or paste text directly (up to 5000 characters)
- **Voice Input**: Record via microphone → transcribed by OpenAI Whisper (`/api/transcribe`)
- **YouTube Pipeline**: Paste a YouTube URL → audio downloaded with yt-dlp → transcribed by Whisper (`/api/youtube-transcript`)
- **Video Upload**: Upload a local video file → audio extracted and transcribed (`/api/video-transcript`)

### 🔄 Translation Pipeline (priority order)
1. **Local phrase dictionary** — fast in-process lookup for common expressions
2. **TranslateGemma-4B V7** (optional) — merged Kikuyu model (`gateremark/kikuyu_translategemma_4b_v7_highrank_rslora`) via Modal serverless GPU
3. **GPT-4o** (`OPENAI_API_KEY`) — best-quality AI translation fallback

> **Note:** The pre-recorded audio library check has been removed from the translation pipeline. Audio playback for known phrases is handled separately on the `/speak` page rather than as part of the `/api/translate` response.

Supports English and Kiswahili as source languages.


Downloaded audio files are always saved as `.wav` regardless of which TTS provider served the audio.

### 📺 YouTube Pipeline
1. Download audio from YouTube using yt-dlp
2. Transcribe to English using OpenAI Whisper
3. Translate to Kikuyu via the translation pipeline above
4. Speak in Kikuyu via the TTS pipeline above

### 🎬 YouTube Dubbing (`/dub`)
Full end-to-end video dubbing into Kikuyu. Available at `/dub`.

**UI features:**
- **YouTube tab**: Paste a YouTube URL and click "Dub Video" to process a remote video
- **Upload tab**: Upload a local video file (MP4, MOV, AVI, MKV, WebM) and click "Dub Video"
- **Progress indicator**: Displays the current processing stage while dubbing is in progress
- **Error display**: Shows a descriptive error message if dubbing fails
- **Result panel**: Inline video player for the dubbed output with a download button
- **Transcript panel**: Scrollable list of all translated segments showing the original text, Kikuyu translation, and timestamp for each segment

The dubbing feature uses two separate API routes depending on input type:

#### `POST /api/dub` — YouTube URL

**Pipeline:**
1. Download the YouTube video (best MP4 quality) using yt-dlp
2. Extract audio as 16 kHz mono WAV using ffmpeg
3. Transcribe with OpenAI Whisper (`verbose_json` with segment timestamps); audio files over 24 MB are split into 10-minute chunks automatically
4. Translate each segment to Kikuyu using GPT-4o
5. Synthesize each Kikuyu segment via Modal MMS TTS (if `MMS_TTS_URL` is set) or OpenAI TTS (`onyx` voice, 0.85× speed) as fallback
6. Mix dubbed segments into a full-length audio track in pure Node.js — each segment's 16-bit PCM is copied into a silent buffer at the correct timestamp offset, then a WAV header is written. This avoids ffmpeg command-line length limits
7. Mux the dubbed audio track with the original (muted) video using ffmpeg

**Request:**
```json
{ "youtubeUrl": "https://www.youtube.com/watch?v=..." }
```

#### `POST /api/dub-upload` — Local file upload

**Pipeline:** Same as above (steps 2–7), but accepts a `multipart/form-data` upload instead of downloading from YouTube.

**Request:** `multipart/form-data` with a `video` field containing the file.

**Audio mixing (upload route):** Uses an ffmpeg `adelay`/`amix` filter chain to place each segment at its correct timestamp.

#### Shared response format

Both endpoints return the same JSON shape:

```json
{
  "success": true,
  "videoUrl": "/dubbed/dubbed_<timestamp>.mp4",
  "segments": [
    { "start": 0.0, "end": 3.2, "original": "Hello everyone", "kikuyu": "Wee mwega inyui nyote" }
  ]
}
```

**Output files** are saved to `public/dubbed/` and served statically. Temp files (raw video, audio, per-segment WAVs, and the mixed `dubbed_audio.wav`) are cleaned up after each run.

**Requirements:**
- `yt-dlp` installed and on PATH (or at `C:\Users\<user>\AppData\Roaming\Python\Python314\Scripts\yt-dlp.exe` on Windows)
- `ffmpeg` installed and on PATH
- `OPENAI_API_KEY` (required — used for Whisper transcription, GPT-4o translation, and TTS fallback)
- `MMS_TTS_URL` (optional — preferred TTS for best native Kikuyu quality; falls back to OpenAI TTS if unavailable)

### 🎛️ Translation Card Actions
After translation, the card exposes these per-panel actions:


**TTS behaviour change:** Inline audio playback has been removed from the translation card. The volume/speak icons now navigate to `/speak?q=<encoded text>` so the dedicated Speak page handles all TTS. This applies to both the GPT-4o and Helsinki output panels, as well as the **Speak** button in the bottom action bar.

**Sidebar speak behaviour:** The `handleSpeak` function in `components/Sidebar.tsx` no longer accepts a pre-recorded `audioUrl` shortcut. All speak actions from the Sidebar now go through the `/api/speak` TTS pipeline (MMS → OpenAI, with Coqui as an intermediate step if `COQUI_TTS_URL` is set) regardless of whether a pre-recorded file exists for the phrase.

> **Note:** The language swap button has been removed. Gikuyu is always the target language and cannot be swapped with the source.

---

## Setup


### 1. Install frontend dependencies

```bash
npm install
```

### 3. (Optional) Start local servers

Each server lives in its own directory with a `requirements.txt`.

#### Helsinki Translation Server (MarianMT model)

Provides cached English→Kikuyu translation using the `Helsinki-NLP/opus-mt-en-kik` MarianMT model. The first run downloads ~300 MB of model weights; subsequent runs load from the local Hugging Face cache. No API key required.


**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/translate` | Translate English text to Kikuyu |
| `GET` | `/health` | Server status, model name, and cache size |
| `DELETE` | `/cache` | Clear the on-disk translation cache |

**`POST /translate` request body:**
```json
{ "text": "Good morning" }
```
**Response:**
```json
{ "translation": "Wega wa rũciinĩ", "cached": true }
```

> **Note:** Translations are cached to `.translation-cache.json` inside `helsinki-server/`. The `/health` endpoint reports how many entries are currently cached.


#### TranslateGemma-4B V7 — Modal Serverless GPU (Recommended)

`modal-translate/deploy.py` deploys `gateremark/kikuyu_translategemma_4b_v7_highrank_rslora` — a **fully merged** 5B-parameter model — to a Modal T4 GPU. This is the recommended way to run the Gemma translation tier — no local GPU required, and the model is cached in a Modal Volume after the first cold start.

Unlike the previous version, this is a merged model and does **not** require PEFT or a separate base model. The model is loaded directly via `AutoModelForCausalLM.from_pretrained` with `bfloat16` precision. Generation uses greedy decoding (`do_sample=False`) for deterministic output.

**Prerequisites:**
```bash
pip install modal
modal setup          # authenticate with Modal
```

You also need a Modal secret named `huggingface-secret` containing your HuggingFace token as `HF_TOKEN`:
```bash
modal secret create huggingface-secret HF_TOKEN=hf_...
```

**Deploy:**
```bash
py -3.11 -m modal deploy modal-translate/deploy.py
```

Modal will print your endpoint URL. Add it to `.env.local`:
```
GEMMA_TRANSLATE_URL=https://<your-workspace>--kikuyu-translate-kikuyu-translate-app.modal.run
```

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/translate` | Translate English/Kiswahili text to Kikuyu |
| `GET` | `/health` | Server status and model name |

**`POST /translate` request body:**
```json
{ "text": "I want milk", "source_lang": "en" }
```
**Response:**
```json
{ "translation": "Nĩndagĩa mĩĩ" }
```

`source_lang` accepts `"en"` (default) or `"sw"` for Kiswahili input.

**Container settings:** T4 GPU · 120s scale-down window (`scaledown_window=120`) · 900s timeout · merged model cached in Modal Volume under `/model/kikuyu-4b-v7`. Cache presence is verified by checking for `model-00001-of-00002.safetensors` before downloading.

**Tokenizer:** The server uses `AutoTokenizer` directly (not `Gemma3Processor`). `pad_token` is set to `eos_token` when absent, and `padding_side` is set to `"left"`. The chat template is applied via `tokenizer.apply_chat_template` which uses the format embedded in the tokenizer config.

**Client-side timeout:** The Next.js `/api/translate` route waits up to **10 minutes** (600s) for a response from `GEMMA_TRANSLATE_URL`. This accommodates Modal cold starts where the container must download and load the merged model before serving the first request.

**Local test (without deploying):**
```bash
py -3.11 -m modal run modal-translate/deploy.py
```

#### Kikuyu MMS TTS — Modal Serverless GPU (Recommended for TTS)

`modal-tts/deploy.py` deploys the `gateremark/kikuyu-tts-v1` fine-tuned MMS TTS model to a Modal A10G GPU. This is the recommended way to run native Kikuyu speech synthesis — no local GPU required, and the model is cached in a Modal Volume after the first cold start.

**Prerequisites:**
```bash
pip install modal
modal setup          # authenticate with Modal
```

You also need a Modal secret named `huggingface-secret` containing your HuggingFace token as `HF_TOKEN`:
```bash
modal secret create huggingface-secret HF_TOKEN=hf_...
```

**Deploy:**
```bash
py -3.11 -m modal deploy modal-tts/deploy.py
```

Modal will print your endpoint URL. Add it to `.env.local`:
```
MMS_TTS_URL=https://<your-workspace>--kikuyu-tts-app.modal.run
```

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/synthesize` | Synthesize Kikuyu text to WAV audio |
| `GET` | `/health` | Server status, model name, and platform |

**`POST /synthesize` request body:**
```json
{ "text": "Wĩ mwega?" }
```
**Response:** Raw `audio/wav` bytes.

**Container settings:** T4 GPU · 2-minute scale-down window (`scaledown_window=120`) · 120s timeout · model cached in a Modal Volume.

**Features:**
- Long text is automatically split into sentence/clause chunks (≤100 chars each) with 180ms silence between them for natural cadence
- Synthesized audio is cached by content hash — repeated requests are served instantly from the cache volume

**`/api/speak` client-side timeout:** The Next.js route waits up to **150 seconds** for a response from `MMS_TTS_URL`, giving Modal containers enough time to cold-start (~60–120s) before falling through to Coqui (if `COQUI_TTS_URL` is set) and then OpenAI TTS. All non-error responses from MMS are returned as-is without a minimum byte size check.

**Local test (without deploying):**
```bash
py -3.11 -m modal run modal-tts/deploy.py
```
Saves output to `test_output.wav`.

#### Other local servers

See `coqui-server/`, `mms-server/`, and `chatterbox-server/` for their respective setup instructions.

### 4. Install yt-dlp (for YouTube feature)


---

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Keys

| Key | Required | Where to get it |
|-----|----------|----------------|
| `OPENAI_API_KEY` | Yes | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `ELEVENLABS_API_KEY` | Optional | [ElevenLabs](https://elevenlabs.io/) |
| `GEMMA_TRANSLATE_URL` | Optional | Modal deploy URL (see TranslateGemma-12B setup above) |
| `MMS_TTS_URL` | Optional | Modal deploy URL (see Kikuyu MMS TTS setup above) |

---

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS 4
- **Translation**: GPT-4o + TranslateGemma-4B V7 merged model (Modal serverless T4 GPU)
- **Speech Recognition**: OpenAI Whisper API / Browser Web Speech API
- **Text-to-Speech**: Meta MMS-TTS (Modal serverless GPU) / Coqui XTTS v2 / OpenAI TTS / ElevenLabs
- **YouTube Processing**: yt-dlp + Whisper

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── dub/                 # YouTube dubbing pipeline (yt-dlp → Whisper → GPT-4o → TTS → Node.js PCM mix → ffmpeg)
│   │   ├── dub-upload/          # File upload dubbing pipeline (same as dub/ but accepts multipart/form-data video)
│   │   ├── speak/               # TTS endpoint (MMS → Coqui? → OpenAI)
│   │   ├── transcribe/          # Whisper STT endpoint
│   │   ├── translate/           # Translation endpoint (local → GPT-4o)
│   │   ├── tts/                 # Alternative TTS endpoint
│   │   └── youtube-transcript/  # YouTube audio download + Whisper transcription
│   ├── dub/                     # YouTube Dubbing UI page
│   ├── page.tsx                 # Landing page
│   └── layout.tsx               # App layout
├── modal-translate/             # Modal serverless GPU deployment for TranslateGemma-4B V7
│   └── deploy.py                #   Deploy: py -3.11 -m modal deploy modal-translate/deploy.py
├── modal-tts/                   # Modal serverless GPU deployment for Kikuyu MMS TTS
│   └── deploy.py                #   Deploy: py -3.11 -m modal deploy modal-tts/deploy.py
├── piper-server/                # Piper TTS server (localhost:5002)
├── coqui-server/                # Coqui XTTS v2 server (localhost:5003)
├── mms-server/                  # Meta MMS-TTS server (localhost:5004)
├── lib/
│   ├── dictionary.ts            # Phrase dictionary + pre-recorded audio map
│   ├── kikuyu-dictionary.ts     # Structured Kikuyu dictionary with phonetics
│   ├── localTranslate.ts        # In-process phrase/word lookup
│   ├── elevenlabs.ts            # ElevenLabs TTS client
│   └── aiTranslate.ts           # Direct OpenAI translation helper
├── .env.local                   # Environment variables (not committed)
└── README.md
```

## SEO & Metadata

Configured in `app/layout.tsx` via Next.js `Metadata`:

| Field | Value |
|-------|-------|
| Title | NeuroGrowthTech — AI Marketing for African Languages |
| Description | AI-powered translation and marketing tools for African language speakers |
| Site URL | https://neurogrowthtech.com |
| Open Graph | Enabled (`og:title`, `og:description`, `og:url`, `og:type`) |
| Twitter Card | `summary_large_image` |
| Robots | `index: true`, `follow: true` (including Googlebot) |
| Icons | `/icon.png` (favicon, shortcut, Apple touch) |

Keywords targeted: `NeuroGrowthTech`, `AI marketing Africa`, `Kikuyu translation`, `African language AI`, `Gikuyu translator`, `AI translation Kenya`, `Kiswahili translation`, `neuro marketing technology`.

---

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
