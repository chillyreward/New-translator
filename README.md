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

### 🔊 Speak Page (`/speak`)
Dedicated text-to-speech page. Accepts an optional `?q=<encoded text>` query parameter to pre-fill the input from the translation card or sidebar.

**Features:**
- Textarea input for Kikuyu text (max 1,000 characters)
- **Playback speed selector**: Slow · Normal · Fast · Faster — maps to MMS VITS `speaking_rate` values (0.6 · 0.75 · 0.9 · 1.1). The selected speed is sent to `/api/speak` in the request body and also applied to the browser's `audio.playbackRate`
- Play / Stop controls with a VoiceOrb visualizer that animates during loading and playback
- Download button saves the synthesized audio as a `.wav` file
- Copy button copies the input text to clipboard
- TTS pipeline: MMS Kikuyu → OpenAI (same fallback chain as `/api/speak`)

### 🎙️ Multiple Input Methods
- **Text Input**: Type or paste text directly (up to 5000 characters)
- **Voice Input**: Record via microphone → transcribed by OpenAI Whisper (`/api/transcribe`)
- **YouTube Pipeline**: Paste a YouTube URL → audio downloaded with yt-dlp → transcribed by Whisper (`/api/youtube-transcript`)
- **Video Upload**: Upload a local video file → audio extracted and transcribed (`/api/video-transcript`)

### 🔄 Translation Pipeline (priority order)
1. **TranslateGemma-4B V7** (primary) — merged Kikuyu model (`gateremark/kikuyu_translategemma_4b_v7_highrank_rslora`) via Modal serverless GPU. Used for all requests including `answer` mode. Output is returned as-is to preserve native diacritics (ĩ, ũ).
2. **GPT-4o** (`OPENAI_API_KEY`) — fallback used only when Gemma is unreachable or returns an empty/invalid response.

> **Note:** The local phrase dictionary lookup and Helsinki-NLP server have been removed from the translation pipeline. Gemma is now the single primary translator for all modes. GPT-4o output is also no longer run through `phoneticConvert` — the raw translation is cached and returned directly.

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

Route timeout: **800 seconds** (13 minutes) to accommodate long videos.

**Pipeline:**
1. Download the YouTube video using yt-dlp. The route tries four strategies in order, stopping at the first success:
   - Strategy 1: cookies + `--remote-components ejs:github` + combined format selector
   - Strategy 2: cookies + combined format selector (no JS solver)
   - Strategy 3: cookies + `--extractor-args "youtube:player_client=tv_embedded"` (bypasses JS challenge entirely)
   - Strategy 4: no cookies (public videos only)

   Format selector: `18/93-11/94-11/95-11/96-11/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best` — prefers pre-muxed formats to avoid DASH merging. After download, the actual output file is resolved by probing for common extensions (`mp4`, `mkv`, `webm`, `avi`, `m4a`, `mp3`); if none match, the temp directory is scanned. Audio-only formats (`m4a`/`mp3`) log a warning and are handled by packaging the dubbed audio directly into an mp4 container.
2. Extract audio as 16 kHz mono WAV using ffmpeg.
3. Transcribe with OpenAI Whisper (`verbose_json` with segment timestamps); audio files over 24 MB are split into 10-minute chunks automatically, with timestamps offset-corrected for each chunk.
4. **Translate** each segment individually to Kikuyu in parallel batches of 5 (`TRANSLATE_CONCURRENCY = 5`) — tries Gemma Modal endpoint first (fine-tuned for Kikuyu, faster); falls back to GPT-4o with the `KIKUYU_DUB_PROMPT` system prompt that enforces proper diacritics (ĩ, ũ), natural spoken register, concise dubbing-friendly output, and correct phonology rules. Temperature is 0.2 for consistent output. Gemma results are only accepted if non-empty, distinct from the input, and longer than 2 characters. **All translations complete before synthesis begins** (two separate passes).
5. **Synthesize** segments in groups of 2 (`GROUP_SIZE = 2`) — each group is concatenated into a single TTS call (joined with ` ... `) to keep adjacent sentences in the same prosodic state, then the combined audio is split back into per-segment files by word-count proportion. Groups of 2 (reduced from 4) produce shorter text per TTS call, improving MMS response times and reducing timeout risk. If group synthesis fails, the route falls back to individual synthesis for that group. TTS engine priority:
   - **Modal MMS TTS** (`MMS_TTS_URL`): sent with `speed: 0.85`, retried up to **3 times** (2 s between retries) before raising an error. If MMS is configured, OpenAI TTS is not used as a fallback — consistent speaker identity is preserved.
   - **OpenAI TTS** (`onyx` voice, `speed: 0.78`): used only when `MMS_TTS_URL` is not set.

