# Legalitt — Legal Services Platform

A production-ready mobile application connecting clients with verified advocates across India. Built like Practo, but for legal services.

---

## 🏗️ Architecture

```
legalitt/
├── backend/          # Node.js + Express REST API + Socket.io
└── mobile-app/       # React Native (Expo) — iOS & Android
```

## 🎯 Features

**Client**
- Find verified advocates nearby using GPS
- Filter by specialization, language, and fee
- Book consultations with Razorpay payment
- Real-time chat with countdown timer after payment
- AI Legal Assistant (FIR drafts, legal advice)
- Upload and share documents securely

**Advocate**
- Dashboard with today's cases, earnings, and requests
- Accept/reject case requests
- Earnings wallet with withdrawal
- Edit specialization and availability

**Security**
- JWT access + refresh token rotation
- Role-based access control (client / advocate / admin)
- Helmet security headers
- Rate limiting
- MongoDB injection prevention
- XSS sanitization
- bcrypt password hashing
- Razorpay signature verification
- HTTPS ready (nginx config included)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier works)
- Expo CLI: `npm i -g @expo/cli`

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # Fill in your credentials
npm run seed            # Seed 6 Indian advocates + admin user
npm run dev             # http://localhost:5000
```

Test: `curl http://localhost:5000/health`

### 2. Mobile App

```bash
cd mobile-app
npm install
cp .env.example .env    # Set API_URL to your local IP

# Start Expo
npx expo start

# Scan QR with Expo Go app on your phone
# OR press 'a' for Android emulator
```

### 3. Docker (Full Stack)

```bash
# From project root
docker-compose up

# API at http://localhost:5000
# Seed data: docker-compose exec api node src/utils/seed.js
```

---

## 📱 Building for Stores

### Android (Play Store)
```bash
cd mobile-app

# Install EAS CLI
npm i -g eas-cli
eas login

# Configure (first time only)
eas build:configure

# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS (App Store)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 🔐 Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Min 32 chars random string |
| `JWT_REFRESH_SECRET` | Min 32 chars random string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `RAZORPAY_KEY_ID` | Razorpay key (use `rzp_test_` prefix for testing) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary for file uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ANTHROPIC_API_KEY` | Claude API for AI features |
| `MSG91_AUTH_KEY` | MSG91 for phone OTP (Indian SMS) |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON |

### Mobile App `.env`
| Variable | Description |
|---|---|
| `API_URL` | Backend API URL |
| `SOCKET_URL` | Backend WebSocket URL |
| `GOOGLE_WEB_CLIENT_ID` | Google OAuth web client ID |
| `RAZORPAY_KEY_ID` | Razorpay key ID |

---

## 🌐 AWS Deployment

```bash
# 1. Launch EC2 t3.small Ubuntu 22.04

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
npm install -g pm2

# 4. Clone and install
git clone https://github.com/Krishsoni9827/legalitt.git
cd legalitt/backend
npm install --production

# 5. Create .env with production values

# 6. Start with PM2 cluster mode
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save

# 7. Install and configure Nginx
sudo apt install nginx certbot python3-certbot-nginx
sudo cp /path/to/nginx.conf /etc/nginx/sites-available/legalitt
sudo ln -s /etc/nginx/sites-available/legalitt /etc/nginx/sites-enabled/
sudo certbot --nginx -d api.legalitt.com
sudo systemctl reload nginx
```

---

## 📊 API Reference

```
POST  /api/auth/register          Register with email/password
POST  /api/auth/login             Login
POST  /api/auth/google            Google OAuth login
POST  /api/auth/send-otp          Send phone OTP (MSG91)
POST  /api/auth/verify-otp        Verify OTP and login
POST  /api/auth/refresh           Refresh access token
POST  /api/auth/logout            Logout
GET   /api/auth/me                Get current user

GET   /api/advocates              List (filter: city, spec, fee, rating)
GET   /api/advocates/nearby       Nearby by ?lat=&lng=
GET   /api/advocates/:id          Single advocate + reviews
GET   /api/advocates/specializations
GET   /api/advocates/cities
POST  /api/advocates/profile      Create/update advocate profile
GET   /api/advocates/me           Advocate's own profile

POST  /api/bookings               Create booking
POST  /api/bookings/confirm-payment  Verify Razorpay + unlock chat
GET   /api/bookings/my            Client's bookings
GET   /api/bookings/advocate      Advocate's bookings
PATCH /api/bookings/:id/status    Accept / reject / complete

POST  /api/payments/create-order  Create Razorpay order

GET   /api/chats                  Chat list
GET   /api/chats/:id/messages     Message history
POST  /api/chats/:id/messages     Send message (REST fallback)

GET   /api/reviews?advocateId=    Reviews for an advocate
POST  /api/reviews                Post review (requires completed booking)

POST  /api/ai/legal-advice        Ask AI a legal question
POST  /api/ai/fir-draft           Generate FIR draft
POST  /api/ai/chat                Multi-turn AI chat

POST  /api/uploads/avatar         Upload profile photo
POST  /api/uploads/document       Upload document (PDF/image)

GET   /api/wallet/balance         Advocate earnings balance
GET   /api/wallet/transactions    Earnings history
GET   /api/wallet/monthly-stats   Monthly breakdown
POST  /api/wallet/withdraw        Request withdrawal

GET   /api/admin/stats            Dashboard stats
GET   /api/admin/advocates/pending  Pending verifications
PATCH /api/admin/advocates/:id/verify  Approve or reject
GET   /api/admin/users            All users
PATCH /api/admin/users/:id/toggle  Activate/deactivate
```

---

## 🧪 Testing

```bash
cd backend
npm test

# Quick API smoke test
curl http://localhost:5000/health
curl "http://localhost:5000/api/advocates/nearby?lat=23.18&lng=79.98"
curl "http://localhost:5000/api/advocates/specializations"
```

---

## 🗺️ Indian Market Notes

- **Default location**: Jabalpur, MP (fallback when GPS denied)
- **Currency**: INR throughout (Razorpay, display)
- **Payment**: UPI, cards, net banking via Razorpay
- **OTP**: MSG91 for Indian phone numbers
- **Seed data**: Advocates in Jabalpur, Bhopal, and Indore
- **Languages**: Hindi + English in FIR generator

---

## 🔜 Phase 2 Roadmap

- [ ] Video consultation (Agora SDK)
- [ ] Lawyer Bar Council API verification
- [ ] DigiLocker document integration
- [ ] Admin web dashboard (React)
- [ ] Multi-language UI (Hindi, Marathi, Gujarati)
- [ ] AI contract analyser
- [ ] Court date reminders
- [ ] Advocate subscription plans

---

## 📄 License

MIT — Legalitt © 2025
