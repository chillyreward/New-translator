"""
Generate metadata.csv from WAV chunk filenames.
Assumes filename = transcript (e.g. "wee mwega.wav" → transcript is "wee mwega")

Usage:
    python generate_metadata.py

Place your WAV chunks in: dataset/chunks/
Output: dataset/metadata.csv
"""

import os

CHUNKS_DIR = "dataset/chunks"
META_FILE  = "dataset/metadata.csv"

if not os.path.exists(CHUNKS_DIR):
    print(f"Error: {CHUNKS_DIR} not found")
    exit(1)

wav_files = sorted([f for f in os.listdir(CHUNKS_DIR) if f.endswith(".wav")])

if not wav_files:
    print(f"No WAV files found in {CHUNKS_DIR}")
    exit(1)

print(f"Found {len(wav_files)} WAV files")

with open(META_FILE, "w", encoding="utf-8") as meta:
    for filename in wav_files:
        # Remove .wav extension to get transcript
        transcript = os.path.splitext(filename)[0]
        # Clean up: replace underscores/hyphens with spaces
        transcript = transcript.replace("_", " ").replace("-", " ").strip()
        line = f"chunks/{filename}|{transcript}\n"
        meta.write(line)
        print(f"  {filename} → {transcript}")

print(f"\nDone. metadata.csv written with {len(wav_files)} entries")
print(f"File: {META_FILE}")
