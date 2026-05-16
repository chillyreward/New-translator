FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU first (smaller, faster)
RUN pip install --no-cache-dir \
    torch==2.2.0+cpu \
    torchaudio==2.2.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install coqui-tts (maintained fork, Python 3.9-3.12, prebuilt wheels)
RUN pip install --no-cache-dir "coqui-tts[server]"

# Install server dependencies
RUN pip install --no-cache-dir \
    fastapi==0.111.0 \
    uvicorn==0.30.1 \
    pydantic==2.7.1 \
    soundfile==0.12.1 \
    numpy==1.26.4

# Pre-download XTTS v2 model during build (so startup is instant)
RUN python -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"

# Copy server code and samples
COPY main.py .
COPY config.json .
COPY speaker_samples/ ./speaker_samples/

EXPOSE 5003

HEALTHCHECK --interval=30s --timeout=10s --start-period=180s \
    CMD curl -f http://localhost:5003/health || exit 1

CMD ["python", "main.py"]
