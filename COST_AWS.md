# EV Charge App — AWS Cloud Pricing
### Complete Cost Breakdown (All amounts in ₹ INR | $1 = ₹84)

---

## SECTION A — One-Time Setup Costs

| # | Item | Cost (₹) |
|---|---|---|
| A1 | App Development (Full-Stack) | ₹5,00,000 |
| A2 | UI/UX Design | ₹90,000 |
| A3 | DevOps & AWS Setup | ₹80,000 |
| A4 | QA & Testing | ₹36,000 |
| A5 | Google Play Store Registration | ₹2,100 |
| A6 | Apple App Store (iOS) | ₹8,316 |
| A7 | Domain Name (yourevcharge.com) | ₹1,200 |
| A8 | SSL Certificate (AWS ACM) | ₹0 (free) |
| A9 | JWT RS256 Keys | ₹0 (self-generated) |
| A10 | QR HMAC Secret Key | ₹0 (self-generated) |
| **TOTAL ONE-TIME** | | **₹7,17,616** |

---

## SECTION B — AWS Infrastructure Monthly Costs

### B1. Starter Tier (0–1,000 Users) — ₹8,484/month

| # | AWS Service | Specification | ₹/month |
|---|---|---|---|
| B1 | ECS Fargate (API) | 2 tasks × 0.5 vCPU / 1 GB RAM | ₹1,512 |
| B2 | RDS PostgreSQL | db.t3.medium, 50 GB, Single-AZ | ₹3,780 |
| B3 | ElastiCache Redis | cache.t3.micro, single node | ₹1,344 |
| B4 | Application Load Balancer | Standard + data transfer | ₹1,512 |
| B5 | CloudWatch Logs | 5 GB/month | ₹252 |
| B6 | Route53 DNS | 1 hosted zone | ₹42 |
| B7 | ACM SSL Certificate | | ₹0 |
| B8 | ECR Docker Registry | 5 GB storage | ₹42 |
| | **AWS Starter Total** | | **₹8,484** |

---

### B2. Growth Tier (1,000–10,000 Users) — ₹36,540/month

| # | AWS Service | Specification | ₹/month |
|---|---|---|---|
| B1 | ECS Fargate (API) | 4 tasks × 1 vCPU / 2 GB RAM | ₹8,232 |
| B2 | RDS PostgreSQL | db.t3.large, 100 GB, Multi-AZ | ₹15,540 |
| B3 | ElastiCache Redis | cache.t3.medium, 3-node cluster | ₹6,888 |
| B4 | Application Load Balancer | | ₹1,848 |
| B5 | NAT Gateway | | ₹2,940 |
| B6 | CloudWatch + Enhanced Monitoring | 20 GB logs | ₹1,008 |
| B7 | S3 Storage | Assets, exports | ₹84 |
| B8 | SES Email | 10,000 emails | ₹0 (free tier) |
| | **AWS Growth Total** | | **₹36,540** |

---

### B3. Scale Tier (10,000–50,000 Users) — ₹1,47,840/month

| # | AWS Service | Specification | ₹/month |
|---|---|---|---|
| B1 | EKS + EC2 Node Group | 3× c5.xlarge (4 vCPU, 8 GB each) | ₹26,460 |
| B2 | RDS PostgreSQL Primary | db.r6g.xlarge, 500 GB, Multi-AZ | ₹58,800 |
| B3 | RDS Read Replica | db.r6g.large | ₹16,800 |
| B4 | ElastiCache Redis Cluster | cache.r6g.large, 6 nodes | ₹31,920 |
| B5 | Application Load Balancer | | ₹2,940 |
| B6 | CloudFront CDN | | ₹2,100 |
| B7 | NAT Gateway | | ₹5,880 |
| B8 | CloudWatch + X-Ray | | ₹3,780 |
| | **AWS Scale Total** | | **₹1,47,840** |

---

## SECTION C — Third-Party Monthly Subscriptions