> **Note on `/api/speak` fallback chain:** The TTS pipeline is **Modal MMS → OpenAI TTS**. Chatterbox/Coqui has been removed from the route. `COQUI_TTS_URL` is no longer used by `/api/speak`.
   
   After synthesis, each segment WAV is re-encoded to 24 kHz 16-bit mono PCM using ffmpeg. If the synthesized audio duration differs from the source segment slot, an `atempo` filter stretches/compresses it to fit (clamped between 0.5× and 1.2× for naturalness).
6. Mix dubbed segments into a full-length audio track in pure Node.js — each segment's 16-bit PCM is copied into a silent buffer at the correct timestamp offset, then a WAV header is written. A 20 ms linear fade-in and fade-out is applied to each segment before mixing to smooth hard cuts at segment boundaries. This avoids ffmpeg command-line length limits.
7. Mux the dubbed audio track with the original (muted) video using ffmpeg. Video stream detection uses `ffprobe` (JSON output) when available, with automatic fallback to `ffmpeg` stderr parsing if `ffprobe` is not in the same directory. If no video stream is found (audio-only edge case), the dubbed audio is packaged into an mp4 container directly.

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

**Output files** are saved to `public/dubbed/` and served statically. Temp files (raw video, audio, per-segment WAVs, and the mixed `dubbed_audio.wav`) are cleaned up after each run. On failure, the segment temp directory (`temp/segs_<timestamp>/`) is also removed before the error response is returned.

