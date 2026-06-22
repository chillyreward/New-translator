"""
Install script for the RVC server on Windows with Python 3.11.

The problem:
  rvc-python depends on fairseq, which fails to build from
  source on Windows because fairseq's setup.py cannot find version.txt when
  cloned without its full git history.

The fix:
  1. Install fairseq-fixed first — a pre-packaged fork that ships a proper
     wheel for Python 3.11/3.12 and satisfies the `fairseq` requirement.
  2. Then install rvc-python with --no-deps so pip doesn't try to rebuild
     fairseq from source again.
  3. Install everything else normally.

Run with:
    venv311\\Scripts\\python.exe do_install.py
"""
import subprocess, sys

pip = [sys.executable, "-m", "pip", "install"]

steps = [
    # Step 1 — upgrade pip/wheel first to avoid old resolver bugs
    (pip + ["--upgrade", "pip", "setuptools", "wheel"],
     "Upgrading pip, setuptools, wheel"),

    # Step 2 — torch CPU wheel (skip if you already have GPU torch)
    (pip + ["torch==2.6.0", "torchaudio==2.6.0",
            "--index-url", "https://download.pytorch.org/whl/cpu"],
     "Installing PyTorch (CPU)"),

    # Step 3 — web server + audio I/O
    (pip + ["fastapi==0.111.0", "uvicorn[standard]==0.30.1",
            "soundfile==0.12.1", "numpy>=2.1.0",
            "pydantic>=2.0.0", "python-multipart"],
     "Installing FastAPI / audio libs"),

    # Step 4 — pitch extraction (no fairseq needed for inference)
    (pip + ["praat-parselmouth", "pyworld", "faiss-cpu"],
     "Installing pitch extraction libs"),

    # Step 5 — rvc-python
    (pip + ["rvc-python"],
     "Installing rvc-python"),

    # Step 6 — remaining runtime deps
    (pip + ["ffmpeg-python", "librosa", "scipy", "tqdm", "numba"],
     "Installing remaining runtime deps"),

    # Step 7 — extra deps
    (pip + ["av", "loguru", "torchcrepe", "omegaconf==2.3.0"],
     "Installing extra deps (av, loguru, torchcrepe, omegaconf)"),
]

for cmd, label in steps:
    print(f"\n>>> {label}")
    print("    " + " ".join(cmd[3:]))
    r = subprocess.run(cmd)
    if r.returncode != 0:
        print(f"\nFAILED at step: {label} (exit {r.returncode})")
        sys.exit(r.returncode)
    print("    OK")

print("\nAll done!")
print("Run: venv311\\Scripts\\python.exe main.py")
