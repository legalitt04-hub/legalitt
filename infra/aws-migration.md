# ─────────────────────────────────────────────────────────────────────────────
# infra/aws-migration.md
#
# When you're ready to move from Render to AWS
# Zero code changes needed — only infrastructure changes
# ─────────────────────────────────────────────────────────────────────────────

# Moving from Render to AWS — Exact Steps

## Why move to AWS?
- Render free tier sleeps after 15 min inactivity
- Render starter ($7/mo) = 1 instance, no auto-scaling
- AWS = full control, auto-scaling, cheaper at scale
- Move when you have 500+ daily active users

## What DOESN'T change when you move
- All backend code (100% identical)
- All environment variable names (just new values)
- Mobile app code (just update API_URL in .env)
- Database (MongoDB Atlas stays the same)
- All third-party services (Razorpay, Cloudinary, etc.)

## AWS Services You'll Use
- EC2 t3.small → runs your Node.js API (replaces Render)
- ALB (Application Load Balancer) → replaces nginx SSL
- Route53 → DNS for api.legalitt.com (replaces Render domain)
- ECR → stores your Docker images (optional)
- ElastiCache Redis → replaces local Redis for Socket.io scaling

## Step-by-Step Migration

### Step 1 — Create AWS Account
1. Go to aws.amazon.com
2. Create account with legalitt.app@gmail.com
3. Add a credit card (you get 12 months free tier)
4. Choose region: ap-south-1 (Mumbai) — closest to India

### Step 2 — Launch EC2 Instance
1. AWS Console → EC2 → Launch Instance
2. Name: legalitt-api
3. OS: Ubuntu Server 22.04 LTS
4. Instance type: t3.small (2 vCPU, 2GB RAM — $17/mo)
   - t3.micro is free tier but too small for production
5. Key pair: Create new → name it "legalitt-key" → download .pem file
6. Security group rules:
   - SSH (22): Your IP only
   - HTTP (80): Anywhere
   - HTTPS (443): Anywhere
7. Storage: 20GB gp3
8. Click Launch

### Step 3 — Run Setup Script
```bash
# Upload and run setup script
scp -i legalitt-key.pem infra/aws-setup.sh ubuntu@YOUR_EC2_IP:~/
ssh -i legalitt-key.pem ubuntu@YOUR_EC2_IP
chmod +x aws-setup.sh && ./aws-setup.sh
```

### Step 4 — Deploy Code
```bash
# On EC2
cd /var/www/legalitt
git clone https://github.com/YOUR_USERNAME/legalitt.git .
cd backend
cp .env.example .env
nano .env  # Paste all your existing Render env vars — they're identical
npm install --production
node src/utils/seed.js  # Only if new database
pm2 start ecosystem.config.js --env production
pm2 startup && pm2 save
```

### Step 5 — Point Domain to EC2
1. Get your EC2's Elastic IP:
   - AWS Console → EC2 → Elastic IPs → Allocate → Associate to your instance
2. In your domain registrar (GoDaddy/Namecheap):
   - Add A record: api.legalitt.com → YOUR_ELASTIC_IP
3. Wait 5-30 minutes for DNS to propagate

### Step 6 — Set Up SSL
```bash
# On EC2
sudo cp /var/www/legalitt/nginx.conf /etc/nginx/sites-available/legalitt
sudo ln -s /etc/nginx/sites-available/legalitt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.legalitt.com
```

### Step 7 — Update Mobile App
Change in mobile-app/.env:
```
API_URL=https://api.legalitt.com/api
SOCKET_URL=https://api.legalitt.com
```

Rebuild and submit new version to Play Store:
```bash
eas build --platform android --profile production
eas submit --platform android
```

### Step 8 — Turn Off Render
1. Once AWS is working and health check passes
2. Render dashboard → your service → Settings → Suspend service
3. You're fully on AWS

## Cost Comparison

| Service | Render Starter | AWS t3.small |
|---------|---------------|--------------|
| API server | $7/mo | $17/mo |
| No sleep | ✅ | ✅ |
| Auto-scale | ❌ | ✅ (with ASG) |
| Custom domain | ✅ | ✅ |
| Best for | < 1000 users | 1000+ users |
