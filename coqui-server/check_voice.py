"""
check_voice.py — Preview exactly which WAV files Coqui will use as speaker references.
Run before starting main.py to confirm your voice setup.

Usage:
    cd coqui-server
    venv311\Scripts\activate
    python check_voice.py
"""
import os
import soundfile as sf

_LOCAL_MAIN     = "../public/audio/voice-training-1.wav"
_DATASET_CHUNKS = "./dataset/chunks"
MIN_CHUNK_DURATION = 2.0
MAX_SUPPORT_CHUNKS = 8

print("=" * 55)
print("  Coqui XTTS v2 — Voice Reference Check")
print("=" * 55)

# Primary reference
if os.path.exists(_LOCAL_MAIN):
    info = sf.info(_LOCAL_MAIN)
    print(f"\n✅ PRIMARY: {_LOCAL_MAIN}")
    print(f"   Duration : {info.duration:.1f}s  (ideal: 6–30s)")
    print(f"   Rate     : {info.samplerate}Hz")
    print(f"   Channels : {info.channels}")
    if info.duration < 6:
        print("   ⚠  Too short — record more speech for better cloning")
    elif info.duration > 60:
        print("   ⚠  Very long — consider trimming to 15–30s for best results")
    else:
        print("   ✅ Duration is good")
else:
    print(f"\n❌ PRIMARY NOT FOUND: {_LOCAL_MAIN}")
    print("   Record a 15–30s voice sample and save it there.")

# Support chunks
print(f"\nSUPPORT CHUNKS (≥{MIN_CHUNK_DURATION}s, top {MAX_SUPPORT_CHUNKS}):")
results = []
if os.path.exists(_DATASET_CHUNKS):
    for fname in os.listdir(_DATASET_CHUNKS):
        if not fname.endswith(".wav"):
            continue
        fpath = os.path.join(_DATASET_CHUNKS, fname)
        try:
            info = sf.info(fpath)
            if info.duration >= MIN_CHUNK_DURATION:
                results.append((info.duration, fname))
        except Exception:
            pass
    results.sort(reverse=True)
    for dur, name in results[:MAX_SUPPORT_CHUNKS]:
        print(f"   {dur:.1f}s  {name}")
    skipped = len([r for r in results if r not in results[:MAX_SUPPORT_CHUNKS]])
    total_chunks = len([f for f in os.listdir(_DATASET_CHUNKS) if f.endswith(".wav")])
    short = total_chunks - len(results)
    if short:
        print(f"   (skipped {short} clips shorter than {MIN_CHUNK_DURATION}s)")
else:
    print(f"   ⚠  {_DATASET_CHUNKS} not found")

print(f"\nTOTAL REFERENCES: {1 + min(MAX_SUPPORT_CHUNKS, len(results))}")
print("\nRestart main.py to apply any changes.")
print("=" * 55)
