# EV Charge — QR Code Charging App

A production-ready EV charging station QR code scanner app built with **Expo** (React Native) + **Fastify** (Node.js) backend.

## Features

- **Authentication**: Signup/Login with JWT (RS256) + refresh token rotation, stored in SecureStore
- **Map**: GPS-accurate location + nearby EV station markers on dark Google Maps
- **Station Discovery**: Filter by radius (1–25 km), connector type, availability
- **QR Scanner**: Scan station QR code → instant port validation via HMAC-signed payload
- **Payment**: Stripe authorization hold → confirmed on session end
- **Charging Session**: Real-time status with 5s polling, animated UI
- **Session History**: Full history with kWh, duration, cost breakdown
- **Scale**: Designed for 10,000+ concurrent clients

## Tech Stack

### Frontend (Expo)
| Package | Purpose |
|---|---|
| Expo SDK 51 + Expo Router v3 | File-based navigation |
| react-native-maps | Google Maps with dark style |
| expo-camera | QR code scanning |
| expo-location | GPS location |
| expo-secure-store | Encrypted token storage |
| @tanstack/react-query | Data fetching + 5s polling |
| zustand | Global state |
| @stripe/stripe-react-native | Payment sheet |
| react-hook-form + zod | Form validation |

### Backend (Node.js)
| Package | Purpose |
|---|---|
| Fastify v4 | HTTP server (3x faster than Express) |
| Prisma v5 + PostgreSQL | Type-safe ORM |
| Redis (ioredis) | Caching, rate limits, token blacklist |
| argon2id | Password hashing |
| @fastify/jwt (RS256) | Asymmetric JWT |
| Stripe | Payment processing |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Expo CLI: `npm install -g expo-cli`

### 1. Backend Setup

```bash
cd backend

# Copy env and fill in values
cp .env.example .env

# Start PostgreSQL + Redis
docker-compose up -d postgres redis

# Install dependencies
npm install

# Run DB migrations
npx prisma migrate dev --name init

# Seed sample stations
npm run db:seed

# Start dev server
npm run dev
```

### 2. Generate JWT Keys (RS256)

```bash
# In backend directory
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Add to .env (replace newlines with \n):
# JWT_PRIVATE_KEY="$(cat private.pem | tr '\n' '\\n')"
# JWT_PUBLIC_KEY="$(cat public.pem | tr '\n' '\\n')"
```

### 3. Frontend Setup

```bash
# Back to root
cp .env.example .env
# Fill in: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

npm install
npx expo start
```

### 4. Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable "Maps SDK for Android" and "Maps SDK for iOS"
3. Create API key → add to `app.json` → `android.config.googleMaps.apiKey`
4. Add to `.env` → `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### 5. Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Get publishable key → `.env` → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Get secret key → `backend/.env` → `STRIPE_SECRET_KEY`
4. Webhook: `stripe listen --forward-to localhost:3000/api/v1/payments/webhook`
5. Copy webhook secret → `backend/.env` → `STRIPE_WEBHOOK_SECRET`

## Project Structure

```
qrcode/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout + auth guard
│   ├── (auth)/             # Login, Signup
│   ├── (tabs)/             # Map, Stations, Scanner, Profile
│   ├── payment.tsx         # Payment modal
│   └── charging/           # Active session screen
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── services/               # API client services
├── store/                  # Zustand state stores
├── types/                  # TypeScript types
├── constants/              # Theme colors, spacing
├── backend/                # Node.js API server
│   ├── prisma/             # Database schema
│   └── src/
│       ├── modules/        # auth, stations, qr, sessions, payments
│       ├── config/         # env, database, redis
│       └── middleware/     # JWT authentication
└── COST_BREAKDOWN.md       # Infrastructure & cost analysis
```

## API Endpoints

```
POST /api/v1/auth/register     Sign up
POST /api/v1/auth/login        Sign in
POST /api/v1/auth/refresh      Refresh JWT
POST /api/v1/auth/logout       Sign out
GET  /api/v1/auth/me           Current user

GET  /api/v1/stations/nearby   ?lat&lon&radius&limit
GET  /api/v1/stations/:id      Station detail

POST /api/v1/qr/validate       Validate QR code payload

POST /api/v1/sessions          Create session
GET  /api/v1/sessions/:id      Session status (poll every 5s)
PATCH /api/v1/sessions/:id/stop Stop session
GET  /api/v1/sessions/active   Active session
GET  /api/v1/sessions/history  Past sessions

POST /api/v1/payments/intent   Create Stripe PaymentIntent
POST /api/v1/payments/confirm  Confirm + activate charger
POST /api/v1/payments/webhook  Stripe webhook
```

## QR Code Format

Each physical charging port has a QR sticker. The QR code encodes:
```
evcharge://scan?payload=<base64url_encoded_json>
```

Payload JSON:
```json
{ "v": 1, "cid": "<connector_uuid>", "sid": "<station_uuid>", "pn": 3, "ts": 1711234567, "sig": "<hmac_sha256>" }
```

Generate QR codes for new ports using:
```ts
import { qrService } from './src/modules/qr/qr.service'
const payload = qrService.generatePayload(connectorId, stationId, portNumber)
// Encode as QR: `evcharge://scan?payload=${payload}`
```

## Production Deployment

See [COST_BREAKDOWN.md](./COST_BREAKDOWN.md) for detailed AWS/GCP/Azure cost analysis.

Quick production checklist:
- [ ] Generate RSA key pair for JWT
- [ ] Set `NODE_ENV=production`
- [ ] Configure PgBouncer for connection pooling
- [ ] Set up Redis Cluster (6 nodes) for high availability
- [ ] Enable RDS Multi-AZ
- [ ] Configure Cloudflare in front of ALB
- [ ] Set up Sentry for error tracking
- [ ] Enable EAS Update for OTA app updates
- [ ] Configure Stripe webhooks for production

## License

MIT
# EvappFullStack
