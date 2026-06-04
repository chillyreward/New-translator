# Kikuyu Text-to-Speech App

A Next.js application that translates English or Kiswahili text to Kikuyu (Gikuyu) and speaks it aloud. Features multiple AI-powered pipelines for translation and speech synthesis.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chillyreward/Gikuyu-Demo)

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
2. **Helsinki Translation Server** (`localhost:5005`) — `Helsinki-NLP/opus-mt-en-kik` MarianMT model with disk cache (runs in parallel with GPT-4o)
3. **TranslateGemma Server** (`localhost:5006`) — `gateremark/kikuyu_translategemma_12b_merged_V2`, a 12B-parameter model fine-tuned specifically for English/Swahili → Kikuyu translation, proxied through the HuggingFace Inference API (no local GPU required)
4. **GPT-4o direct** — fallback via `OPENAI_API_KEY` when the local server is unavailable

> **Note:** The pre-recorded audio library check has been removed from the translation pipeline. Audio playback for known phrases is handled separately on the `/speak` page rather than as part of the `/api/translate` response.

Supports English and Kiswahili as source languages.

### 🔊 Text-to-Speech Pipeline (priority order)
1. **MMS-TTS** (`localhost:5004`) — best native Kikuyu pronunciation, using the `swanapole/kikuyu` VITS model (fine-tuned MMS-TTS Kikuyu). Long inputs are automatically split into chunks of up to 100 characters at sentence, clause, or word boundaries, synthesized individually, and concatenated with 180 ms silence between chunks for natural pacing.
2. **Coqui XTTS v2** (`localhost:5003`) — voice cloning fallback
3. **OpenAI TTS** — cloud fallback using `OPENAI_API_KEY`

Downloaded audio files are always saved as `.wav` regardless of which TTS provider served the audio.

### 📺 YouTube Pipeline
1. Download audio from YouTube using yt-dlp
2. Transcribe to English using OpenAI Whisper
3. Translate to Kikuyu via the translation pipeline above
4. Speak in Kikuyu via the TTS pipeline above

### 🎛️ Translation Card Actions
After translation, the card exposes these per-panel actions:

| Action | Source panel | GPT-4o panel | Helsinki panel | Bottom bar |
|--------|:-----------:|:------------:|:--------------:|:----------:|
| Open in Speak page | — | ✓ | ✓ | ✓ |
| Copy to clipboard | ✓ | ✓ | ✓ | — |
| Save phrase | — | — | — | ✓ |
| Share (Web Share API) | — | — | — | ✓ |
| Voice input (mic) | ✓ | — | — | — |
| YouTube transcript | ✓ | — | — | — |
| Video upload | ✓ | — | — | — |

**TTS behaviour change:** Inline audio playback has been removed from the translation card. The volume/speak icons now navigate to `/speak?q=<encoded text>` so the dedicated Speak page handles all TTS. This applies to both the GPT-4o and Helsinki output panels, as well as the **Speak** button in the bottom action bar.

**Sidebar speak behaviour:** The `handleSpeak` function in `components/Sidebar.tsx` no longer accepts a pre-recorded `audioUrl` shortcut. All speak actions from the Sidebar now go through the `/api/speak` TTS pipeline (MMS → Coqui → OpenAI) regardless of whether a pre-recorded file exists for the phrase.

> **Note:** The language swap button has been removed. Gikuyu is always the target language and cannot be swapped with the source.

