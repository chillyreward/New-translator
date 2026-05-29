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
1. **Pre-recorded audio library** — instant playback for known phrases, no API call needed
2. **Local phrase dictionary** — fast in-process lookup for common expressions
3. **Helsinki Translation Server** (`localhost:5005`) — `Helsinki-NLP/opus-mt-en-kik` MarianMT model with disk cache
4. **GPT-4o direct** — fallback via `OPENAI_API_KEY` when the local server is unavailable

Supports English and Kiswahili as source languages.

### 🔊 Text-to-Speech Pipeline (priority order)
1. **Meta MMS-TTS** (`localhost:5004`) — best native Kikuyu pronunciation
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

See `coqui-server/`, `mms-server/`, and `chatterbox-server/` for their respective setup instructions.

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
├── helsinki-server/             # GPT-4o translation server (localhost:5005)
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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
