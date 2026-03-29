# EV Charge App — On-Premises Server Pricing
### Complete Cost Breakdown (All amounts in ₹ INR | $1 = ₹84)

---

## SECTION A — One-Time Software Development Costs

| # | Item | Cost (₹) |
|---|---|---|
| A1 | App Development (Full-Stack) | ₹5,00,000 |
| A2 | UI/UX Design | ₹90,000 |
| A3 | DevOps & Server Setup | ₹80,000 |
| A4 | QA & Testing | ₹36,000 |
| A5 | Google Play Store Registration | ₹2,100 |
| A6 | Apple App Store (iOS) | ₹8,316 |
| A7 | Domain Name (yourevcharge.com) | ₹1,200 |
| A8 | SSL Certificate (Let's Encrypt) | ₹0 (free) |
| A9 | JWT RS256 Keys | ₹0 (self-generated) |
| A10 | QR HMAC Secret Key | ₹0 (self-generated) |
| **TOTAL ONE-TIME SOFTWARE** | | **₹7,17,616** |

---

## SECTION B — One-Time Hardware Purchase Costs

### B1. Small Setup — 0 to 1,000 Users

| # | Hardware | Specification | Cost (₹) |
|---|---|---|---|
| B1 | API Server | Dell PowerEdge R350, 16 core, 32 GB RAM, 1TB SSD | ₹2,68,800 |
| B2 | Database Server | Dell PowerEdge R450, 24 core, 64 GB RAM, 2TB NVMe RAID | ₹5,46,000 |
| B3 | Network Switch | Cisco 48-port Managed Gigabit | ₹67,200 |
| B4 | UPS Power Backup | APC 3000VA | ₹50,400 |
| B5 | Server Rack + Cabling | 12U rack cabinet + ethernet cables | ₹25,000 |
| | **Hardware Total (Small)** | | **₹9,57,400** |
| | **Software + Hardware Total** | | **₹16,75,016** |

---

### B2. Medium Setup — 1,000 to 10,000 Users

| # | Hardware | Specification | Cost (₹) |
|---|---|---|---|
| B1 | 3× API Servers | Dell R350, 16 core, 32 GB RAM each | ₹8,06,400 |
| B2 | PostgreSQL Primary | Dell R650, 32 core, 128 GB RAM, 4TB NVMe RAID | ₹13,44,000 |
| B3 | PostgreSQL Read Replica | Dell R550, 16 core, 64 GB RAM, 2TB NVMe | ₹7,56,000 |
| B4 | Redis Cluster (3 nodes) | 3× servers, 8 core, 16 GB RAM each | ₹5,04,000 |
| B5 | Load Balancer Server | 8 core, 16 GB RAM (Nginx/HAProxy) | ₹1,68,000 |
| B6 | Core Network Switch | Cisco 48-port 10 Gbps managed | ₹2,10,000 |
| B7 | UPS (redundant pair) | APC 10000VA × 2 units | ₹2,52,000 |
| B8 | Server Rack + Cabling | 42U full rack cabinet + patch panel | ₹84,000 |
| | **Hardware Total (Medium)** | | **₹41,24,400** |
| | **Software + Hardware Total** | | **₹48,42,016** |

---

### B3. Large Setup — 10,000 to 50,000 Users

| # | Hardware | Specification | Cost (₹) |
|---|---|---|---|
| B1 | 6× API Servers | 32 core, 64 GB RAM each | ₹32,25,600 |
| B2 | PostgreSQL Primary | 64 core, 256 GB RAM, 10TB NVMe RAID | ₹42,00,000 |
| B3 | 2× PostgreSQL Replicas | 32 core, 128 GB RAM each | ₹25,20,000 |
| B4 | Redis Cluster (6 nodes) | 16 core, 32 GB RAM each | ₹16,12,800 |
| B5 | 2× Load Balancers (HA pair) | 16 core, 32 GB RAM each | ₹5,04,000 |
| B6 | Core Network Switch | Cisco Nexus 48-port 10 Gbps | ₹8,40,000 |
| B7 | UPS + Generator Backup | Industrial UPS + diesel generator | ₹10,50,000 |
| B8 | Full Server Room Setup | Racks, precision cooling, cabling | ₹4,20,000 |
| | **Hardware Total (Large)** | | **₹1,43,72,400** |
| | **Software + Hardware Total** | | **₹1,50,90,016** |

---

## SECTION C — Monthly On-Premises Running Costs

### C1. Small Setup (0–1,000 Users) — ₹69,094/month

| # | Item | Details | ₹/month |
|---|---|---|---|
| C1 | Datacenter / Colocation Rent | Mumbai/Bangalore DC (half rack) | ₹16,800 |
| C2 | Power Consumption | 2 servers × 200W × 720 hrs × ₹8/unit | ₹4,200 |
| C3 | Internet Leased Line | 100 Mbps dedicated (Tata/Airtel) | ₹12,000 |
| C4 | IT Maintenance | 5 hrs/month × ₹1,500/hr | ₹7,500 |
| C5 | Hardware Amortization | ₹9,57,400 ÷ 36 months | ₹26,594 |
| C6 | Hardware Insurance | Annual premium ÷ 12 | ₹2,000 |
| | **Small Monthly Total** | | **₹69,094** |

---

### C2. Medium Setup (1,000–10,000 Users) — ₹2,51,367/month

| # | Item | Details | ₹/month |
|---|---|---|---|
| C1 | Datacenter / Colocation Rent | Full rack in tier-3 DC | ₹42,000 |
| C2 | Power Consumption | 8 servers × 300W × 720 hrs × ₹8/unit | ₹16,800 |
| C3 | Internet Leased Line | 1 Gbps dedicated + failover 500 Mbps | ₹35,000 |
| C4 | IT Maintenance | 20 hrs/month × ₹1,500/hr | ₹30,000 |
| C5 | Hardware Amortization | ₹41,24,400 ÷ 36 months | ₹1,14,567 |
| C6 | Hardware Insurance + AMC | Annual contracts ÷ 12 | ₹8,000 |
| C7 | Offsite Backup Storage | Cloud backup (cold storage) | ₹5,000 |
| | **Medium Monthly Total** | | **₹2,51,367** |

---

### C3. Large Setup (10,000–50,000 Users) — ₹8,72,233/month

| # | Item | Details | ₹/month |
|---|---|---|---|
| C1 | Dedicated DC Room | Owned/leased server room in tier-4 DC | ₹1,26,000 |
| C2 | Power Consumption | 20 servers × 400W × 720 hrs × ₹8/unit | ₹42,000 |
| C3 | Internet Leased Line | 10 Gbps primary + 1 Gbps backup | ₹1,05,000 |
| C4 | Full-time IT Team | 2 engineers × ₹70,000/month | ₹1,40,000 |
| C5 | Hardware Amortization | ₹1,43,72,400 ÷ 36 months | ₹3,99,233 |
| C6 | Insurance + AMC Contracts | Annual ÷ 12 | ₹25,000 |
| C7 | Backup + Disaster Recovery | Secondary site replication | ₹35,000 |
| | **Large Monthly Total** | | **₹8,72,233** |

---

## SECTION D — Third-Party Monthly Subscriptions

*(Same regardless of cloud or on-prem)*

| # | Service | Purpose | ₹/month |
|---|---|---|---|
| D1 | Expo EAS Production | App builds + OTA updates | ₹2,436 |
| D2 | Apple Developer Program | iOS App Store (₹8,316 ÷ 12) | ₹693 |
| D3 | Sentry Team Plan | Error tracking & crash reports | ₹2,184 |
| D4 | SendGrid Essentials | Transactional emails (50K/mo) | ₹1,680 |
| D5 | Google Maps API | Free up to 28,000 users | ₹0 |
| D6 | Google Maps API | After 28,000 users per 1,000 loads | ₹588 |
| **Subscriptions Total** | | | **₹6,993** |

---

## SECTION E — All Keys Required + Cost

| # | Key / Service | Where to Get | Cost (₹) |
|---|---|---|---|
| E1 | Google Maps Android Key | console.cloud.google.com | ₹0 (free up to 28K users) |
| E2 | Google Maps iOS Key | console.cloud.google.com | ₹0 |
| E3 | Google Maps Server Key | console.cloud.google.com | ₹0 |
| E4 | Razorpay Key ID | razorpay.com | ₹0 monthly |
| E5 | Razorpay Key Secret | razorpay.com | ₹0 monthly |
| E6 | Razorpay Webhook Secret | razorpay.com dashboard | ₹0 |
| E7 | JWT Private Key (RS256) | `openssl genrsa -out private.pem 2048` | ₹0 |
| E8 | JWT Public Key (RS256) | `openssl rsa -in private.pem -pubout` | ₹0 |
| E9 | QR HMAC Secret | `node -e "require('crypto').randomBytes(32).toString('hex')"` | ₹0 |
| E10 | Expo Project ID | expo.dev dashboard | ₹0 |
| E11 | Apple Developer Cert | developer.apple.com | ₹8,316/year |
| E12 | Google Play Account | play.google.com/console | ₹2,100 one-time |
| E13 | Sentry DSN | sentry.io | ₹0 / ₹2,184 paid |
| E14 | SendGrid API Key | sendgrid.com | ₹0 / ₹1,680 paid |

---

## SECTION F — Variable Cost Per Transaction

| Item | Rate | Per ₹440 Session |
|---|---|---|
| Razorpay Gateway Fee | 2% of amount | ₹8.80 |
| GST on gateway fee (18%) | 18% on ₹8.80 | ₹1.58 |
| **Total per transaction** | | **₹10.38** |

### Monthly Gateway Costs by Volume

| Sessions/month | Gateway Fee | GST | **Total Variable** |
|---|---|---|---|
| 500 | ₹4,400 | ₹792 | **₹5,192** |
| 2,000 | ₹17,600 | ₹3,168 | **₹20,768** |
| 5,000 | ₹44,000 | ₹7,920 | **₹51,920** |
| 10,000 | ₹88,000 | ₹15,840 | **₹1,03,840** |
| 20,000 | ₹1,76,000 | ₹31,680 | **₹2,07,680** |

---

## SECTION G — Grand Total Monthly (On-Prem + Subscriptions + Gateway)

| Scale | Users | Sessions | On-Prem Infra | Subscriptions | Gateway | **Total/month** |
|---|---|---|---|---|---|---|
| **Small** | 500 | 2,000 | ₹69,094 | ₹6,993 | ₹20,768 | **₹96,855** |
| **Medium** | 2,000 | 8,000 | ₹2,51,367 | ₹6,993 | ₹83,072 | **₹3,41,432** |
| **Standard** | 5,000 | 20,000 | ₹2,51,367 | ₹6,993 | ₹2,07,680 | **₹4,66,040** |
| **Large** | 10,000 | 40,000 | ₹8,72,233 | ₹6,993 | ₹4,15,360 | **₹12,94,586** |

---

## SECTION H — Revenue vs Cost Projection (On-Prem)

*(Assuming ₹22/kWh × 20 kWh avg = ₹440/session)*

| Scale | Sessions/mo | Revenue (₹) | Total Cost (₹) | **Net Profit (₹)** | Margin |
|---|---|---|---|---|---|
| 500 users | 2,000 | ₹8,80,000 | ₹96,855 | **₹7,83,145** | 88.9% |
| 2,000 users | 8,000 | ₹35,20,000 | ₹3,41,432 | **₹31,78,568** | 90.3% |
| 5,000 users | 20,000 | ₹88,00,000 | ₹4,66,040 | **₹83,33,960** | 94.7% |
| 10,000 users | 40,000 | ₹1,76,00,000 | ₹12,94,586 | **₹1,63,05,414** | 92.6% |

---

## SECTION I — Break-Even Analysis (On-Prem)

### Small Setup

| Item | Amount (₹) |
|---|---|
| Total one-time investment (software + hardware) | ₹16,75,016 |
| Monthly running cost | ₹96,855 |
| Revenue per session | ₹440 |
| Sessions needed to cover monthly cost | ~220 sessions |
| **Break-even on full investment** | **Month 4–5** (at 500 users) |

### Medium Setup

| Item | Amount (₹) |
|---|---|
| Total one-time investment | ₹48,42,016 |
| Monthly running cost | ₹3,41,432 |
| **Break-even on full investment** | **Month 5–6** (at 2,000 users) |

---

## SECTION J — Year 1 Total Cost of Ownership (On-Prem)

### Small Setup (500 avg users, 2,000 sessions/month)

| Item | ₹ |
|---|---|
| One-time development | ₹7,17,616 |
| Hardware purchase | ₹9,57,400 |
| Monthly running costs × 12 | ₹8,29,128 |
| Third-party subscriptions × 12 | ₹83,916 |
| Razorpay gateway fees × 12 | ₹2,49,120 |
| **Year 1 Total Cost** | **₹28,37,180** |
| **Year 1 Revenue** (2,000 × ₹440 × 12) | **₹1,05,60,000** |
| **Year 1 Net Profit** | **₹77,22,820** |

### Medium Setup (2,000 avg users, 8,000 sessions/month)

| Item | ₹ |
|---|---|
| One-time development | ₹7,17,616 |
| Hardware purchase | ₹41,24,400 |
| Monthly running costs × 12 | ₹30,16,404 |
| Third-party subscriptions × 12 | ₹83,916 |
| Razorpay gateway fees × 12 | ₹9,96,864 |
| **Year 1 Total Cost** | **₹89,39,200** |
| **Year 1 Revenue** (8,000 × ₹440 × 12) | **₹4,22,40,000** |
| **Year 1 Net Profit** | **₹3,33,00,800** |

---

## SECTION K — On-Prem vs AWS Comparison

| Scale | On-Prem Monthly | AWS Monthly | Verdict |
|---|---|---|---|
| 500 users | ₹96,855 | ₹36,245 | **AWS cheaper by ₹60,610** |
| 2,000 users | ₹3,41,432 | ₹1,26,605 | **AWS cheaper by ₹2,14,827** |
| 5,000 users | ₹4,66,040 | ₹2,51,213 | **AWS cheaper by ₹2,14,827** |
| 10,000 users | ₹12,94,586 | ₹5,70,193 | **AWS cheaper by ₹7,24,393** |
| 30,000 users | ₹8,72,233 | ₹14,00,000 | **On-Prem cheaper by ₹5,27,767** |
| 50,000 users | ₹8,72,233 | ₹21,00,000 | **On-Prem cheaper by ₹12,27,767** |

> **Recommendation: Start with AWS. Migrate to On-Prem only after 25,000+ users.**

---

## SECTION L — Colocation Data Center Options (India)

| Provider | Location | Rack Cost/month | Uptime SLA |
|---|---|---|---|
| CtrlS | Hyderabad, Mumbai | ₹25,000–60,000 | 99.995% |
| Nxtra (Airtel) | Mumbai, Delhi, Bangalore | ₹20,000–50,000 | 99.99% |
| STT GDC | Mumbai, Chennai | ₹22,000–55,000 | 99.99% |
| NTT Ltd | Mumbai, Bangalore | ₹18,000–45,000 | 99.99% |
| Netmagic | Mumbai, Bangalore, Delhi | ₹15,000–40,000 | 99.98% |

---

## SECTION M — Internet Leased Line Providers (India)

| Provider | Speed | Cost/month |
|---|---|---|
| Tata Communications | 100 Mbps | ₹10,000–15,000 |
| Airtel Enterprise | 100 Mbps | ₹8,000–12,000 |
| Reliance Jio | 100 Mbps | ₹7,000–10,000 |
| Tata Communications | 1 Gbps | ₹30,000–50,000 |
| Airtel Enterprise | 1 Gbps | ₹25,000–40,000 |

---

## SECTION N — Complete `.env` Keys Reference

### `backend/.env`
```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# On-Prem PostgreSQL (your server IP)
DATABASE_URL=postgresql://postgres:PASSWORD@192.168.1.10:5432/evcharge

# On-Prem Redis (your server IP)
REDIS_URL=redis://192.168.1.11:6379

# JWT (from openssl)
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nPASTE\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nPASTE\n-----END PUBLIC KEY-----"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# QR (64 char hex from node crypto)
QR_HMAC_SECRET=64_CHAR_HEX_HERE

# Razorpay
RAZORPAY_KEY_ID=rzp_live_XXXX
RAZORPAY_KEY_SECRET=XXXX
RAZORPAY_WEBHOOK_SECRET=XXXX

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Google Maps (server-side)
GOOGLE_MAPS_SERVER_KEY=AIzaSyXXXX

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### `.env` (Frontend)
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXX
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXX
EXPO_PUBLIC_APP_SCHEME=evcharge
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## SECTION O — Final On-Prem Quote Summary

```
╔══════════════════════════════════════════════════════════════╗
║        EV CHARGE APP — ON-PREMISES PRICING SUMMARY          ║
╠══════════════════════════════════════════════════════════════╣
║  ONE-TIME — SOFTWARE                                         ║
║  ├─ Development & Design          ₹6,26,000                  ║
║  ├─ Store Registrations           ₹10,416                    ║
║  └─ Subtotal Software             ₹7,17,616                  ║
╠══════════════════════════════════════════════════════════════╣
║  ONE-TIME — HARDWARE                                         ║
║  ├─ Small  (0–1K users)           ₹9,57,400                  ║
║  ├─ Medium (1K–10K users)         ₹41,24,400                 ║
║  └─ Large  (10K–50K users)        ₹1,43,72,400               ║
╠══════════════════════════════════════════════════════════════╣
║  TOTAL ONE-TIME (Software+Hardware)                          ║
║  ├─ Small                         ₹16,75,016                 ║
║  ├─ Medium                        ₹48,42,016                 ║
║  └─ Large                         ₹1,50,90,016               ║
╠══════════════════════════════════════════════════════════════╣
║  MONTHLY RUNNING COSTS                                       ║
║  ├─ Small  (0–1K users)           ₹69,094/mo                 ║
║  ├─ Medium (1K–10K users)         ₹2,51,367/mo               ║
║  └─ Large  (10K–50K users)        ₹8,72,233/mo               ║
╠══════════════════════════════════════════════════════════════╣
║  SUBSCRIPTIONS (all tiers)        ₹6,993/mo                  ║
╠══════════════════════════════════════════════════════════════╣
║  PER TRANSACTION (Razorpay+GST)   ₹10.38/session             ║
╠══════════════════════════════════════════════════════════════╣
║  COMPLETELY FREE                                             ║
║  ├─ SSL Certificate (Let's Encrypt)                          ║
║  ├─ JWT + QR Keys (self-generated)                           ║
║  └─ Google Maps (up to 28K users)                            ║
╠══════════════════════════════════════════════════════════════╣
║  YEAR 1 — SMALL SETUP                                        ║
║  ├─ Total Investment              ₹28,37,180                 ║
║  ├─ Total Revenue                 ₹1,05,60,000               ║
║  └─ Net Profit                    ₹77,22,820                 ║
╠══════════════════════════════════════════════════════════════╣
║  BREAK-EVEN                       Month 4–5                  ║
║                                                              ║
║  NOTE: Use AWS until 25,000+ users.                          ║
║  On-Prem becomes cheaper only at very high scale.            ║
╚══════════════════════════════════════════════════════════════╝
```

---

*All prices in INR at $1 = ₹84 | March 2026 | Hardware prices based on Dell India pricing*