---

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.11+ (for local servers)
- yt-dlp (for YouTube feature)

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Local server URLs (optional — app falls back to cloud APIs if not running)
PIPER_TTS_URL=http://localhost:5002
COQUI_TTS_URL=http://localhost:5003
MMS_TTS_URL=http://localhost:5004
HELSINKI_TRANSLATE_URL=http://localhost:5005
GEMMA_TRANSLATE_URL=http://localhost:5006
```

### 3. (Optional) Start local servers

Each server lives in its own directory with a `requirements.txt`.

#### Helsinki Translation Server (MarianMT model)

Provides cached English→Kikuyu translation using the `Helsinki-NLP/opus-mt-en-kik` MarianMT model. The first run downloads ~300 MB of model weights; subsequent runs load from the local Hugging Face cache. No API key required.

```bash
cd helsinki-server
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5005
```

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

#### MMS-TTS Server

Provides native Kikuyu speech synthesis using the `gateremark/kikuyu-tts-v1` VITS model (fine-tuned MMS-TTS Kikuyu). Before synthesis, input text is run through a **pronunciation normalizer** (`normalize_pronunciation`) that:

- Strips extra whitespace and ensures sentence-ending punctuation so the chunker splits correctly
- Inserts comma pauses after common Kikuyu conjunctions (`na`, `nĩ`, `nĩguo`, etc.) when followed by a capitalised word, producing more natural rhythm
- Normalizes diacritics to NFC Unicode (ensures `ĩ` and `ũ` are canonical)
- Strips characters outside the Kikuyu alphabet and standard punctuation that the tokenizer cannot handle

After normalization, long inputs are automatically chunked (≤100 chars each) at sentence/clause/word boundaries, synthesized in sequence, and joined with 180 ms silence for natural pacing. The cache key is derived from the **normalized** text, so equivalent inputs with minor whitespace or encoding differences share the same cache entry. Results are cached to disk.

```bash
cd mms-server
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5004
```

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/synthesize` | Synthesize Kikuyu text to WAV audio |
| `GET` | `/health` | Server status, model, device, cache count, and `max_chunk_chars` |
| `DELETE` | `/cache` | Clear the on-disk WAV cache |

**`GET /health` response includes:**
```json
{
  "status": "ok",
  "model": "gateremark/kikuyu-tts-v1",
  "device": "cpu",
  "cached_phrases": 12,
  "max_chunk_chars": 100
}
```

#### Piper TTS Server

```bash
cd piper-server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5002
```

#### Other local servers

See `coqui-server/`, `mms-server/`, `chatterbox-server/`, and `gemma-translate-server/` for their respective setup instructions.

#### TranslateGemma Translation Server

Provides high-quality English/Swahili → Kikuyu translation using `gateremark/kikuyu_translategemma_12b_merged_V2` via the **HuggingFace Inference API**. No local GPU or model download required — the server acts as a thin proxy.

**Requirements:**
- A HuggingFace account and access token ([huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))
- Set `HUGGINGFACE_API_KEY` in your `.env.local` (free tier: ~1000 requests/day)

```bash
cd gemma-translate-server
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5006
```

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/translate` | Translate English or Swahili text to Kikuyu |
| `GET` | `/health` | Server status, mode, token presence, and cache count |

> The `/cache DELETE` endpoint has been removed in the current version.

**`POST /translate` request body:**
```json
{ "text": "Good morning", "source_lang": "en" }
```
`source_lang` is `"en"` (default) or `"sw"`.

**Response:**
```json
{ "translation": "Wega wa rũciinĩ", "cached": false }
```

**`GET /health` response:**
```json
{
  "status": "ok",
  "model": "gateremark/kikuyu_translategemma_12b_merged_V2",
  "mode": "huggingface-inference-api",
  "token_set": true,
  "cached_translations": 42
}
```

> Translations are cached to `.translation-cache.json` inside `gemma-translate-server/`. Identical source-language + text pairs are served from cache without making a new API call.

**HuggingFace API endpoint:** The server uses the standard text-generation endpoint (`https://api-inference.huggingface.co/models/{MODEL_ID}`) with a plain text prompt rather than the chat completions endpoint. This is because the custom `source_lang_code`/`target_lang_code` content type used by the model's chat template is not supported by the HF Inference API. The prompt is constructed as:

```
Translate the following English text to Kikuyu. Return only the Kikuyu translation, nothing else.

{text}
```

The request timeout is **60 seconds** (the 13B model can be slow on cold starts). If the model is still loading on HF servers you will receive a `503` with the message `"Model is loading on HF servers — retry in 20 seconds"`.

### 4. Install yt-dlp (for YouTube feature)

```bash
# Windows
winget install yt-dlp
# Or download from: https://github.com/yt-dlp/yt-dlp/releases
```

