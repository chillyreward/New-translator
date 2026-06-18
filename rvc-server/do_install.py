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
            "soundfile==0.12.1", "numpy>=1.24.0,<2.0",
            "pydantic>=2.0.0", "python-multipart"],
     "Installing FastAPI / audio libs"),

    # Step 4 — fairseq-fixed: pre-built wheel, supports Py3.11, no source build
    (pip + ["fairseq-fixed"],
     "Installing fairseq-fixed (pre-built, no source compile)"),

    # Step 5 — pitch extraction
    (pip + ["praat-parselmouth", "pyworld", "faiss-cpu"],
     "Installing pitch extraction libs"),

    # Step 6 — rvc-python with --no-deps so pip won't try to rebuild fairseq
    (pip + ["rvc-python", "--no-deps"],
     "Installing rvc-python (--no-deps, fairseq already satisfied)"),

    # Step 7 — remaining rvc-python runtime deps that aren't fairseq
    (pip + ["ffmpeg-python", "librosa", "scipy", "tqdm", "numba"],
     "Installing remaining rvc-python runtime deps"),

    # Step 8 — deps that rvc-python skipped due to --no-deps
    # omegaconf 2.0.6 has invalid metadata rejected by pip>=24.1; use 2.3.0
    (pip + ["av", "loguru", "torchcrepe", "omegaconf==2.3.0"],
     "Installing rvc-python missing deps (av, loguru, torchcrepe, omegaconf)"),
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
