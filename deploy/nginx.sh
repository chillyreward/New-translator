#!/bin/bash
# Configure Nginx as reverse proxy
# Run after setup.sh: bash nginx.sh YOUR_DOMAIN_OR_IP

DOMAIN=${1:-"your_droplet_ip"}

cat > /etc/nginx/sites-available/gikuyu << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    # MMS TTS server (internal only — not exposed publicly)
    # Ollama (internal only — not exposed publicly)
}
EOF

ln -sf /etc/nginx/sites-available/gikuyu /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "✓ Nginx configured for $DOMAIN"
echo "  App accessible at http://$DOMAIN"
