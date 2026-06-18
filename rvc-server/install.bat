@echo off
title RVC Server Setup
cd /d "%~dp0"

echo [1/5] Upgrading pip...
venv311\Scripts\python.exe -m pip install --upgrade pip

echo [2/5] Installing torch 2.6.0 CPU...
venv311\Scripts\python.exe -m pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu

echo [3/5] Installing core deps...
venv311\Scripts\python.exe -m pip install fastapi==0.111.0 "uvicorn[standard]==0.30.1" soundfile==0.12.1 "numpy>=1.24.0,<2.0" "pydantic>=2.0.0" python-multipart

echo [4/5] Installing pitch extraction libs...
venv311\Scripts\python.exe -m pip install praat-parselmouth pyworld faiss-cpu

echo [4b/5] Installing fairseq-fixed (pre-built wheel, no source compile)...
venv311\Scripts\python.exe -m pip install fairseq-fixed

echo [5/5] Installing rvc-python with --no-deps (fairseq already satisfied)...
venv311\Scripts\python.exe -m pip install rvc-python --no-deps

echo.
echo Done! Run: venv311\Scripts\python.exe main.py
pause