**Requirements:**
- `yt-dlp` installed. The route resolves `yt-dlp` in the following order:
  1. **`YT_DLP_PATH` env var** (highest priority) — set this to an absolute path to skip auto-detection entirely
  2. **PATH** — `where yt-dlp` is tried first on Windows
  3. **Common install locations** — searches `%APPDATA%\Python<ver>\Scripts\`, `%APPDATA%\Python\<ver>\Scripts\`, `%LOCALAPPDATA%\Programs\Python\<ver>\Scripts\`, and `%LOCALAPPDATA%\Programs\Python\Python<ver>\Scripts\` for Python 3.9–3.14
- **Cookies file** — place a `cookies.txt` (Netscape format) on your Desktop (`%USERPROFILE%\Desktop\cookies.txt`) to handle age-restricted or sign-in-required videos. A warning is logged when no cookies file is found.
- `ffmpeg` installed and on PATH, or set `FFMPEG_PATH` env var to the absolute path of the `ffmpeg` executable to override auto-detection
- `OPENAI_API_KEY` (required — used for Whisper transcription, GPT-4o translation, and TTS fallback)
- `MMS_TTS_URL` (optional — preferred TTS for best native Kikuyu quality; falls back to OpenAI TTS if unavailable)

### 🎛️ Translation Card Actions
After translation, the card exposes these per-panel actions:


**TTS behaviour change:** Inline audio playback has been removed from the translation card. The volume/speak icons now navigate to `/speak?q=<encoded text>` so the dedicated Speak page handles all TTS. This applies to both the GPT-4o and Helsinki output panels, as well as the **Speak** button in the bottom action bar.

**Sidebar speak behaviour:** The `handleSpeak` function in `components/Sidebar.tsx` no longer accepts a pre-recorded `audioUrl` shortcut. All speak actions from the Sidebar now go through the `/api/speak` TTS pipeline (MMS → OpenAI) regardless of whether a pre-recorded file exists for the phrase.

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

`modal-translate/deploy.py` deploys `gateremark/kikuyu_translategemma_4b_v7_highrank_rslora` — a fine-tuned model based on `google/translategemma-4b-it` — to a Modal **A10G** GPU. This is the recommended way to run the Gemma translation tier — no local GPU required, and the model is cached in a Modal Volume after the first cold start.

The model is loaded via standard HuggingFace `AutoModelForCausalLM` and `AutoTokenizer` — no Unsloth dependency required. Inference uses `tokenizer.apply_chat_template()` for prompt formatting, with greedy decoding (`do_sample=False`) for deterministic output.

**Model quality:** BLEU 21.93 · chrF++ 42.87

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

**`/health` response fields:** `status`, `model`, `bleu`

**`POST /translate` request body:**
```json
{ "text": "Hello", "source_lang": "en" }
```
**Response:**
```json
{ "translation": "Wee mwega", "model": "gateremark/kikuyu_translategemma_4b_v7_highrank_rslora" }
```

`source_lang` accepts `"en"` (default) or `"sw"` for Kiswahili input.

**Container settings:** A10G GPU · 300s scale-down window (`scaledown_window=300`) · 900s timeout · model cached in Modal Volume `kikuyu-gemma-v7-stable` under `/model/kikuyu-4b-v7-stable`. Cache presence is verified by checking for `model-00001-of-00002.safetensors` before downloading.

**Loader:** Uses `modal.Image.debian_slim(python_version="3.11")` as the base image with `transformers`, `torch`, `accelerate`, `sentencepiece`, `huggingface_hub`, `fastapi`, and `pydantic` installed via pip — no CUDA base image or Unsloth required. The model is loaded with `AutoModelForCausalLM.from_pretrained` using `torch_dtype=torch.bfloat16` and `device_map="auto"`. The tokenizer uses `padding_side="left"` and `pad_token` set to `eos_token` if absent.

**Client-side timeout:** The Next.js `/api/translate` route waits up to **10 minutes** (600s) for a response from `GEMMA_TRANSLATE_URL`. This accommodates Modal cold starts where the container must download and load the model before serving the first request.

**Local test (without deploying):**
```bash
py -3.11 -m modal run modal-translate/deploy.py
```

> **Note:** This deployment no longer uses Unsloth (`unsloth`/`unsloth_zoo`) or the `nvidia/cuda` base image. If you have a previous deployment using the `kikuyu-gemma-unsloth` volume, the new deployment uses a separate volume named `kikuyu-gemma-v7-stable` — the model will be re-downloaded on first cold start.

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

**Container settings:** T4 GPU · 5-minute scale-down window (`scaledown_window=300`) · 120s timeout · model cached in a Modal Volume.

**Keep-alive scheduler:** A `@app.function(schedule=modal.Period(minutes=4))` task (`keepalive`) runs every 4 minutes and pings the TTS endpoint with a short synthesis request (`"Wĩ mwega"`). This keeps the container warm between real requests and avoids cold-start latency for users. The scheduler is deployed automatically alongside the main app — no extra configuration is needed.

**Features:**
- Long text is automatically split into sentence/clause chunks (≤100 chars each) with 180ms silence between them for natural cadence
- Synthesized audio is cached by content hash — repeated requests are served instantly from the cache volume

**`/api/speak` request body:**
```json
{ "text": "Wĩ mwega?", "speed": 1.0 }
```
`speed` is optional (defaults to `1.0` on the client). The browser applies it via `audio.playbackRate` after receiving the audio. The backend currently passes `speed` through but TTS providers handle timing independently — the field is reserved for future server-side rate adjustment.

**`/api/speak` client-side timeout:** The Next.js route waits up to **45 seconds** for a response from `MMS_TTS_URL` (increased from 30s to accommodate Modal cold starts). If MMS is unreachable or returns an error, the route falls through to OpenAI TTS.

**MMS audio post-processing:** MMS outputs 16 kHz mono WAV. After receiving the raw buffer, the route runs `resampleAndNormalize()` to upsample to 48 kHz and normalize volume to a –20 dB peak reference (matching a natural speech loudness target). The processed WAV is returned to the client instead of the raw 16 kHz output, improving perceived audio quality.

**Local test (without deploying):**
```bash
py -3.11 -m modal run modal-tts/deploy.py
```
Saves output to `test_output.wav`.

#### Other local servers

**Chatterbox TTS** (`chatterbox-server/`) — ResembleAI voice-cloning TTS at `localhost:5003`.

> **Note:** Chatterbox has been removed from the `/api/speak` fallback chain. The server still exists in the repo for standalone use (e.g. direct API calls or custom integrations), but it is no longer invoked by the main speak pipeline. The effective TTS chain for the app is **Modal MMS → OpenAI TTS**.

Model: `ResembleAI/chatterbox` — 0.5B Llama backbone, zero-shot voice cloning from a reference WAV, emotion exaggeration control. Outputs 24 kHz PCM WAV.

**Setup:**
```bash
cd chatterbox-server
venv311\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Reference voice:** Place your speaker reference at `chatterbox-server/celo_reference.wav` (24 kHz mono WAV). Convert from any audio with:
```bash
ffmpeg -i <source_audio> -ar 24000 -ac 1 chatterbox-server/celo_reference.wav
```

