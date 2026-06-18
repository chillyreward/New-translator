@echo off
title OpenVoice v2 Server (port 5004)
echo.
echo  ================================================
echo   OpenVoice v2 -- Kikuyu Voice Server
echo   http://localhost:5004
echo  ================================================
echo.

cd /d "%~dp0"

if not exist venv311\Scripts\activate.bat (
    echo [ERROR] venv311 not found. Run setup first.
    pause
    exit /b 1
)

call venv311\Scripts\activate.bat
echo [OpenVoice] Starting server...
python main.py

pause
