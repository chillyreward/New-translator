"""
Fine-tune XTTS v2 on your Kikuyu voice recordings using metadata.csv.

Usage:
    cd coqui-server
    venv311\\Scripts\\activate
    python train.py

Requirements:
    - dataset/metadata.csv        (pipe-delimited: audio_file|text|speaker_name)
    - ../public/audio/chunks/*.wav (your recorded WAV files)
    - Python 3.11, TTS>=0.22.0, torch>=2.0.0

Output:
    - Fine-tuned model checkpoints saved to ./output/
    - Update FINE_TUNED_MODEL in main.py to use the trained model
"""

import os
import csv
import shutil
import sys

# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR    = os.path.dirname(os.path.abspath(__file__))
METADATA_FILE = os.path.join(SCRIPT_DIR, "dataset", "metadata.csv")
CHUNKS_DIR    = os.path.join(SCRIPT_DIR, "..", "public", "audio", "chunks")
DATASET_DIR   = os.path.join(SCRIPT_DIR, "dataset")
AUDIO_DIR     = os.path.join(DATASET_DIR, "audio")
OUTPUT_DIR    = os.path.join(SCRIPT_DIR, "output")
TRAIN_META    = os.path.join(DATASET_DIR, "metadata_train.csv")
EVAL_META     = os.path.join(DATASET_DIR, "metadata_eval.csv")

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Read metadata.csv and copy WAVs into dataset/audio/
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
print("Step 1: Reading metadata.csv and copying WAV files")
print("=" * 60)

rows = []
missing = []

with open(METADATA_FILE, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter="|")
    for row in reader:
        # audio_file column may be "chunks/foo.wav" or just "foo.wav"
        raw_path = row["audio_file"].strip()
        filename = os.path.basename(raw_path)
        text     = row["text"].strip()
        speaker  = row.get("speaker_name", "speaker").strip()

        src = os.path.join(CHUNKS_DIR, filename)
        dst = os.path.join(AUDIO_DIR, filename)

        if not os.path.exists(src):
            missing.append(filename)
            continue

        if not os.path.exists(dst):
            shutil.copy2(src, dst)

        rows.append({
            "audio_file": f"audio/{filename}",
            "text": text,
            "speaker_name": speaker,
        })

print(f"  Found:   {len(rows)} usable samples")
if missing:
    print(f"  Missing: {len(missing)} files (skipped)")
    for m in missing[:10]:
        print(f"    - {m}")

if len(rows) < 5:
    print("\nERROR: Need at least 5 samples to train. Check your metadata.csv and chunks folder.")
    sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Split into train / eval (90% / 10%)
# ─────────────────────────────────────────────────────────────────────────────
print("\nStep 2: Splitting into train/eval sets")

import random
random.seed(42)
random.shuffle(rows)

split = max(1, int(len(rows) * 0.9))
train_rows = rows[:split]
eval_rows  = rows[split:] or rows[:1]   # at least 1 eval sample

def write_meta(path, data):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write("audio_file|text|speaker_name\n")
        for r in data:
            f.write(f"{r['audio_file']}|{r['text']}|{r['speaker_name']}\n")

write_meta(TRAIN_META, train_rows)
write_meta(EVAL_META,  eval_rows)

print(f"  Train: {len(train_rows)} samples → {TRAIN_META}")
print(f"  Eval:  {len(eval_rows)} samples  → {EVAL_META}")


# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Fine-tune XTTS v2
# ─────────────────────────────────────────────────────────────────────────────
print("\nStep 3: Starting XTTS v2 fine-tuning")
print("  This takes 30–120 min on CPU, 5–20 min on GPU.\n")

try:
    from trainer import Trainer, TrainerArgs
    from TTS.tts.configs.xtts_config import XttsConfig
    from TTS.tts.models.xtts import Xtts
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you have run:  pip install -r requirements.txt")
    sys.exit(1)

import torch
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"  Device: {device}")

# ── Build config ──────────────────────────────────────────────────────────────
config = XttsConfig()
config.output_path = OUTPUT_DIR

config.datasets = [
    {
        "name": "kikuyu",
        "meta_file_train": TRAIN_META,
        "meta_file_val":   EVAL_META,
        "path": DATASET_DIR + os.sep,
        "language": "en",
    }
]

# Audio settings — must match your WAV files (16kHz mono)
config.audio.sample_rate = 22050   # XTTS v2 internal rate
config.audio.output_sample_rate = 24000

# Training hyperparameters — conservative for small datasets
config.batch_size       = 2
config.grad_accum_steps = 8        # effective batch = 16
config.num_loader_workers = 2
config.epochs           = 30       # more epochs for small dataset
config.lr               = 5e-6    # low LR to avoid catastrophic forgetting
config.save_step        = 500
config.print_step       = 50
config.eval_split_size  = max(1, len(eval_rows))

# ── Load base XTTS v2 checkpoint ──────────────────────────────────────────────
print("  Loading base XTTS v2 model (downloads ~2GB on first run)...")

model = Xtts.init_from_config(config)
model.load_checkpoint(
    config,
    checkpoint_dir=None,   # downloads from HuggingFace if not cached
    eval=False,
    use_deepspeed=False,
)
model.to(device)

# ── Train ─────────────────────────────────────────────────────────────────────
trainer = Trainer(
    TrainerArgs(
        restore_path=None,
        skip_train_epoch=False,
        start_with_eval=True,
        grad_clip=1.0,
    ),
    config,
    output_path=OUTPUT_DIR,
    model=model,
    train_samples=model.get_data_loader(
        config,
        assets=None,
        is_eval=False,
        samples=None,
        verbose=True,
        num_gpus=1 if device == "cuda" else 0,
    ),
    eval_samples=model.get_data_loader(
        config,
        assets=None,
        is_eval=True,
        samples=None,
        verbose=True,
        num_gpus=1 if device == "cuda" else 0,
    ),
)

trainer.fit()

print("\n" + "=" * 60)
print("Training complete!")
print(f"Model saved to: {OUTPUT_DIR}")
print("\nTo use the fine-tuned model, set this in your .env.local:")
print("  FINE_TUNED_MODEL=./output/best_model.pth")
print("Then restart main.py — it will load your custom model.")
print("=" * 60)
