#!/bin/bash
# ============================================================
# Gikuyu Translator — DigitalOcean Droplet Setup Script
# Ubuntu 22.04 LTS
# Run as root: bash setup.sh
# ============================================================

set -e
echo "=== Gikuyu Translator Server Setup ==="

# ── System update ─────────────────────────────────────────
echo "[1/8] Updating system..."
apt-get update -y && apt-get upgrade -y
apt-get install -y git curl wget build-essential python3 python3-pip python3-venv nginx ufw

# ── Node.js 20 ────────────────────────────────────────────
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── Ollama ────────────────────────────────────────────────
echo "[3/8] Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh
systemctl enable ollama
systemctl start ollama
sleep 5

# ── Clone repo ────────────────────────────────────────────
echo "[4/8] Cloning repository..."
cd /opt
git clone https://github.com/chillyreward/New-translator.git gikuyu-app
cd gikuyu-app
npm install

# ── .env.local ────────────────────────────────────────────
echo "[5/8] Creating .env.local..."
cat > /opt/gikuyu-app/.env.local << 'ENVEOF'
OPENAI_API_KEY=your_openai_key_here
HUGGINGFACE_API_KEY=your_hf_key_here
MMS_TTS_URL=http://localhost:5004
GEMMA_TRANSLATE_URL=http://localhost:11434
HELSINKI_TRANSLATE_URL=http://localhost:5005
NEXT_PUBLIC_APP_URL=http://your_droplet_ip_here
ENVEOF
echo "⚠️  Edit /opt/gikuyu-app/.env.local with your actual API keys"

# ── MMS TTS Server ────────────────────────────────────────
echo "[6/8] Setting up MMS TTS server..."
cd /opt/gikuyu-app/mms-server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# ── Pull Kikuyu Gemma model via Ollama ────────────────────
echo "[7/8] Note: Pull Kikuyu Gemma model manually after setup:"
echo "      ollama create kikuyu-gemma -f /opt/gikuyu-app/deploy/Modelfile"
echo "      (Upload kikuyu-gemma.gguf to /opt first)"

# ── Systemd services ──────────────────────────────────────
echo "[8/8] Creating systemd services..."

# Next.js service
cat > /etc/systemd/system/gikuyu-app.service << 'EOF'
[Unit]
Description=Gikuyu Translator Next.js App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gikuyu-app
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# MMS TTS service
cat > /etc/systemd/system/mms-tts.service << 'EOF'
[Unit]
Description=MMS TTS Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gikuyu-app/mms-server
ExecStart=/opt/gikuyu-app/mms-server/venv/bin/python main.py
Restart=always
RestartSec=15
Environment=HF_HOME=/opt/hf-cache

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gikuyu-app mms-tts
systemctl start mms-tts

echo ""
echo "============================================"
echo "✓ Setup complete!"
echo ""
echo "NEXT STEPS:"
echo "1. Edit /opt/gikuyu-app/.env.local with your API keys"
echo "2. Upload kikuyu-gemma.gguf to /opt/"
echo "3. Run: ollama create kikuyu-gemma -f /opt/gikuyu-app/deploy/Modelfile"
echo "4. Build Next.js: cd /opt/gikuyu-app && npm run build"
echo "5. Start app: systemctl start gikuyu-app"
echo "6. Run: bash /opt/gikuyu-app/deploy/nginx.sh"
echo "============================================"
