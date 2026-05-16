# Deploy Coqui Voice Server to DigitalOcean

This deploys your Kikuyu voice server as a permanent online service (~$6/month).

---

## Step 1 — Prepare speaker samples

Run this on your local machine:
```bash
cd coqui-server
python prepare_deploy.py
```

This copies your best WAV files into `coqui-server/speaker_samples/`.

---

## Step 2 — Create DigitalOcean account

1. Go to https://digitalocean.com
2. Sign up (you get $200 free credit for 60 days)
3. Add a payment method

---

## Step 3 — Create a Droplet

1. Click **Create → Droplets**
2. Choose:
   - **Region:** closest to you (e.g. London, Frankfurt)
   - **Image:** Ubuntu 22.04 LTS
   - **Size:** Basic → Regular → **2GB RAM / 1 vCPU** ($12/month)
     - Note: 1GB ($6) may be too small for XTTS v2. Use 2GB to be safe.
   - **Authentication:** Password (set a strong password)
3. Click **Create Droplet**
4. Wait ~1 minute — you get an IP address like `167.99.123.45`

---

## Step 4 — Connect to your server

Open a terminal and connect:
```bash
ssh root@YOUR_IP_ADDRESS
```

Enter your password when prompted.

---

## Step 5 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
```

---

## Step 6 — Upload your files

On your LOCAL machine (new terminal), run:
```bash
cd C:\Users\swanti\Desktop\Gikuyu-Demo
scp -r coqui-server root@YOUR_IP_ADDRESS:/root/coqui-server
```

---

## Step 7 — Build and run the Docker container

Back on the server (SSH terminal):
```bash
cd /root/coqui-server
docker build -t kikuyu-voice .
docker run -d --name kikuyu-voice -p 5003:5003 --restart always kikuyu-voice
```

The first build takes 10–15 minutes (downloads the XTTS model).

---

## Step 8 — Test it

```bash
curl http://YOUR_IP_ADDRESS:5003/health
```

You should see:
```json
{"status": "ok", "speaker_samples": 18, "device": "cpu"}
```

---

## Step 9 — Add to Vercel

In Vercel → Settings → Environment Variables:
```
COQUI_TTS_URL = http://YOUR_IP_ADDRESS:5003
```

Redeploy on Vercel. Your voice is now live 24/7.

---

## Monitoring

View logs:
```bash
docker logs kikuyu-voice -f
```

Restart if needed:
```bash
docker restart kikuyu-voice
```

---

## Cost

- 2GB Droplet: ~$12/month
- After $200 free credit runs out (~60 days)
- Cancel anytime from DigitalOcean dashboard
