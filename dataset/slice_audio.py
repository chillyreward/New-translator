"""
slice_audio.py — Prepare c-elo voice data for RVC training.
Converts all WAVs in celo-raw/ → 40kHz mono chunks → celo-sliced/
Run: rvc-server\venv311\Scripts\python.exe dataset\slice_audio.py
"""

import os, sys, subprocess, tempfile
from pathlib import Path

INPUT_DIR   = Path(__file__).parent / "celo-raw"
OUTPUT_DIR  = Path(__file__).parent / "celo-sliced"
SAMPLE_RATE = 40000
MIN_SECS    = 3.0
MAX_SECS    = 15.0
SILENCE_DB  = "-35dB"
SILENCE_SECS = "0.4"

def ffmpeg(*args, check=True):
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error"] + list(args), capture_output=True, text=True)
    if check and r.returncode != 0:
        print(f"  ffmpeg error: {r.stderr.strip()[:200]}")
    return r

def get_duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path)], capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except: return 0.0

def detect_splits(wav_path):
    r = subprocess.run(["ffmpeg", "-i", str(wav_path),
        "-af", f"silencedetect=noise={SILENCE_DB}:duration={SILENCE_SECS}",
        "-f", "null", "-"], capture_output=True, text=True)
    starts, ends = [], []
    for line in r.stderr.splitlines():
        if "silence_start" in line:
            try: starts.append(float(line.split("silence_start:")[1].split()[0]))
            except: pass
        if "silence_end" in line:
            try: ends.append(float(line.split("silence_end:")[1].split()[0]))
            except: pass
    duration = get_duration(wav_path)
    segments, speech_start = [], 0.0
    for s_end, s_start in zip(ends, starts):
        if s_start > speech_start: segments.append((speech_start, s_start))
        speech_start = s_end
    if duration > speech_start: segments.append((speech_start, duration))
    return segments

def merge_segments(segments):
    """Merge short adjacent segments up to MAX_SECS, then force-split any
    remaining segment that is still longer than MAX_SECS into fixed-length
    chunks rather than discarding it."""
    merged, buf_s, buf_e = [], None, None
    for s, e in segments:
        if buf_s is None:
            buf_s, buf_e = s, e
        elif (buf_e - buf_s) + (e - s) <= MAX_SECS:
            buf_e = e
        else:
            merged.append((buf_s, buf_e))
            buf_s, buf_e = s, e
    if buf_s is not None:
        merged.append((buf_s, buf_e))

    result = []
    for s, e in merged:
        dur = e - s
        if dur < MIN_SECS:
            continue  # too short — skip
        if dur <= MAX_SECS:
            result.append((s, e))
        else:
            # Force-split long segment into MAX_SECS chunks
            cut = s
            while cut < e:
                end = min(cut + MAX_SECS, e)
                if end - cut >= MIN_SECS:
                    result.append((cut, end))
                cut = end
    return result

def slice_file(wav_path, out_dir, idx):
    print(f"\n[{idx}] {wav_path.name}")
    tmp = Path(tempfile.mktemp(suffix=".wav"))
    ffmpeg("-i", str(wav_path), "-ar", str(SAMPLE_RATE), "-ac", "1", "-acodec", "pcm_s16le", str(tmp))
    if not tmp.exists(): print("  Conversion failed"); return 0
    segs = merge_segments(detect_splits(tmp))
    print(f"  Chunks: {len(segs)}")
    saved = 0
    for i, (s, e) in enumerate(segs):
        out = out_dir / f"{idx:02d}_{i+1:04d}.wav"
        r = ffmpeg("-ss", f"{s:.3f}", "-t", f"{e-s:.3f}", "-i", str(tmp),
            "-ar", str(SAMPLE_RATE), "-ac", "1", "-acodec", "pcm_s16le", str(out), check=False)
        if r.returncode == 0 and out.exists() and out.stat().st_size > 1000: saved += 1
    tmp.unlink(missing_ok=True)
    print(f"  Saved: {saved}")
    return saved

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
wavs = sorted(INPUT_DIR.glob("*.wav"))
print(f"Processing {len(wavs)} files → {OUTPUT_DIR}")
total = sum(slice_file(w, OUTPUT_DIR, i+1) for i, w in enumerate(wavs))
chunks = list(OUTPUT_DIR.glob("*.wav"))
mins = sum(get_duration(c) for c in chunks) / 60
print(f"\nDone! {total} chunks, {mins:.1f} minutes of training audio")
