"""
Split lesson1.wav into chunks using silence detection.
Saves chunks to dataset/chunks/ and generates metadata.csv

Usage:
    python split_audio.py

Requirements:
    pip install pydub
"""

import os
from pydub import AudioSegment
from pydub.silence import split_on_silence

INPUT_FILE  = os.getenv("INPUT_WAV", "C:/Users/swanti/Downloads/lesson1.wav")
OUTPUT_DIR  = "dataset/chunks"
META_FILE   = "dataset/metadata.csv"
MIN_SILENCE = 500    # ms of silence to split on
SILENCE_DB  = -40    # dB threshold for silence
MIN_CHUNK   = 1000   # ms — skip chunks shorter than 1 second
MAX_CHUNK   = 10000  # ms — skip chunks longer than 10 seconds

os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Loading {INPUT_FILE}...")
audio = AudioSegment.from_wav(INPUT_FILE)

# Convert to 16kHz mono if not already
audio = audio.set_frame_rate(16000).set_channels(1)

print("Splitting on silence...")
chunks = split_on_silence(
    audio,
    min_silence_len=MIN_SILENCE,
    silence_thresh=SILENCE_DB,
    keep_silence=200,  # keep 200ms of silence at edges
)

print(f"Found {len(chunks)} chunks")

saved = 0
with open(META_FILE, "w", encoding="utf-8") as meta:
    for i, chunk in enumerate(chunks):
        duration = len(chunk)
        if duration < MIN_CHUNK or duration > MAX_CHUNK:
            print(f"  Skipping chunk {i+1} ({duration}ms)")
            continue

        filename = f"chunk_{i+1:04d}.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)
        chunk.export(filepath, format="wav")
        meta.write(f"chunks/{filename}|\n")  # transcript left blank — fill in manually
        saved += 1
        print(f"  Saved {filename} ({duration}ms)")

print(f"\nDone. {saved} chunks saved to {OUTPUT_DIR}/")
print(f"Metadata written to {META_FILE}")
print(f"\nNext: open {META_FILE} and add Kikuyu transcripts after each |")
