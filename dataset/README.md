# Kikuyu TTS Fine-tuning Pipeline

Fine-tunes `facebook/mms-tts-kik` on real Kikuyu voice data to produce a custom voice model.

## Datasets Used

| Dataset | Samples | Type | License |
|---|---|---|---|
| Google WAXAL `kik_tts` | ~2,030 | Single-speaker TTS | CC-BY-4.0 |
| evie-8/kikuyu-data | 116,000+ | Multi-speaker speech | Restricted |
| Project chunks | ~110 | Single-speaker phrases | Yours |

---

## Step-by-Step

### Step 1 — Install Python dependencies

```cmd
pip install datasets soundfile numpy tqdm resampy huggingface_hub transformers
```

### Step 2 — Log into HuggingFace

```cmd
huggingface-cli login
```

Enter your token from https://huggingface.co/settings/tokens

For evie-8 dataset, also visit:
https://huggingface.co/datasets/evie-8/kikuyu-data
and accept the terms.

### Step 3 — Download datasets

```cmd
cd dataset

# Download WAXAL only (recommended first run — ~500MB)
python download_datasets.py --waxal --chunks

# Or download everything (warning: evie-8 is 18GB)
python download_datasets.py --all --max-evie8 5000
```

### Step 3b — (Optional) Slice raw voice recordings for RVC training

If you have your own speaker recordings in `dataset/celo-raw/` (WAV files at any sample rate), run `slice_audio.py` to convert them into clean 40 kHz mono chunks ready for RVC model training.

**Prerequisites:** `ffmpeg` and `ffprobe` must be on your PATH.

```cmd
rvc-server\venv311\Scripts\python.exe dataset\slice_audio.py
```

**What it does:**
1. Reads every `.wav` from `dataset/celo-raw/`
2. Converts each file to 40 kHz mono 16-bit PCM (the sample rate expected by RVC)
3. Detects silence boundaries using `ffmpeg silencedetect` (threshold: −35 dB, minimum silence duration: 0.4 s)
4. Merges adjacent speech segments greedily up to `MAX_SECS`. If a merged segment still exceeds `MAX_SECS` (e.g. a long continuous passage with no silence), it is **force-split** into sequential `MAX_SECS`-length chunks rather than being discarded. Segments shorter than `MIN_SECS` are dropped.
5. Saves numbered chunks to `dataset/celo-sliced/` as `<file_index>_<chunk_index>.wav`
6. Prints a summary: total chunks saved and total minutes of training audio

**Configuration constants (edit at top of script):**

| Constant | Default | Description |
|---|---|---|
| `INPUT_DIR` | `dataset/celo-raw/` | Directory of raw speaker WAVs |
| `OUTPUT_DIR` | `dataset/celo-sliced/` | Output directory for sliced chunks |
| `SAMPLE_RATE` | `40000` | Target sample rate (Hz) — matches RVC expectation |
| `MIN_SECS` | `3.0` | Minimum chunk duration to keep |
| `MAX_SECS` | `15.0` | Maximum chunk duration before a new chunk starts |
| `SILENCE_DB` | `"-35dB"` | Silence detection noise floor |
| `SILENCE_SECS` | `"0.4"` | Minimum silence duration to treat as a split point |

**Output layout:**
```
dataset/
  celo-raw/          ← your raw speaker recordings (any sample rate/channels)
  celo-sliced/       ← 40kHz mono chunks ready for RVC training
    01_0001.wav
    01_0002.wav
    02_0001.wav
    ...
```

After slicing, use the `celo-sliced/` folder as the dataset directory when training an RVC model (e.g. via Google Colab). Aim for at least 10 minutes of clean audio for a usable voice model; 30+ minutes produces noticeably better results.

### Step 3c — Train RVC voice model on Google Colab

Use `train_rvc_colab.ipynb` to train an RVC (Retrieval-based Voice Conversion) model from your `celo-sliced/` chunks. The output is a `.pth` model file and a `.index` file that you drop into `rvc-server/` on your local machine.

**Prerequisites:**
- A Google account with Google Drive access
- Google Colab with a **T4 GPU** runtime (free tier) or A100 (Colab Pro)
- Your `celo-sliced/` chunks uploaded to `My Drive/rvc-celo/dataset/`

**Notebook steps:**

