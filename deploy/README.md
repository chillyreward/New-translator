# DigitalOcean Deployment Guide

## Recommended Droplet

| Option | Specs | Cost | Best for |
|---|---|---|---|
| Basic | 4 vCPU, 16GB RAM | ~$96/month | MMS TTS + GPT-4o translation |
| GPU | 1x RTX 4000, 16GB VRAM | ~$70/hour | Gemma 12B fast inference |
| GPU (reserved) | 1x H100 | ~$2.99/hour | Production at scale |

**Start with the 16GB RAM basic droplet** — it runs MMS TTS fast and uses GPT-4o for translation (already working). Add GPU later if needed.

---

## Step-by-step deployment

### 1. Create Droplet
- digitalocean.com → Create → Droplets
- Ubuntu 22.04 LTS
- Region: Frankfurt (closest to Kenya)
- Size: 16GB RAM / 4 vCPU ($96/month) or GPU droplet
- Add your SSH key (or use password auth)

### 2. SSH into your droplet
```bash
ssh root@YOUR_DROPLET_IP
```

### 3. Upload the GGUF model (if using Gemma)
From your local machine:
```bash
scp C:\Users\swanti\Desktop\kikuyu-gemma.gguf root@YOUR_DROPLET_IP:/opt/
```

### 4. Run setup script
```bash
curl -fsSL https://raw.githubusercontent.com/chillyreward/New-translator/main/deploy/setup.sh | bash
```

Or upload and run manually:
```bash
bash /opt/gikuyu-app/deploy/setup.sh
```

### 5. Add your API keys
```bash
nano /opt/gikuyu-app/.env.local
```

Fill in:
- `OPENAI_API_KEY`
- `HUGGINGFACE_API_KEY`

### 6. Import Gemma model into Ollama
```bash
ollama create kikuyu-gemma -f /opt/gikuyu-app/deploy/Modelfile
```

### 7. Build and start Next.js
```bash
cd /opt/gikuyu-app
npm run build
systemctl start gikuyu-app
```

### 8. Configure Nginx
```bash
bash /opt/gikuyu-app/deploy/nginx.sh YOUR_DROPLET_IP
```

### 9. Check everything is running
```bash
systemctl status gikuyu-app
systemctl status mms-tts
systemctl status ollama
curl http://localhost:3000
curl http://localhost:5004/health
```

---

## Update the app

When you push new code:
```bash
cd /opt/gikuyu-app
git pull origin main
npm install
npm run build
systemctl restart gikuyu-app
```

---

## Costs estimate

| Service | Monthly cost |
|---|---|
| 16GB RAM Droplet | $96 |
| Domain (Namecheap) | $1 |
| OpenAI API (usage) | $5-20 |
| **Total** | **~$102-117/month** |

With GPU droplet (hourly billing, turn off when not needed):
- 8 hours/day × 30 days × $0.70 = ~$168/month
