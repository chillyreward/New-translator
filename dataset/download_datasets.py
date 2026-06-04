"""
Download Kikuyu TTS datasets from HuggingFace.

Datasets:
  1. google/WaxalNLP  (kik_tts subset) — 2,030 single-speaker TTS recordings
  2. evie-8/kikuyu-data               — 322+ hours community speech

Usage:
    pip install datasets soundfile numpy tqdm
    python download_datasets.py

Output:
    dataset/raw/waxal/    — WAXAL kik_tts audio + transcripts
    dataset/raw/evie8/    — evie-8 audio + transcripts
"""

import os
import json
import soundfile as sf
import numpy as np
from pathlib import Path
from tqdm import tqdm

# Force datasets to use soundfile instead of torchcodec for audio decoding
os.environ["DATASETS_AUDIO_BACKEND"] = "soundfile"

OUTPUT_DIR = Path(__file__).parent / "raw"
WAXAL_DIR  = OUTPUT_DIR / "waxal"
EVIE8_DIR  = OUTPUT_DIR / "evie8"

WAXAL_DIR.mkdir(parents=True, exist_ok=True)
EVIE8_DIR.mkdir(parents=True, exist_ok=True)


def save_audio(audio_array, sampling_rate, path: Path):
    """Resample to 22050Hz mono and save as WAV."""
    import numpy as np
    arr = np.array(audio_array, dtype=np.float32)
    if arr.ndim > 1:
        arr = arr.mean(axis=1)  # stereo → mono

    # Resample if needed
    if sampling_rate != 22050:
        try:
            import resampy
            arr = resampy.resample(arr, sampling_rate, 22050)
        except ImportError:
            # fallback: basic linear resample
            ratio = 22050 / sampling_rate
            new_len = int(len(arr) * ratio)
            arr = np.interp(
                np.linspace(0, len(arr) - 1, new_len),
                np.arange(len(arr)),
                arr
            )

    sf.write(str(path), arr, 22050, subtype="PCM_16")


# ── 1. Google WAXAL kik_tts ───────────────────────────────────────────────────
def download_waxal():
    print("\n=== Downloading Google WAXAL kik_tts ===")
    try:
        from datasets import load_dataset
        ds = load_dataset("google/WaxalNLP", "kik_tts", split="train", trust_remote_code=True)
    except Exception as e:
        print(f"[ERROR] Failed to load WAXAL: {e}")
        print("Make sure you're logged in: huggingface-cli login")
        return []

    records = []
    audio_dir = WAXAL_DIR / "wavs"
    audio_dir.mkdir(exist_ok=True)

    for i, row in enumerate(tqdm(ds, desc="WAXAL")):
        try:
            text = row.get("transcription") or row.get("text") or row.get("sentence", "")
            if not text.strip():
                continue

            audio     = row["audio"]
            arr       = np.array(audio["array"], dtype=np.float32)
            sr        = audio["sampling_rate"]
            filename  = f"waxal_{i:05d}.wav"
            out_path  = audio_dir / filename

            save_audio(arr, sr, out_path)
            records.append({
                "file": str(out_path.relative_to(OUTPUT_DIR.parent)),
                "text": text.strip(),
                "source": "waxal"
            })
        except Exception as e:
            print(f"  [skip] row {i}: {e}")

    print(f"[WAXAL] Saved {len(records)} records")
    return records


# ── 2. evie-8/kikuyu-data ─────────────────────────────────────────────────────
def download_evie8(max_samples=5000):
    """
    Downloads up to max_samples from the 30s-filtered config.
    You need to accept dataset terms on HuggingFace first.
    """
    print(f"\n=== Downloading evie-8/kikuyu-data (up to {max_samples} samples) ===")
    print("NOTE: You must accept dataset terms at:")
    print("      https://huggingface.co/datasets/evie-8/kikuyu-data")
    print("      Then run: huggingface-cli login")

    try:
        from datasets import load_dataset
        ds = load_dataset(
            "evie-8/kikuyu-data",
            "new_duration_30s",
            split="train",
            trust_remote_code=True,
            streaming=True   # stream to avoid downloading 18GB at once
        )
    except Exception as e:
        print(f"[ERROR] Failed to load evie-8: {e}")
        return []

    records  = []
    audio_dir = EVIE8_DIR / "wavs"
    audio_dir.mkdir(exist_ok=True)

    for i, row in enumerate(tqdm(ds, desc="evie-8", total=max_samples)):
        if i >= max_samples:
            break
        try:
            text = row.get("text", "")
            if not text.strip():
                continue

            audio    = row["audio"]
            arr      = np.array(audio["array"], dtype=np.float32)
            sr       = audio["sampling_rate"]
            filename = f"evie8_{i:05d}.wav"
            out_path = audio_dir / filename

            save_audio(arr, sr, out_path)
            records.append({
                "file": str(out_path.relative_to(OUTPUT_DIR.parent)),
                "text": text.strip(),
                "source": "evie8"
            })
        except Exception as e:
            print(f"  [skip] row {i}: {e}")

    print(f"[evie-8] Saved {len(records)} records")
    return records


