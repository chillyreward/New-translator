@echo off
title OpenVoice v2 -- Setup
echo.
echo  ================================================
echo   OpenVoice v2 Setup (voice conversion only)
echo   No MeloTTS -- no C++ compiler required
echo  ================================================
echo.
cd /d "%~dp0"

:: Create venv if missing
if not exist venv311\Scripts\python.exe (
    echo [1/4] Creating Python 3.11 venv...
    py -3.11 -m venv venv311
    if %errorlevel% neq 0 (
        echo [ERROR] py -3.11 not found. Install Python 3.11 from python.org
        pause & exit /b 1
    )
) else (
    echo [1/4] venv311 already exists, skipping create.
)

call venv311\Scripts\activate.bat

echo [2/4] Upgrading pip...
python -m pip install --upgrade pip --quiet

echo [3/4] Installing torch + fastapi + soundfile...
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu --quiet
pip install fastapi==0.111.0 "uvicorn[standard]==0.30.1" python-multipart soundfile "numpy>=1.24.0" "pydantic>=2.0.0" --quiet

echo [4/4] Installing OpenVoice v2 (clones from GitHub, ~1-2 min)...
pip install "myshell-openvoice @ git+https://github.com/myshell-ai/OpenVoice.git" --no-deps --quiet
if %errorlevel% neq 0 (
    echo [ERROR] OpenVoice install failed. Check your internet connection.
    pause & exit /b 1
)

echo.
echo  ================================================
echo   Setup complete!
echo.
echo   First run will auto-download OpenVoice v2
echo   checkpoints (~500 MB).
echo.
echo   Run: start.bat
echo  ================================================
pause
