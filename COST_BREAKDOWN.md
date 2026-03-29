# EV Charge App — Cost Breakdown & Infrastructure Guide

> **Date:** March 2026
> **Stack:** Expo (React Native) + Fastify (Node.js) + PostgreSQL + Redis + Stripe

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Cloud Deployment Costs](#cloud-deployment-costs)
3. [On-Premises Deployment Costs](#on-premises-deployment-costs)
4. [Cost at Scale (1,000 → 10,000 clients)](#cost-at-scale)
5. [Per-Client Cost Analysis](#per-client-cost-analysis)
6. [How Much to Charge Per Session](#how-much-to-charge-per-session)
7. [Third-Party Service Costs](#third-party-service-costs)
8. [Full Project Cost Summary](#full-project-cost-summary)

---

## Architecture Overview

```
Mobile App (Expo)
     │
     ▼
Cloudflare CDN ($0 – free tier)
     │
     ▼
Load Balancer (Nginx / AWS ALB)
     │
 ┌───┴──────────────────┐
 │  API Cluster          │
 │  Node.js × N pods     │
 └───────────┬──────────┘
             │
   ┌─────────┴──────────┐
   │                    │
PgBouncer          Redis Cluster
   │
PostgreSQL Primary + Read Replica
```

---

## Cloud Deployment Costs

### AWS (Recommended for Production)

#### Minimum Viable Production (500–2,000 clients)

| Service | Spec | Monthly Cost |
|---|---|---|
| **ECS Fargate** (API) | 2 tasks × 0.5 vCPU / 1 GB RAM | $18 |
| **RDS PostgreSQL** | db.t3.medium, 50 GB, Single-AZ | $45 |
| **ElastiCache Redis** | cache.t3.micro, single node | $16 |
| **Application Load Balancer** | + data transfer | $18 |
| **ECR** (Docker registry) | 5 GB storage | $0.50 |
| **CloudWatch** logs | 5 GB/month | $3 |
| **Route53** DNS | 1 hosted zone | $0.50 |
| **ACM** SSL certificate | | Free |
| **Total** | | **~$101/month** |

#### Standard Scale (2,000–10,000 clients)

| Service | Spec | Monthly Cost |
|---|---|---|
| **ECS Fargate** (API) | 4 tasks × 1 vCPU / 2 GB RAM | $98 |
| **RDS PostgreSQL** | db.t3.large, 100 GB, Multi-AZ | $185 |
| **ElastiCache Redis** | cache.t3.medium, cluster mode (3 nodes) | $82 |
| **Application Load Balancer** | | $22 |
| **NAT Gateway** | | $35 |
| **CloudWatch** | Enhanced monitoring, 20 GB logs | $12 |
| **S3** (user assets, exports) | 10 GB | $0.23 |
| **SES** (transactional email) | 10,000 emails | $1 |
| **Total** | | **~$435/month** |

#### High Scale (10,000–50,000 clients)

| Service | Spec | Monthly Cost |
|---|---|---|
| **EKS** + EC2 Node Group | 3× c5.xlarge (4 vCPU, 8 GB) | $315 |
| **RDS PostgreSQL** | db.r6g.xlarge, 500 GB, Multi-AZ + read replica | $890 |
| **ElastiCache Redis** | cache.r6g.large, cluster (6 nodes) | $380 |
| **ALB** | | $35 |
| **NAT Gateway** | | $70 |
| **CloudWatch + X-Ray** | | $45 |
| **S3 + CloudFront** | | $25 |
| **Total** | | **~$1,760/month** |

---

### Google Cloud Platform (Alternative)

#### Standard Scale (2,000–10,000 clients)

| Service | Spec | Monthly Cost |
|---|---|---|
| **Cloud Run** (API) | 4 instances, auto-scale | $80 |
| **Cloud SQL PostgreSQL** | db-standard-2, 100 GB, HA | $160 |
| **Memorystore Redis** | 1 GB standard tier | $49 |
| **Cloud Load Balancing** | | $18 |
| **Total** | | **~$307/month** |

---

### Azure (Alternative)

#### Standard Scale (2,000–10,000 clients)

| Service | Spec | Monthly Cost |
|---|---|---|
| **Azure Container Apps** | 4 replicas | $75 |
| **Azure Database for PostgreSQL** | Flexible Server, D2s_v3, 100 GB | $155 |
| **Azure Cache for Redis** | C1 Standard | $55 |
| **Azure Load Balancer** | Standard | $18 |
| **Total** | | **~$303/month** |

---

## On-Premises Deployment Costs

### Hardware Requirements (Self-Hosted)

#### Small Scale (up to 1,000 clients)

| Component | Recommendation | One-Time Cost | Annual Maintenance |
|---|---|---|---|
| **API Server** | Dell PowerEdge R350 (16 core, 32GB RAM) | $3,200 | $320 |
| **Database Server** | Dell PowerEdge R450 (24 core, 64GB RAM, NVMe RAID) | $6,500 | $650 |
| **Network Switch** | Cisco 48-port managed | $800 | $80 |
| **UPS** | APC 3000VA | $600 | $60 |
| **SSL Certificate** | Let's Encrypt | Free | Free |
| **Total Hardware** | | **~$11,100** | **~$1,110/year** |
| **Monthly equivalent** | amortized over 3 years | | **~$340/month** |

Plus:
- Power: ~$50/month (2 servers × 200W × 720hr)
- Datacenter/colo rack: $200–500/month
- IT admin: 5 hrs/month × $60/hr = $300/month

**On-prem total: ~$890/month** (excludes labor amortization)

#### Medium Scale (1,000–10,000 clients)

| Component | Recommendation | One-Time Cost |
|---|---|---|
| **3× API Servers** | 16 core, 32 GB each | $9,600 |
| **PostgreSQL Primary + Replica** | 32 core, 128 GB, 2TB NVMe RAID | $18,000 |
| **Redis Cluster** | 3× 8 core, 16 GB | $6,000 |
| **Hardware Load Balancer** | F5 BIG-IP or HAProxy on dedicated server | $2,500 |
| **Networking** | 10Gbps switches, cabling | $3,000 |
| **Total** | | **~$39,100** |
| **Monthly equivalent** | amortized over 3 years + $700 hosting/power | | **~$1,789/month** |

---

## Cost at Scale

### Marginal Cost Per Additional 1,000 Users (Cloud, AWS)

| Scale Range | Monthly Cloud Cost | Per-User Monthly Cost |
|---|---|---|
| 0–500 users | $101 | $0.20 |
| 500–2,000 users | $180 | $0.12 |
| 2,000–5,000 users | $435 | $0.09 |
| 5,000–10,000 users | $620 | $0.06 |
| 10,000–25,000 users | $1,100 | $0.04 |
| 25,000–50,000 users | $1,760 | $0.04 |

**Economies of scale: infrastructure cost per user drops 80% from 500 to 10,000 users.**

### Cost Breakdown per 1,000 Active Users (at 5,000 total users)

```
Monthly AWS bill at 5,000 users: ~$435

Per 1,000 users = $435 / 5 = $87/month per 1,000 users

Breakdown:
  Database (RDS):     $37  (43%)
  Redis (cache):      $16  (18%)
  API compute:        $20  (23%)
  Networking/misc:    $14  (16%)
```

---

## Per-Client Cost Analysis

### Assumptions (per charging session)
- Average session: 45 minutes, 20 kWh delivered
- Average price charged to user: $0.35/kWh = **$7.00 per session**
- Sessions per active user per month: 4

### Revenue vs Cost per User per Month

| Item | Amount |
|---|---|
| Revenue per user (4 sessions × $7) | **$28.00** |
| Stripe fee (2.9% + $0.30 per session) | -$1.51 |
| Infrastructure cost (at 5K users) | -$0.09 |
| **Gross margin per user** | **$26.40 (94%)** |

> Infrastructure is a tiny fraction of revenue. The main costs are payment processing and hardware operations.

---

## How Much to Charge Per Session

### Recommended Pricing Tiers

| Connector Type | Power | Suggested Rate | Typical Session Cost |
|---|---|---|---|
| AC Level 2 (J1772) | 7.2 kW | $0.22–0.28/kWh | $2–5 per hour |
| AC Level 2 (Type 2) | 22 kW | $0.25–0.30/kWh | $5–7 per session |
| DC Fast (50 kW) | 50 kW | $0.30–0.35/kWh | $8–15 per session |
| DC Fast (150 kW) | 150 kW | $0.35–0.45/kWh | $12–20 per session |
| DC Ultra-Fast (250 kW+) | 250+ kW | $0.40–0.55/kWh | $15–30 per session |

### Stripe Authorization Hold Strategy
- Hold **$25–35** at session start (covers most sessions)
- Capture actual amount at session end
- If session exceeds hold amount → auto-extend (Stripe allows up to 7-day holds)

### Break-Even Analysis

| Monthly Users | Sessions | Revenue | Stripe Fees | AWS Cost | Net |
|---|---|---|---|---|---|
| 100 | 400 | $2,800 | -$120 | -$101 | **$2,579** |
| 500 | 2,000 | $14,000 | -$610 | -$130 | **$13,260** |
| 1,000 | 4,000 | $28,000 | -$1,220 | -$180 | **$26,600** |
| 5,000 | 20,000 | $140,000 | -$6,070 | -$435 | **$133,495** |
| 10,000 | 40,000 | $280,000 | -$12,140 | -$620 | **$267,240** |

> Break-even reached at approximately **15–20 active sessions/month** at current pricing.

---

## Third-Party Service Costs

| Service | Free Tier | Paid |
|---|---|---|
| **Stripe** | No monthly fee | 2.9% + $0.30/transaction |
| **Google Maps API** | $200/month credit | $7/1,000 map loads after free tier |
| **Firebase Auth** (alternative) | 10K/month | $0.0055/MAU after |
| **Sentry** (error tracking) | 5K errors/month | $26/month developer |
| **Datadog** (monitoring) | – | $15/host/month |
| **SendGrid** (email) | 100/day free | $19.95/month (50K emails) |
| **Expo EAS** (builds) | 30 builds/month | $29/month production |
| **Apple Developer** | – | $99/year |
| **Google Play** | – | $25 one-time |

### Monthly Third-Party Total (at 5,000 users)
| Item | Cost |
|---|---|
| Stripe (20,000 transactions) | $6,070 |
| Google Maps (200K loads) | $0 (within free tier) |
| Sentry | $26 |
| Datadog (5 hosts) | $75 |
| SendGrid | $20 |
| Expo EAS | $29 |
| **Total** | **$6,220** |

---

## Full Project Cost Summary

### Development Cost (One-Time)

| Role | Hours | Rate | Cost |
|---|---|---|---|
| Lead Full-Stack Developer | 200 hrs | $80/hr | $16,000 |
| UI/UX Designer | 60 hrs | $60/hr | $3,600 |
| DevOps Engineer | 40 hrs | $70/hr | $2,800 |
| QA Engineer | 30 hrs | $50/hr | $1,500 |
| **Total Development** | | | **$23,900** |

### Ongoing Monthly Costs (at different scales)

| Scale | Cloud Infra | 3rd Party | Total Monthly |
|---|---|---|---|
| 100 users | $101 | $420 | **$521** |
| 1,000 users | $180 | $1,480 | **$1,660** |
| 5,000 users | $435 | $6,220 | **$6,655** |
| 10,000 users | $620 | $12,640 | **$13,260** |

### ROI Timeline

| Month | Users | Cumulative Revenue | Cumulative Cost | ROI |
|---|---|---|---|---|
| 1 | 100 | $2,800 | $24,421 | -$21,621 |
| 3 | 300 | $25,200 | $27,483 | -$2,283 |
| 4 | 500 | $42,000 | $29,643 | **+$12,357** |
| 12 | 2,000 | $336,000 | $62,391 | **+$273,609** |

> **Break-even reached at ~3.5–4 months** with 500 active users.

---

## Scaling Triggers

| Metric | Action |
|---|---|
| API CPU > 70% for 5min | Add 1 Fargate task (auto-scaling) |
| DB connections > 80 | Upgrade RDS instance, add read replica |
| Redis memory > 60% | Upgrade node size |
| P95 latency > 500ms | Investigate query optimization, add caching |
| Stripe volume > $1M/year | Negotiate custom Stripe pricing (typically 2.2% + $0.20) |

---

## Cost Optimization Tips

1. **Reserved Instances**: Commit to 1-year RDS + ElastiCache → 40% savings = save ~$100/month at 5K users
2. **Spot Instances**: Use for API tier (stateless) → 70% savings vs on-demand
3. **Aggressive Redis caching**: Every 1s reduction in DB queries saves money at scale
4. **Compress API responses**: Brotli compression reduces data transfer costs 60-70%
5. **Stripe volume discount**: At $500K+/month processing, negotiate down to 2.2% + $0.15
6. **EAS local builds**: Build on your CI instead of EAS cloud to save $29/month
7. **PostgreSQL read replicas**: Route all analytics queries to replica, reduce primary load

---

*All costs are estimates as of Q1 2026. AWS/GCP/Azure prices change. Always verify current pricing on vendor websites.*