**`POST /synthesize` request body:**
```json
{
  "text": "Wĩ mwega?",
  "speed": 0.75,
  "exaggeration": 0.3,
  "cfg_weight": 0.5,
  "use_cache": true
}
```

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `speed` | 0.5–1.5 | `0.75` | Speaking pace — lower is slower |
| `exaggeration` | 0.0–1.0 | `0.3` | Emotion expressiveness (0 = neutral) |
| `cfg_weight` | 0.0–1.0 | `0.5` | Voice similarity to reference (higher = more like reference) |
| `use_cache` | bool | `true` | Serve from content-hash cache if available |

**Response:** Raw `audio/wav` bytes at `model.sr` Hz (24 kHz).

**Features:**
- Long text is automatically split into sentence chunks (≤200 chars) with 180 ms silence between them
- Speed adjustment is applied via linear resampling (time-stretch without pitch change)
- Audio normalized to a –18 LUFS equivalent (~0.25 peak) to match natural speech volume
- Cache keyed on `(text, speed, exaggeration)` — clearing only removes `chatterbox_*.wav` files

**`GET /health` response fields:** `status`, `engine` (`chatterbox-tts`), `model`, `sample_rate`, `reference_wav`, `device`, `cached_phrases`

**`DELETE /cache`** — removes all `chatterbox_*.wav` entries from the cache directory.

See `mms-server/` for the Meta MMS-TTS local server setup instructions.

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
| `YT_DLP_PATH` | Optional | Absolute path to `yt-dlp` executable — overrides auto-detection in the `/dub` route |
| `FFMPEG_PATH` | Optional | Absolute path to `ffmpeg` executable — overrides PATH lookup in the `/dub` route |

---

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS 4
- **Translation**: GPT-4o + TranslateGemma-4B V7 merged model (Modal serverless T4 GPU)
- **Speech Recognition**: OpenAI Whisper API / Browser Web Speech API
- **Text-to-Speech**: Meta MMS-TTS (Modal serverless GPU) / OpenAI TTS / ElevenLabs
- **YouTube Processing**: yt-dlp + Whisper

## Quotation Generators

