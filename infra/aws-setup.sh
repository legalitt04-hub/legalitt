#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# infra/aws-setup.sh
#
# Run this script on a fresh AWS EC2 Ubuntu 22.04 instance to set up
# everything needed to run Legalitt.
#
# Usage:
#   1. SSH into your EC2: ssh -i your-key.pem ubuntu@your-ec2-ip
#   2. Upload this script: scp infra/aws-setup.sh ubuntu@your-ec2-ip:~/
#   3. Run it: chmod +x aws-setup.sh && ./aws-setup.sh
#
# What it installs:
#   - Node.js 20
#   - PM2 (process manager)
#   - Nginx (reverse proxy)
#   - Certbot (SSL certificates)
#   - Git
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately if any command fails

echo "================================================"
echo "  Legalitt AWS EC2 Setup Script"
echo "================================================"

# ── System update ─────────────────────────────────────────────────────────────
echo ""
echo "Step 1: Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ── Node.js 20 ────────────────────────────────────────────────────────────────
echo ""
echo "Step 2: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node.js version: $(node --version)"
echo "npm version:     $(npm --version)"

# ── PM2 ───────────────────────────────────────────────────────────────────────
echo ""
echo "Step 3: Installing PM2..."
sudo npm install -g pm2
pm2 --version

# ── Nginx ─────────────────────────────────────────────────────────────────────
echo ""
echo "Step 4: Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# ── Certbot (SSL) ─────────────────────────────────────────────────────────────
echo ""
echo "Step 5: Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx

# ── Git ───────────────────────────────────────────────────────────────────────
echo ""
echo "Step 6: Installing Git..."
sudo apt-get install -y git

# ── Create app directory ──────────────────────────────────────────────────────
echo ""
echo "Step 7: Setting up app directory..."
sudo mkdir -p /var/www/legalitt
sudo chown ubuntu:ubuntu /var/www/legalitt

# ── Firewall ──────────────────────────────────────────────────────────────────
echo ""
echo "Step 8: Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
echo "Firewall status:"
sudo ufw status

echo ""
echo "================================================"
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Clone your repo:"
echo "     cd /var/www/legalitt"
echo "     git clone https://github.com/YOUR_USERNAME/legalitt.git ."
echo ""
echo "  2. Configure backend:"
echo "     cd backend"
echo "     cp .env.example .env"
echo "     nano .env  (add all your real values)"
echo ""
echo "  3. Install dependencies and seed:"
echo "     npm install --production"
echo "     node src/utils/seed.js"
echo ""
echo "  4. Start with PM2:"
echo "     pm2 start ecosystem.config.js --env production"
echo "     pm2 startup"
echo "     pm2 save"
echo ""
echo "  5. Configure Nginx:"
echo "     sudo cp /var/www/legalitt/nginx.conf /etc/nginx/sites-available/legalitt"
echo "     sudo ln -s /etc/nginx/sites-available/legalitt /etc/nginx/sites-enabled/"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "  6. Get SSL certificate:"
echo "     sudo certbot --nginx -d api.legalitt.com"
echo "================================================"
