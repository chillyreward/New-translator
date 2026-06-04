"""
Prepare the fine-tuning dataset from manifest.json.

- Validates each audio file (length, sample rate, mono)
- Resamples everything to 22050 Hz mono WAV
- Filters out clips that are too short (<0.5s) or too long (>15s)
- Builds metadata.csv in LJSpeech format (used by VITS/MMS fine-tuning)
- Splits into train/val sets

Usage:
    python prepare.py

Output:
    dataset/prepared/wavs/       — all normalized WAV files
    dataset/prepared/metadata.csv
    dataset/prepared/train.csv
    dataset/prepared/val.csv
"""

import os
import json
import csv
import random
import shutil
import soundfile as sf
import numpy as np
from pathlib import Path
from tqdm import tqdm

SCRIPT_DIR   = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MANIFEST     = SCRIPT_DIR / "manifest.json"
PREPARED_DIR = SCRIPT_DIR / "prepared"
WAVS_DIR     = PREPARED_DIR / "wavs"

PREPARED_DIR.mkdir(exist_ok=True)
WAVS_DIR.mkdir(exist_ok=True)

TARGET_SR    = 22050
MIN_DURATION = 0.5    # seconds
MAX_DURATION = 15.0   # seconds
VAL_SPLIT    = 0.05   # 5% validation


def resample_to_22050(arr: np.ndarray, sr: int) -> np.ndarray:
    if arr.ndim > 1:
        arr = arr.mean(axis=1)
    arr = arr.astype(np.float32)
    if sr == TARGET_SR:
        return arr
    try:
        import resampy
        return resampy.resample(arr, sr, TARGET_SR)
    except ImportError:
        ratio   = TARGET_SR / sr
        new_len = int(len(arr) * ratio)
        return np.interp(
            np.linspace(0, len(arr) - 1, new_len),
            np.arange(len(arr)),
            arr
        ).astype(np.float32)


def process_audio(src_path: Path) -> tuple[np.ndarray, float] | None:
    """Load, validate, resample. Returns (array, duration) or None if invalid."""
    try:
        arr, sr = sf.read(str(src_path), dtype="float32", always_2d=False)
        arr = resample_to_22050(arr, sr)
        duration = len(arr) / TARGET_SR
        if duration < MIN_DURATION or duration > MAX_DURATION:
            return None
        return arr, duration
    except Exception as e:
        print(f"  [skip] {src_path.name}: {e}")
        return None


def main():
    if not MANIFEST.exists():
        print(f"[ERROR] manifest.json not found. Run download_datasets.py first.")
        return

    with open(MANIFEST, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"Loaded {len(records)} records from manifest")

    rows     = []
    skipped  = 0

    for rec in tqdm(records, desc="Processing"):
        text = rec.get("text", "").strip()
        if not text:
            skipped += 1
            continue

        # Resolve path
        src = PROJECT_ROOT / rec["file"]
        if not src.exists():
            # Try absolute
            src = Path(rec["file"])
        if not src.exists():
            skipped += 1
            continue

        result = process_audio(src)
        if result is None:
            skipped += 1
            continue

        arr, duration = result

        # Build a clean filename
        stem     = src.stem.replace(" ", "_").replace("/", "_")[:80]
        source   = rec.get("source", "unknown")
        out_name = f"{source}_{stem}.wav"
        out_path = WAVS_DIR / out_name

        sf.write(str(out_path), arr, TARGET_SR, subtype="PCM_16")

        rows.append({
            "filename": out_name,
            "text":     text,
            "duration": round(duration, 3),
            "source":   source,
        })

    print(f"\n✓ Processed: {len(rows)}")
    print(f"✗ Skipped:   {skipped}")

    if not rows:
        print("[ERROR] No valid audio found.")
        return

    # Shuffle and split
    random.shuffle(rows)
    n_val   = max(1, int(len(rows) * VAL_SPLIT))
    val     = rows[:n_val]
    train   = rows[n_val:]

    def write_csv(path: Path, data: list):
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["filename", "text", "duration", "source"])
            writer.writeheader()
            writer.writerows(data)

    write_csv(PREPARED_DIR / "metadata.csv", rows)
    write_csv(PREPARED_DIR / "train.csv",    train)
    write_csv(PREPARED_DIR / "val.csv",      val)

    total_hours = sum(r["duration"] for r in rows) / 3600
    print(f"\n✓ Total audio: {total_hours:.2f} hours")
    print(f"✓ Train: {len(train)} | Val: {len(val)}")
    print(f"✓ Files saved to: {PREPARED_DIR}")
    print("\nNext step: Upload prepared/ to Google Drive and run finetune.ipynb")


if __name__ == "__main__":
    main()
