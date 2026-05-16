"""
Run this before deploying to DigitalOcean.
Copies your best speaker samples into coqui-server/speaker_samples/
so they get included in the Docker image.

Usage:
    cd coqui-server
    python prepare_deploy.py
"""

import os
import shutil

# Best samples for voice cloning — longer phrases work better
BEST_SAMPLES = [
    "how are you.wav",
    "i love you.wav",
    "come here.wav",
    "thank you.wav",
    "help me.wav",
    "i am hungry.wav",
    "i am thirsty.wav",
    "keep quiet.wav",
    "stop laughing.wav",
    "thank you so much.wav",
    "i will call you.wav",
    "come into the house.wav",
    "that girl has nice cheeks.wav",
    "i will slap you.wav",
    "speaking.wav",
    "reading.wav",
    "writing.wav",
]

CHUNKS_DIR = "../public/audio/chunks"
OUTPUT_DIR = "speaker_samples"
MAIN_SAMPLE = "../public/audio/voice-training-1.wav"

os.makedirs(OUTPUT_DIR, exist_ok=True)

copied = 0

# Copy main voice training file first
if os.path.exists(MAIN_SAMPLE):
    shutil.copy2(MAIN_SAMPLE, os.path.join(OUTPUT_DIR, "voice-training-1.wav"))
    print(f"  ✓ voice-training-1.wav")
    copied += 1

# Copy best chunk samples
for filename in BEST_SAMPLES:
    src = os.path.join(CHUNKS_DIR, filename)
    dst = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"  ✓ {filename}")
        copied += 1
    else:
        print(f"  ✗ MISSING: {filename}")

print(f"\nCopied {copied} speaker samples to {OUTPUT_DIR}/")
print("Ready to build Docker image.")