Two quotation generator scripts live in `__quot_gen__/`. Both produce professional, styled Word (`.docx`) documents using [python-docx](https://python-docx.readthedocs.io/).

**Prerequisites:**
```bash
pip install python-docx
```

### generate_quotation.py — NGT AI Voice Synthesis Platform (NGT/QT/2026/001)

**Usage:**
```bash
cd __quot_gen__
python generate_quotation.py
```

**Output:** `C:\Users\swanti\Downloads\NGT-Quotation-AI-Voice-Platform.docx`

**Document contents:**
- Header banner with quote number (`NGT/QT/2026/001`) and date
- From / Prepared For info boxes
- Project overview narrative
- Scope of work table (8 development items: TTS engine, voice cloning, voice library, web app, API, audio processing, admin portal, deployment)
- Cost breakdown table with per-item KES amounts and a KES 257,000 total
- Payment schedule (50% deposit / 30% on dev completion / 20% on final delivery)
- Estimated timeline (8–12 weeks)
- Deliverables checklist
- Terms & conditions (6 clauses)
- Acceptance/signature footer

### generate_quotation3.py — AI Voice Synthesis Platform v2 (NGT/QT/2026/001 · KES 275,000)

Generates an updated, expanded version of the AI Voice Synthesis Platform quotation — same quote number (`NGT/QT/2026/001`) but with a revised scope (16 line items vs 8) and updated total (KES 275,000 vs KES 257,000).

**Usage:**
```bash
cd __quot_gen__
python generate_quotation3.py
```

**Output:** `C:\Users\swanti\Downloads\NGT-Quotation-AI-Voice-Platform-v2.docx`

**Document contents:**
- Header banner with quote number (`NGT/QT/2026/001`) and date (12 June 2026)
- From / Prepared For info boxes
- Project overview narrative — enterprise-grade AI voice synthesis platform
- Scope of work table (16 detailed development items covering architecture, design, TTS engine, voice cloning, voice library, web app, backend API, audio processing, database, security, billing, admin portal, SDK, CI/CD, QA, and documentation)
- Cost breakdown table with per-item KES amounts and a **KES 275,000** total
- Subtotal + VAT (0%) rows before the total banner
- Payment schedule (40% deposit / 35% on frontend & backend completion / 25% on final delivery)
- Estimated timeline (10–14 weeks, broken into 5 phases)
- Deliverables checklist (16 items)
- Terms & conditions (8 clauses)
- Acceptance/signature footer

**Key differences from `generate_quotation.py`:**
| Field | v1 (`generate_quotation.py`) | v2 (`generate_quotation3.py`) |
|---|---|---|
| Scope items | 8 | 16 |
| Total | KES 257,000 | KES 275,000 |
| Payment split | 50/30/20 | 40/35/25 |
| Timeline | 8–12 weeks | 10–14 weeks |
| Deliverables | 8 | 16 |
| Terms clauses | 6 | 8 |

---

### generate_explanations.py — Explanation Documents for Both Quotations

Generates plain-language explanation documents that accompany the quotations. Each document breaks down the scope, cost rationale, delivery timeline, and payment structure in terms a non-technical client can understand.

**Usage:**
```bash
cd __quot_gen__
python generate_explanations.py
```

**Output:**
| File | Quotation |
|------|-----------|
| `C:\Users\swanti\Downloads\NGT-Explanation-AI-Voice-Platform.docx` | NGT/QT/2026/001 — AI Voice Synthesis Platform |
| `C:\Users\swanti\Downloads\NGT-Explanation-Swahili-AI-Voice.docx` | NGT/QT/2026/002 — Swahili AI Voice & Song Generation |

**Document 1 — AI Voice Synthesis Platform (NGT/QT/2026/001):**
- What the project is and what commercial tools it replaces (ElevenLabs, Murf.ai)
- Plain-language breakdown of all 16 cost components with KES amounts explained
- Full deliverables list (deployed app, TTS engine, voice cloning, SDKs, admin portal, billing, source code)
- Phase-by-phase timeline breakdown (10–14 weeks, 5 phases)
- Payment milestone explanation (40% / 35% / 25% tied to delivery milestones)
- Value comparison table: SaaS alternatives vs. one-time ownership at KES 275,000

**Document 2 — Swahili AI Voice & Song Generation (NGT/QT/2026/002):**
- Step-by-step explanation of how voice cloning and AI song generation work (6 steps)
- Rationale for the KES 5,000 non-refundable demo fee — why it protects the client
- Cost breakdown per phase (data processing, training, speech engine, song module, testing, deployment)
- Use cases for the finished AI voice (voiceovers, podcasts, jingles, IVR, social media)
- Timeline table (4–6 weeks)
- Payment summary: KES 5,000 demo fee + KES 120,000 project fee = KES 125,000 total

**Styling:** Matches the NeuroGrowthTech design system used across all quotation documents — dark navy header, primary blue accents, amber highlights for demo fee sections, green highlights for the value comparison winner row. Uses the same `python-docx` helper utilities (cell backgrounds, bordered info boxes, bullet lists, dividers).

---

### generate_quotation2.py — Swahili AI Voice & Song Generation System (NGT/QT/2026/002)

**Usage:**
```bash
cd __quot_gen__
python generate_quotation2.py
```

**Output:** `C:\Users\swanti\Downloads\NGT-Quotation-Swahili-AI-Voice.docx`

**Document contents:**
- Header banner with quote number (`NGT/QT/2026/002`) and date (13 June 2026)
- From / Prepared For info boxes
- Project overview — personalized Swahili voice cloning and AI song generation
- Scope of work (6 phases: Voice Data Preparation, Swahili Voice Model Training, AI Speech Generation Engine, AI Song Generation Module, Testing & Optimization, Deployment & Delivery)
- Deliverables checklist (8 items: voice model, voice cloning system, TTS engine, AI singing voice model, song generation, audio export, documentation, deployment support)
- Cost breakdown table with per-item KES amounts and a **KES 120,000** project total
- Demonstration fee box — **KES 5,000** non-refundable fee required before demo creation, highlighted in amber
- Payment terms: KES 5,000 before demo → KES 120,000 on approval; estimated 4–6 week timeline
- Terms & conditions (7 clauses, including demo fee non-refund clause)
- Cost summary box (demo fee / project cost / KES 125,000 total project value)
- Footer with acceptance instructions and preparer details

**Styling (both scripts):** Dark navy header (`#1A202C`), primary blue (`#2367A8`), alternating light-grey table rows, Calibri font throughout — matching the NeuroGrowthTech design system. `generate_quotation2.py` adds an amber highlight (`#D97A06`) for the demonstration fee section.

---

## Word Document Generator

`__docx_gen__/generate_docx.py` converts the three Markdown documentation files from your Downloads folder into branded, paginated Word (`.docx`) documents using [python-docx](https://python-docx.readthedocs.io/).

**Prerequisites:**
```bash
pip install python-docx
```

**Source files expected in `C:\Users\swanti\Downloads\`:**
| Markdown file | Output Word document |
|---|---|
| `Gikuyu-Translator-Technical-Documentation.md` | `Gikuyu-Translator-Technical-Documentation.docx` |
| `Gikuyu-Translator-API-Reference.md` | `Gikuyu-Translator-API-Reference.docx` |
| `Gikuyu-Translator-User-Guide.md` | `Gikuyu-Translator-User-Guide.docx` |

**Usage:**
```bash
cd __docx_gen__
python generate_docx.py
```

`.docx` files are written directly to `C:\Users\swanti\Downloads\`. The script skips any document whose source `.md` file is not found and prints a warning.

**Document features:**
- Branded indigo/cyan colour scheme matching the NeuroGrowthTech design system
- Cover page with title banner, subtitle, document type, and version (`Version 0.1.0 · NeuroGrowthTech · neurogrowthtech.com`)
- Calibri body font with styled Heading 1–3 and H4 bold paragraph
- Markdown rendering: headings H1–H4, bold/italic/inline-code, fenced code blocks (dark slate background, monospace), tables (alternating row shading, indigo header), bullet and numbered lists, horizontal rules
- Proper A4 page size with 2.5 cm margins
- Core document properties set to NeuroGrowthTech authorship

---

## Project Structure

```
├── __quot_gen__/
│   ├── generate_quotation.py      # python-docx quotation generator (NGT AI Voice Platform v1 — NGT/QT/2026/001, KES 257,000)
│   ├── generate_quotation2.py     # python-docx quotation generator (Swahili AI Voice & Song — NGT/QT/2026/002, KES 120,000)
│   ├── generate_quotation3.py     # python-docx quotation generator (NGT AI Voice Platform v2 — NGT/QT/2026/001, KES 275,000, 16-item scope)
│   └── generate_explanations.py   # python-docx explanation docs for both quotations (NGT/QT/2026/001 & 002)
├── __docx_gen__/
│   └── generate_docx.py         # python-docx Word (.docx) generator for documentation markdown files
├── app/
│   ├── api/
│   │   ├── dub/                 # YouTube dubbing pipeline (yt-dlp → Whisper → GPT-4o → TTS → Node.js PCM mix → ffmpeg)
│   │   ├── dub-upload/          # File upload dubbing pipeline (same as dub/ but accepts multipart/form-data video)
│   │   ├── speak/               # TTS endpoint (MMS → OpenAI)
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
├── chatterbox-server/           # Chatterbox TTS server — ResembleAI voice cloning (localhost:5003)
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