| Step | What happens |
|---|---|
| 1 | Mount Google Drive and verify chunk count |
| 2 | Check GPU availability (fails if no GPU assigned) |
| 3 | Clone the RVC-Project repo and install all dependencies (pins `omegaconf`, `numpy<2`, `Cython<3`; installs `av`, `praat-parselmouth`, RVC requirements, `fairseq` from GitHub source, and `faiss-cpu`) |
| 4 | Download 40k pretrained weights from HuggingFace (`f0G40k.pth`, `f0D40k.pth`, `hubert_base.pt`, `rmvpe.pt`) |
| 5 | Copy chunks from Drive into the RVC dataset folder |
| 6 | Extract features: HuBERT content embeddings + RMVPE pitch (F0) |
| 7 | Write training filelist (`filelist.txt`) from preprocessed audio |
| 8 | Train the voice model |
| 9 | Build a FAISS index for retrieval |
| 10 | Quick inference test to listen to the result |
| 11 | Save final `.pth` + `.index` to Google Drive; optional browser download |
| 12 | Copy files to `rvc-server/` and update `main.py` paths |

**Dependency notes (Step 3):**

Step 3 uses a multi-pass install to work around broken packages on modern pip (≥24.1):

1. **Pin conflict packages first** — `omegaconf>=2.1`, `numpy<2`, and `Cython<3` are installed before anything else to prevent ABI and metadata errors.
2. **Install `av` and `praat-parselmouth`** — `av` (PyAV) is required by RVC's `audio.py` (`import av`) and is absent from `requirements.txt`. It is installed on its own line (with an explanatory comment) to make the dependency explicit and prevent silent import failures. `praat-parselmouth` is imported at runtime by `extract_f0_rmvpe.py`.
3. **Install RVC requirements without fairseq** — `fairseq` is stripped from `requirements.txt` and the remaining packages are installed normally.
4. **Install fairseq from GitHub source** — the official PyPI `fairseq` package is unmaintained and fails to build with pip ≥ 24. The notebook installs directly from the stable `v0.12.2` tag (`facebookresearch/fairseq`) using `--no-deps` to skip fairseq's own dependency resolution (e.g. `omegaconf<2.1`) since compatible versions are already pinned above. The `#egg=` hint is intentionally omitted — it triggers a `ResolutionImpossible` conflict on pip ≥ 24.
5. **Install `faiss-cpu` explicitly** — can be silently skipped or pinned to a broken wheel when resolved via `requirements.txt`. Installing it directly (`faiss-cpu>=1.7`) ensures it is present.
6. **Verify key imports** — checks `torch`, `fairseq`, `faiss`, `librosa`, `soundfile`, `av`, and `parselmouth`. Re-run once if any import fails.

> **Runtime:** Step 3 takes approximately **5–8 minutes** on first run due to the fairseq source build.

**Key configuration:**

`DRIVE_CHUNKS` is set in Step 1's code cell (the Drive mount cell):

| Variable | Default | Description |
|---|---|---|
| `DRIVE_CHUNKS` | `/content/drive/MyDrive/rvc-celo/dataset` | Drive path containing your WAV chunks |

`EXP_NAME` and `SR` are set at the top of Step 3's code cell:

| Variable | Default | Description |
|---|---|---|
| `EXP_NAME` | `celo` | Experiment name — output files saved as `celo.pth` |
| `SR` | `40k` | Sample rate — must match chunks (40 kHz from `slice_audio.py`) |

**To open in Colab:** go to https://colab.research.google.com, choose **File → Upload notebook**, and select `dataset/train_rvc_colab.ipynb`.

**After training:** place the downloaded `celo.pth` and `celo.index` files in `rvc-server/` and restart the RVC server. The app's dubbing pipeline will pick them up automatically.

---

### Step 4 — Prepare dataset

```cmd
python prepare.py
```

This outputs:
- `dataset/prepared/wavs/` — all normalized 22050Hz WAV files
- `dataset/prepared/train.csv`
- `dataset/prepared/val.csv`
- `dataset/prepared/metadata.csv`

### Step 5 — Upload to Google Drive

Upload the entire `dataset/prepared/` folder to:
`Google Drive → MyDrive → kikuyu-tts → prepared/`

### Step 6 — Run Colab notebook

1. Open `finetune.ipynb` in Google Colab
2. Set Runtime → GPU (T4)
3. Fill in your HuggingFace token and username
4. Run all cells

Training time estimates:
- 2,000 samples × 50 epochs ≈ 4–6 hours on T4
- 10,000 samples × 50 epochs ≈ 12–18 hours on T4

### Step 7 — Use your model

After training, update `mms-server/main.py`:

```python
MODEL_ID = "your-hf-username/kikuyu-tts-custom"
```

Restart the server and your app will use the new voice automatically.

---

## Tips for better results

- More data = better voice. Aim for 3–5 hours minimum.
- Single speaker recordings produce cleaner voices than multi-speaker.
- WAXAL kik_tts is the highest quality subset — always include it.
- Use 100+ training epochs for production quality.
- The fine-tuned model inherits Kikuyu phonetics from the base model — it just adapts to the new voice characteristics.
