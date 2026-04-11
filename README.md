# Legalitt — Legal Services Web App

Find verified advocates near you across Madhya Pradesh. Full-stack web application with map view, OTP login, Google auth, and real advocate data.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, React Router, Axios, React Leaflet |
| Backend | Node.js + Express.js, MongoDB + Mongoose |
| Auth | JWT, Google OAuth, Mobile OTP (Twilio / Firebase) |
| Map | Leaflet (OpenStreetMap — free, no API key needed) |
| Data | 500 seeded advocates from real MP Bar Council data |

---

## Project Structure

```
legalitt/
├── backend/
│   ├── config/           database.js
│   ├── controllers/      authController.js, advocateController.js, reviewController.js
│   ├── middleware/        auth.js (JWT)
│   ├── models/           User.js, Advocate.js, OTP.js
│   ├── routes/           auth.js, advocates.js, reviews.js
│   ├── scripts/          seed.js, seed_data.json (500 advocates)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/   Navbar, AdvocateCard, MapView, SearchFilters, StarRating, Spinner
    │   ├── context/      AuthContext.jsx
    │   ├── hooks/        useGeolocation.js, useAdvocates.js
    │   ├── pages/        Home, Login, Register, AdvocateProfile, MapPage
    │   ├── services/     api.js (Axios)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone / extract the project

### 2. Backend setup

```bash
cd legalitt/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values (at minimum: MONGODB_URI)

# Seed 500 advocates from your xlsx data
npm run seed

# Start development server
npm run dev
# → http://localhost:5000
```

### 3. Frontend setup

```bash
cd legalitt/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — VITE_API_URL is already set to /api (proxied via Vite)

# Start development server
npm run dev
# → http://localhost:5173
```

### 4. Open in browser

Visit `http://localhost:5173`

The map works immediately using free OpenStreetMap tiles — no API key required.

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development

# Required
MONGODB_URI=mongodb://localhost:27017/legalitt

# Required for JWT
JWT_SECRET=your_32_char_secret_minimum_here
JWT_EXPIRES_IN=7d

# Google OAuth (get from console.cloud.google.com)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# OTP via Twilio (optional in dev — OTP logged to console)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

> **Map works without any API key** — using free OpenStreetMap via Leaflet.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Email + password signup |
| POST | `/api/auth/login` | Email + password login |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/otp-send` | Send OTP to mobile |
| POST | `/api/auth/otp-verify` | Verify OTP + login/register |
| GET | `/api/auth/me` | Get current user (auth required) |

### Advocates
| Method | Endpoint | Description | Query Params |
|---|---|---|---|
| GET | `/api/advocates` | List all (paginated) | `page, limit, specialization, city, sort, minRating, search` |
| GET | `/api/advocates/nearby` | Geo query | `lat, lng, radius (km), specialization, limit` |
| GET | `/api/advocates/:id` | Single advocate | — |
| GET | `/api/advocates/specializations` | List all specializations | — |
| GET | `/api/advocates/cities` | List all cities | — |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reviews` | Add review (auth required) |
| GET | `/api/reviews/:advocateId` | Get reviews for advocate |

---

## Required API Keys

| Service | Used For | How to Get | Required? |
|---|---|---|---|
| MongoDB Atlas | Cloud database | [mongodb.com/atlas](https://mongodb.com/atlas) | ✅ (or use local MongoDB) |
| Google OAuth Client ID | Google Sign-In | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 | ⚡ Optional (email login works without it) |
| Twilio | OTP SMS | [twilio.com](https://twilio.com) | ⚡ Optional (OTP is logged to console in dev mode) |
| Google Maps API | — | Not needed — using free Leaflet/OpenStreetMap | ❌ Not required |

---

## Plugging in Your Advocate Data

The system is designed to accept any JSON in this format:

```json
{
  "name": "Advocate Name",
  "specialization": "Criminal Law",
  "rating": 4.2,
  "reviews": [{ "user": "Rahul", "comment": "Very helpful", "rating": 5 }],
  "location": {
    "type": "Point",
    "coordinates": [77.4126, 23.2599],
    "address": "Civil Lines, Bhopal",
    "city": "Bhopal"
  },
  "experience": "5 years",
  "enrollNo": "1234",
  "enrollYear": 2019,
  "mobile": "9876543210",
  "email": "advocate@example.com",
  "image": "https://...",
  "available": true,
  "fees": 1500
}
```

To replace seed data:
1. Edit `backend/scripts/seed_data.json` with your records
2. Run `npm run seed` in the backend directory

---

## Dev Notes

- **OTP in development**: OTP is printed to backend console and returned in API response. Remove this before production.
- **Auth**: JWT tokens stored in `localStorage`. Protected routes require `Authorization: Bearer <token>` header.
- **Map**: Uses React Leaflet + OpenStreetMap — completely free.
- **Geospatial**: MongoDB `$near` query with `2dsphere` index for fast nearby searches.
- **Haversine fallback**: Client-side distance calculation when coordinates are available.

---

## Production Deployment

### Backend (Railway / Render / Heroku)
```bash
npm start
# Set NODE_ENV=production
# Set all .env variables in your hosting platform
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Set VITE_API_URL to your deployed backend URL
```

---

*Built with ❤️ for legal access in Madhya Pradesh*