| # | Service | Purpose | ₹/month |
|---|---|---|---|
| C1 | Expo EAS Production | App builds + OTA updates | ₹2,436 |
| C2 | Apple Developer Program | iOS App Store (₹8,316 ÷ 12) | ₹693 |
| C3 | Sentry Team Plan | Error tracking & crash alerts | ₹2,184 |
| C4 | SendGrid Essentials | Transactional emails (50K/mo) | ₹1,680 |
| C5 | Google Maps API | Up to 28,000 users | ₹0 (free) |
| C6 | Google Maps API | After 28,000 users (per 1K loads) | ₹588 |
| **Subscriptions Total** | | | **₹6,993** |

---

## SECTION D — All Keys Required + Cost

| # | Key / Service | Where to Get | Cost (₹) |
|---|---|---|---|
| D1 | Google Maps Android Key | console.cloud.google.com | ₹0 (free up to 28K users) |
| D2 | Google Maps iOS Key | console.cloud.google.com | ₹0 |
| D3 | Google Maps Server Key | console.cloud.google.com | ₹0 |
| D4 | Razorpay Key ID | razorpay.com | ₹0 monthly |
| D5 | Razorpay Key Secret | razorpay.com | ₹0 monthly |
| D6 | Razorpay Webhook Secret | razorpay.com dashboard | ₹0 |
| D7 | JWT Private Key (RS256) | openssl genrsa command | ₹0 |
| D8 | JWT Public Key (RS256) | openssl rsa command | ₹0 |
| D9 | QR HMAC Secret | node crypto command | ₹0 |
| D10 | Expo Project ID | expo.dev | ₹0 |
| D11 | AWS Access Key + Secret | console.aws.amazon.com | Infra cost only |
| D12 | Apple Developer Certificate | developer.apple.com | ₹8,316/year |
| D13 | Google Play Account | play.google.com/console | ₹2,100 one-time |
| D14 | Sentry DSN | sentry.io | ₹0 / ₹2,184 paid |

---

## SECTION E — Variable Cost Per Transaction (Razorpay)

| Item | Rate | Per ₹440 Session |
|---|---|---|
| Razorpay Gateway Fee | 2% | ₹8.80 |
| GST on gateway fee | 18% on ₹8.80 | ₹1.58 |
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

## SECTION F — Grand Total Monthly (AWS + Subscriptions + Gateway)

| Scale | Users | Sessions | AWS (₹) | Subscriptions (₹) | Gateway (₹) | **Total/month (₹)** |
|---|---|---|---|---|---|---|
| **Starter** | 500 | 2,000 | ₹8,484 | ₹6,993 | ₹20,768 | **₹36,245** |
| **Growth** | 2,000 | 8,000 | ₹36,540 | ₹6,993 | ₹83,072 | **₹1,26,605** |
| **Standard** | 5,000 | 20,000 | ₹36,540 | ₹6,993 | ₹2,07,680 | **₹2,51,213** |
| **Scale** | 10,000 | 40,000 | ₹1,47,840 | ₹6,993 | ₹4,15,360 | **₹5,70,193** |

---

## SECTION G — Revenue vs Cost Projection

*(Assuming ₹22/kWh × 20 kWh avg = ₹440/session)*

| Scale | Sessions/mo | Revenue (₹) | Total Cost (₹) | **Net Profit (₹)** | Margin |
|---|---|---|---|---|---|
| 500 users | 2,000 | ₹8,80,000 | ₹36,245 | **₹8,43,755** | 95.9% |
| 2,000 users | 8,000 | ₹35,20,000 | ₹1,26,605 | **₹33,93,395** | 96.4% |
| 5,000 users | 20,000 | ₹88,00,000 | ₹2,51,213 | **₹85,48,787** | 97.1% |
| 10,000 users | 40,000 | ₹1,76,00,000 | ₹5,70,193 | **₹1,70,29,807** | 96.8% |

---

## SECTION H — Break-Even Analysis

