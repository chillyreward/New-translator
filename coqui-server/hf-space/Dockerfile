FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU
RUN pip install --no-cache-dir \
    torch==2.2.0+cpu \
    torchaudio==2.2.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install coqui-tts (maintained fork)
RUN pip install --no-cache-dir "coqui-tts"

# Install server dependencies
RUN pip install --no-cache-dir \
    fastapi==0.111.0 \
    "uvicorn[standard]==0.30.1" \
    pydantic==2.7.1 \
    soundfile==0.12.1 \
    numpy==1.26.4

# Pre-download XTTS v2 model
RUN python -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"

# Copy server code
COPY main.py .
COPY config.json .
COPY speaker_samples/ ./speaker_samples/

# HuggingFace Spaces runs on port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
