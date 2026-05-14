"""
Fine-tune XTTS v2 on your Kikuyu voice recordings.

This script uses the metadata.csv + your chunk WAV files to fine-tune
the XTTS v2 model on your specific speaker's voice.

Usage:
    cd coqui-server
    venv311\\Scripts\\activate
    python train.py

Requirements:
    - dataset/metadata.csv  (generated — maps WAV files to Kikuyu text)
    - ../public/audio/chunks/*.wav  (your recorded audio files)
    - At least 8GB RAM, GPU recommended for training

Output:
    - A fine-tuned model saved to ./output/
    - Use this model in main.py by setting the model path
"""

import os
import shutil
import csv

# ── Step 1: Copy chunks into dataset/audio for training ──────────────────────
CHUNKS_DIR = "../public/audio/chunks"
DATASET_AUDIO_DIR = "dataset/audio"
METADATA_FILE = "dataset/metadata.csv"

os.makedirs(DATASET_AUDIO_DIR, exist_ok=True)

print("Copying audio files into dataset/audio...")
copied = 0
with open(METADATA_FILE, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter="|")
    for row in reader:
        src_filename = row["audio_file"].replace("chunks/", "")
        src_path = os.path.join(CHUNKS_DIR, src_filename)
        dst_path = os.path.join("dataset/audio", src_filename)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)
            copied += 1
        else:
            print(f"  [MISSING] {src_path}")

print(f"Copied {copied} audio files.")

# ── Step 2: Generate a flat metadata.csv pointing to dataset/audio ───────────
FLAT_METADATA = "dataset/metadata_train.csv"
with open(METADATA_FILE, "r", encoding="utf-8") as fin, \
     open(FLAT_METADATA, "w", encoding="utf-8", newline="") as fout:
    reader = csv.DictReader(fin, delimiter="|")
    fout.write("audio_file|text|speaker_name\n")
    for row in reader:
        filename = row["audio_file"].replace("chunks/", "")
        flat_path = f"audio/{filename}"
        fout.write(f"{flat_path}|{row['text']}|{row['speaker_name']}\n")

print(f"Generated flat metadata: {FLAT_METADATA}")

# ── Step 3: Run XTTS fine-tuning ──────────────────────────────────────────────
print("\nStarting XTTS v2 fine-tuning...")
print("This will take 30–120 minutes depending on your hardware.\n")

from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
from TTS.trainer import Trainer, TrainerArgs

config = XttsConfig()
config.load_json("config.json")

# Point to our dataset
config.datasets = [{
    "name": "kikuyu",
    "meta_file_train": FLAT_METADATA,
    "path": "dataset/",
    "language": "en",
}]

config.output_path = "./output"
config.epochs = 20
config.batch_size = 4
config.grad_accum_steps = 4

model = Xtts.init_from_config(config)
model.load_checkpoint(config, checkpoint_dir="./checkpoints", eval=False)

trainer = Trainer(
    TrainerArgs(
        restore_path=None,
        skip_train_epoch=False,
    ),
    config,
    output_path="./output",
    model=model,
    train_samples=model.get_data_loader(
        config,
        assets=None,
        is_eval=False,
        samples=None,
        verbose=True,
        num_gpus=1,
    ),
)

trainer.fit()
print("\nTraining complete! Model saved to ./output/")
print("To use the fine-tuned model, update main.py to load from ./output/")