| Item | Amount (₹) |
|---|---|
| Total one-time investment | ₹7,17,616 |
| Monthly fixed cost at Starter | ₹36,245 |
| Revenue per session (avg) | ₹440 |
| Sessions needed to cover monthly cost | ~83 sessions |
| **Break-even on investment** | **Month 3** (at 500 users) |

---

## SECTION I — Year 1 Total Cost of Ownership (AWS)

| Item | ₹ |
|---|---|
| One-time development + setup | ₹7,17,616 |
| AWS infrastructure (3 mo Starter + 9 mo Growth) | ₹3,54,747 |
| Third-party subscriptions (12 months) | ₹83,916 |
| Razorpay gateway fees (avg 2K sessions × 12) | ₹2,49,120 |
| **Year 1 Total Cost** | **₹14,05,399** |
| **Year 1 Revenue** (2K sessions × ₹440 × 12) | **₹1,05,60,000** |
| **Year 1 Net Profit** | **₹91,54,601** |

---

## SECTION J — AWS Cost Optimization Tips

| Tip | Saving |
|---|---|
| RDS Reserved Instance (1-year commit) | 40% = save ₹6,300/month |
| ElastiCache Reserved (1-year commit) | 40% = save ₹2,755/month |
| ECS Savings Plan | 20% = save ₹1,647/month |
| Razorpay volume deal (>₹50L/month) | Negotiate 1.5% = save ₹2,500/month |
| Google Maps restrict API calls | Keep within ₹16,800 free credit |
| **Total Possible Savings** | **~₹13,202/month** |

---

## SECTION K — Complete `.env` Keys Reference

### `backend/.env`
```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# AWS RDS
DATABASE_URL=postgresql://postgres:PASSWORD@your-rds.amazonaws.com:5432/evcharge

# AWS ElastiCache
REDIS_URL=redis://your-elasticache.cache.amazonaws.com:6379

# JWT (from openssl)
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nPASTE\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nPASTE\n-----END PUBLIC KEY-----"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# QR (from node crypto — 64 char hex)
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

## SECTION L — Final AWS Quote Summary

```
╔══════════════════════════════════════════════════════════════╗
║           EV CHARGE APP — AWS PRICING SUMMARY                ║
╠══════════════════════════════════════════════════════════════╣
║  ONE-TIME COSTS                                              ║
║  ├─ Development & Design          ₹6,26,000                  ║
║  ├─ Store Registrations           ₹10,416                    ║
║  ├─ Domain                        ₹1,200                     ║
║  └─ TOTAL ONE-TIME                ₹7,17,616                  ║
╠══════════════════════════════════════════════════════════════╣
║  MONTHLY — AWS INFRASTRUCTURE                                ║
║  ├─ Starter   (0–1K users)        ₹8,484/mo                  ║
║  ├─ Growth    (1K–10K users)      ₹36,540/mo                 ║
║  └─ Scale     (10K–50K users)     ₹1,47,840/mo               ║
╠══════════════════════════════════════════════════════════════╣
║  MONTHLY — SUBSCRIPTIONS          ₹6,993/mo                  ║
╠══════════════════════════════════════════════════════════════╣
║  PER TRANSACTION (Razorpay+GST)   ₹10.38/session             ║
╠══════════════════════════════════════════════════════════════╣
║  COMPLETELY FREE                                             ║
║  ├─ SSL Certificate                                          ║
║  ├─ JWT + QR Keys                                            ║
║  └─ Google Maps (up to 28K users)                            ║
╠══════════════════════════════════════════════════════════════╣
║  YEAR 1 TOTAL INVESTMENT          ₹14,05,399                 ║
║  YEAR 1 PROJECTED REVENUE         ₹1,05,60,000               ║
║  YEAR 1 NET PROFIT                ₹91,54,601                 ║
║  BREAK-EVEN                       Month 3                    ║
╚══════════════════════════════════════════════════════════════╝
```

---

*All prices in INR at $1 = ₹84 | March 2026 | AWS prices are pay-as-you-go*
