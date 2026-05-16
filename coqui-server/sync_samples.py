"""
sync_samples.py — Sync all dataset/chunks WAVs into speaker_samples/
and rebuild metadata.csv from only the files that actually exist.

Run this whenever you add new WAV recordings to dataset/chunks/.

Usage:
    cd coqui-server
    venv311\\Scripts\\activate
    python sync_samples.py
"""

import os
import shutil
import csv

CHUNKS_DIR      = "dataset/chunks"
SAMPLES_DIR     = "speaker_samples"
META_FILE       = "dataset/metadata.csv"
META_OUT        = "dataset/metadata.csv"   # overwrite in place

# ── Known Kikuyu transcripts keyed by English phrase (filename stem) ──────────
KNOWN_TRANSCRIPTS = {
    # Greetings / phrases
    "hello":                        "kohana atia",
    "how are you":                  "Uhoro waku",
    "come here":                    "uka haha",
    "come here (2)":                "uka haha",
    "come in":                      "ingira",
    "come into the house":          "ingira mucii",
    "come":                         "uka",
    "go away":                      "thii ukiuge",
    "help me":                      "ndeithia",
    "keep quiet":                   "kira",
    "quiet":                        "Tumia",
    "shut up":                      "Kira",
    "stop laughing":                "tiga gutheka",
    "give me water":                "he mae",
    "water":                        "maai",
    "food":                         "irio",
    "i am hungry":                  "ndi muhotu",
    "i am thirsty":                 "ndi munyotu",
    "father":                       "fafa",
    "mother":                       "maitu",
    "friend":                       "murata",
    "enemy":                        "thu",
    "home":                         "mucii",
    "i love you":                   "ningwendete",
    "i will call you":              "ningukuhurira thimu",
    "i will phone you":             "ningukuhurira thimu",
    "thank you":                    "ni ngatho",
    "thank you so much":            "ni ngatho muno",
    "i will slap you":              "Ningukuhura",
    # Body parts
    "hand":                         "Guoko",
    "face":                         "uthiu",
    "my face":                      "uthiu wakwa",
    "head":                         "Mutwe",
    "eye":                          "Ritho",
    "eyes":                         "Maitho",
    "ear":                          "Gutu",
    "ears":                         "Matu",
    "nose":                         "Iniuru",
    "mouth":                        "Kanua",
    "my mouth":                     "Kanua gakwa",
    "neck":                         "Gigo",
    "shoulder":                     "Kiande",
    "shoulders":                    "Iande",
    "chest":                        "Githuri",
    "stomach":                      "Nda",
    "waist":                        "Njohero",
    "small waist":                  "Njohero njeke",
    "palm":                         "Ruhi",
    "elbow":                        "Kigokora",
    "finger":                       "Kiara",
    "fingers":                      "Ciara",
    "leg":                          "Kuguru",
    "legs":                         "Maguru",
    "thigh":                        "Kiero",
    "thighs":                       "Shiero",
    "knee":                         "Iru",
    "ankle":                        "Itede",
    "ankles":                       "Matede",
    "heel":                         "Ikinya",
    "cheeks":                       "Makai",
    "forehead":                     "Githi",
    "hair":                         "Juere",
    "beards":                       "Nderu",
    "that girl has nice cheeks":    "Moiretu uria ena makai mega",
    # Animals / food
    "goat":                         "mburi",
    "horse":                        "mbarathi",
    "maize":                        "mbembe",
    "mouse or mice":                "mbia",
    # Language / identity
    "kikuyu":                       "gigikuyu",
    "agikuyu":                      "agikuyu",
    # Actions
    "reading":                      "Guthoma",
    "writing":                      "Kwandika",
    "speaking":                     "Guaria",
}

os.makedirs(SAMPLES_DIR, exist_ok=True)

# ── 1. Collect all WAVs from dataset/chunks ───────────────────────────────────
wav_files = sorted([f for f in os.listdir(CHUNKS_DIR) if f.lower().endswith(".wav")])
print(f"Found {len(wav_files)} WAV files in {CHUNKS_DIR}")

# ── 2. Copy each into speaker_samples (skip if already there & same size) ─────
synced = 0
for filename in wav_files:
    src = os.path.join(CHUNKS_DIR, filename)
    dst = os.path.join(SAMPLES_DIR, filename)
    src_size = os.path.getsize(src)
    if os.path.exists(dst) and os.path.getsize(dst) == src_size:
        continue  # already up to date
    shutil.copy2(src, dst)
    synced += 1
    print(f"  [synced] {filename}")

print(f"Synced {synced} new/updated files to {SAMPLES_DIR}/")

# ── 3. Rebuild metadata.csv from files that actually exist ────────────────────
rows = []
missing_transcript = []

for filename in wav_files:
    stem = os.path.splitext(filename)[0].strip().lower()
    transcript = KNOWN_TRANSCRIPTS.get(stem)
    if not transcript:
        # Fall back: use the filename stem as the transcript
        transcript = stem
        missing_transcript.append(filename)
    rows.append({
        "audio_file": f"chunks/{filename}",
        "text": transcript,
        "speaker_name": "speaker",
    })

with open(META_OUT, "w", encoding="utf-8", newline="") as f:
    f.write("audio_file|text|speaker_name\n")
    for row in rows:
        f.write(f"{row['audio_file']}|{row['text']}|{row['speaker_name']}\n")

print(f"\nRebuilt {META_OUT} with {len(rows)} entries")

if missing_transcript:
    print(f"\n⚠  {len(missing_transcript)} files had no known Kikuyu transcript (filename used as fallback):")
    for f in missing_transcript:
        print(f"   {f}")
    print("   → Add them to KNOWN_TRANSCRIPTS in this script for accurate training.")

# ── 4. Summary ────────────────────────────────────────────────────────────────
total_samples = len([f for f in os.listdir(SAMPLES_DIR) if f.lower().endswith(".wav")])
print(f"\n✅ Done.")
print(f"   speaker_samples/ : {total_samples} WAV files")
print(f"   metadata.csv     : {len(rows)} entries")
print(f"\nRestart the coqui server to pick up the new samples:")
print(f"   python main.py")
