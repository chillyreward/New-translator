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