---

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Keys

| Key | Where to get it |
|-----|----------------|
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `ELEVENLABS_API_KEY` | [ElevenLabs](https://elevenlabs.io/) |
| `HUGGINGFACE_API_KEY` | [HuggingFace Settings](https://huggingface.co/settings/tokens) — required for TranslateGemma server |

---

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS 4
- **Translation**: GPT-4o (via Helsinki server or direct API)
- **Speech Recognition**: OpenAI Whisper API / Browser Web Speech API
- **Text-to-Speech**: Meta MMS-TTS / Coqui XTTS v2 / OpenAI TTS / ElevenLabs
- **YouTube Processing**: yt-dlp + Whisper

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── speak/               # TTS endpoint (MMS → Coqui → OpenAI)
│   │   ├── transcribe/          # Whisper STT endpoint
│   │   ├── translate/           # Translation endpoint (local → Helsinki → GPT-4o)
│   │   ├── tts/                 # Alternative TTS endpoint
│   │   └── youtube-transcript/  # YouTube download + transcription
│   ├── page.tsx                 # Landing page
│   └── layout.tsx               # App layout
├── dataset/
│   ├── download_datasets.py     # Downloads WAXAL, evie-8, and project chunks
│   ├── prepare.py               # Validates, resamples, and splits into train/val
│   ├── manifest.json            # Generated: combined audio + transcript index
│   └── raw/                     # Generated: downloaded audio files
├── helsinki-server/             # Helsinki-NLP translation server (localhost:5005)
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

## Dataset & Fine-tuning

The `dataset/` folder contains a pipeline for assembling a Kikuyu TTS training corpus and preparing it for model fine-tuning.

### Sources

| Source | Description | Size |
|--------|-------------|------|
| `google/WaxalNLP` (`kik_tts` subset) | Single-speaker TTS recordings from HuggingFace | ~2,030 clips |
| `evie-8/kikuyu-data` (`new_duration_30s` config) | Community speech recordings streamed from HuggingFace | Up to 322+ hours |
| `public/audio/chunks/` | Existing project recordings with transcripts from `lib/dictionary.ts` | ~80 clips |

### Prerequisites

```bash
pip install datasets soundfile numpy tqdm resampy
```

> **Audio backend:** `download_datasets.py` sets `DATASETS_AUDIO_BACKEND=soundfile` at startup so the `datasets` library uses `soundfile` for audio decoding instead of `torchcodec`. This avoids a hard dependency on PyTorch during the download step. No extra configuration is required.

For the evie-8 dataset you must first accept the dataset terms on HuggingFace, then authenticate:

```bash
huggingface-cli login
```

### Step 1 — Download

```bash
cd dataset

# Download everything (recommended)
python download_datasets.py --all

# Or selectively:
python download_datasets.py --chunks            # existing project clips only
python download_datasets.py --waxal             # Google WAXAL only
python download_datasets.py --evie8             # evie-8 only (default: 5000 samples)
python download_datasets.py --evie8 --max-evie8 2000  # limit sample count
```

**Outputs:**
- `dataset/raw/waxal/wavs/` — WAXAL audio files
- `dataset/raw/evie8/wavs/` — evie-8 audio files
- `dataset/manifest.json` — combined record index (file path + transcript + source)

All audio is resampled to **22050 Hz mono WAV**. If `resampy` is not installed, a linear interpolation fallback is used automatically.

### Step 2 — Prepare

```bash
python dataset/prepare.py
```

Reads `manifest.json`, validates each clip, and produces an LJSpeech-format dataset:

- Filters clips shorter than **0.5s** or longer than **15s**
- Normalizes all audio to 22050 Hz mono 16-bit WAV
- Splits into **95% train / 5% validation**

**Outputs:**
- `dataset/prepared/wavs/` — normalized audio files
- `dataset/prepared/metadata.csv` — full dataset
- `dataset/prepared/train.csv` — training split
- `dataset/prepared/val.csv` — validation split

### Step 3 — Fine-tune

Upload `dataset/prepared/` to Google Drive and run the fine-tuning notebook (`finetune.ipynb`).

---

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