# ── 3. Your existing chunks ───────────────────────────────────────────────────
def collect_existing_chunks():
    """Pull in the existing public/audio/chunks/ recordings with their transcripts."""
    print("\n=== Collecting existing project audio chunks ===")

    # Transcript map from dictionary.ts (hardcoded here for use in Python)
    TRANSCRIPTS = {
        "hello.wav":                        "kohana atia",
        "how are you.wav":                  "Uhoro waku",
        "come here.wav":                    "uka haha",
        "come in.wav":                      "ingira",
        "come into the house.wav":          "ingira mucii",
        "come.wav":                         "uka",
        "go away.wav":                      "thii ukiuge",
        "help me.wav":                      "ndeithia",
        "keep quiet.wav":                   "kira",
        "quiet.wav":                        "Tumia",
        "shut up.wav":                      "Kira",
        "stop laughing.wav":               "tiga gutheka",
        "Give me water.wav":               "he mae",
        "water.wav":                        "maai",
        "food.wav":                         "irio",
        "i am hungry.wav":                  "ndi muhotu",
        "i am thirsty.wav":                 "ndi munyotu",
        "father.wav":                       "fafa",
        "mother.wav":                       "maitu",
        "friend.wav":                       "murata",
        "enemy.wav":                        "thu",
        "home.wav":                         "mucii",
        "i love you.wav":                   "ningwendete",
        "i will call you.wav":              "ningukuhurira thimu",
        "thank you.wav":                    "ni ngatho",
        "thank you so much.wav":            "ni ngatho muno",
        "I will slap you.wav":              "Ningukuhura",
        "hand.wav":                         "Guoko",
        "face.wav":                         "uthiu",
        "my face.wav":                      "uthiu wakwa",
        "head.wav":                         "Mutwe",
        "eye.wav":                          "Ritho",
        "eyes.wav":                         "Maitho",
        "ear.wav":                          "Gutu",
        "ears.wav":                         "Matu",
        "nose.wav":                         "Iniuru",
        "mouth.wav":                        "Kanua",
        "my mouth.wav":                     "Kanua gakwa",
        "neck.wav":                         "Gigo",
        "shoulder.wav":                     "Kiande",
        "shoulders.wav":                    "Iande",
        "chest.wav":                        "Githuri",
        "stomach.wav":                      "Nda",
        "waist.wav":                        "Njohero",
        "small waist.wav":                  "Njohero njeke",
        "palm.wav":                         "Ruhi",
        "elbow.wav":                        "Kigokora",
        "finger.wav":                       "Kiara",
        "fingers.wav":                      "Ciara",
        "leg.wav":                          "Kuguru",
        "legs.wav":                         "Maguru",
        "thigh.wav":                        "Kiero",
        "thighs.wav":                       "Shiero",
        "knee.wav":                         "Iru",
        "ankle.wav":                        "Itede",
        "ankles.wav":                       "Matede",
        "heel.wav":                         "Ikinya",
        "cheeks.wav":                       "Makai",
        "forehead.wav":                     "Githi",
        "hair.wav":                         "Juere",
        "beards.wav":                       "Nderu",
        "that girl has nice cheeks.wav":   "Moiretu uria ena makai mega",
        "goat.wav":                         "mburi",
        "horse.wav":                        "mbarathi",
        "maize.wav":                        "mbembe",
        "mouse or mice.wav":               "mbia",
        "kikuyu.wav":                       "gigikuyu",
        "agikuyu.wav":                      "agikuyu",
        "reading.wav":                      "Guthoma",
        "writing.wav":                      "Kwandika",
        "speaking.wav":                     "Guaria",
        "i am sick.wav":                    "ndi murwaru",
        "i have a headache.wav":            "ndi na mutu wa mutwe",
        "i am having a stomach ache.wav":   "ndi na mutu wa nda",
        "i am going to the hospital.wav":   "nindiguka kwa ndotitari",
        "a good doctor.wav":                "ndotitari mwega",
        "i am pregnant.wav":                "ndi na mimba",
        "i have recovered.wav":             "nathira",
        "i an taking medicine.wav":         "ndi gukua dawa",
        "i have gone to the washroom.wav":  "naguka choo",
        "hospital.wav":                     "hospitali",
        "doctor.wav":                       "ndotitari",
        "medicine.wav":                     "dawa",
        "needle.wav":                       "sindano",
        "blood.wav":                        "thakame",
        "urine.wav":                        "mkojo",
        "feices.wav":                       "mavi",
        "pain.wav":                         "mutu",
        "pregnancy.wav":                    "mimba",
        "coughing.wav":                     "kohota",
        "constipation.wav":                 "kuhindwa kwenda choo",
        "shivering or shaking.wav":        "kutetemeka",
        "tiredness.wav":                    "kurimu",
        "muscle pull.wav":                  "mwili kuuma",
        "physician.wav":                    "ndotitari",
        "patient.wav":                      "murwaru",
        "smelling.wav":                     "kunuka",
        "stomachache.wav":                  "mutu wa nda",
        "fever or temparature.wav":        "homa",
        "id.wav":                           "kadi ya utambulisho",
        "sweater.wav":                      "sweta",
        "shorts.wav":                       "suruali fupi",
        "shirt.wav":                        "shati",
        "blouse.wav":                       "blauzi",
        "socks.wav":                        "soksi",
        "shoe.wav":                         "kiatu",
        "shoes.wav":                        "viatu",
        "tie.wav":                          "tai",
        "trouser.wav":                      "suruali",
        "vest.wav":                         "vesti",
        "gumboot.wav":                      "buti ya mpira",
        "typesof clothes.wav":             "aina za nguo",
        "coffee-varieties.wav":            "ni midhemba irikuu ya kahuu ikuragio kenya",
    }

    chunks_dir = Path(__file__).parent.parent / "public" / "audio" / "chunks"
    records    = []

    if not chunks_dir.exists():
        print(f"[WARN] Chunks directory not found: {chunks_dir}")
        return records

    for wav_file in sorted(chunks_dir.glob("*.wav")):
        transcript = TRANSCRIPTS.get(wav_file.name)
        if transcript:
            records.append({
                "file": f"public/audio/chunks/{wav_file.name}",
                "text": transcript,
                "source": "project_chunks"
            })

    # Also include voice-training-1.wav if it has a transcript
    voice_training = Path(__file__).parent.parent / "public" / "audio" / "voice-training-1.wav"
    if voice_training.exists():
        records.append({
            "file": "public/audio/voice-training-1.wav",
            "text": "",   # fill in manually
            "source": "project_chunks"
        })
        print("[NOTE] voice-training-1.wav found — add its transcript manually in metadata.csv")

    print(f"[Chunks] Found {len(records)} records")
    return records


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--waxal",      action="store_true", help="Download WAXAL dataset")
    parser.add_argument("--evie8",      action="store_true", help="Download evie-8 dataset")
    parser.add_argument("--chunks",     action="store_true", help="Include existing project chunks")
    parser.add_argument("--all",        action="store_true", help="Download all datasets")
    parser.add_argument("--max-evie8",  type=int, default=5000, help="Max evie-8 samples to download")
    args = parser.parse_args()

    all_records = []

    if args.all or args.chunks:
        all_records += collect_existing_chunks()

    if args.all or args.waxal:
        all_records += download_waxal()

    if args.all or args.evie8:
        all_records += download_evie8(max_samples=args.max_evie8)

    if not all_records:
        print("\nNo datasets downloaded. Use --all, --waxal, --evie8, or --chunks")
        exit(0)

    # Save combined manifest
    manifest_path = Path(__file__).parent / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Total records: {len(all_records)}")
    print(f"✓ Manifest saved: {manifest_path}")
    print("\nNext step: python prepare.py")
