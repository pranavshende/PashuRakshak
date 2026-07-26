# PashuRakshak (“Animal Guardian”) — Implementation Plan v2.0

## 📌 1. Product Overview
PashuRakshak is an offline-first Edge AI system that detects livestock diseases (Lumpy Skin Disease, Foot-and-Mouth Disease, Mastitis) directly on a farmer's phone. It combines on-device CNN inference with a clinical symptom rule engine to produce a hybrid diagnosis, working fully offline with opportunistic cloud sync.

## 🎯 2. Goals & Objectives
- Accurate, offline, on-device disease detection.
- Minimize time-to-diagnosis in low-connectivity rural regions.
- Route farmers to the nearest veterinarian via geo-proximity search.
- Web dashboard for outbreak monitoring and vet management.
- Unified codebase across mobile and web platforms.

## 🏗️ 3. System Architecture & Tech Stack
- **Client**: Expo (React Native + Expo Router), React Native Web, Vision Camera, NativeWind, SQLite / IndexedDB
- **Backend**: Node.js, Express.js, Prisma Client
- **Database**: Supabase Postgres (with PostGIS extension)
- **Auth**: Supabase Auth (OTP)
- **ML/AI**: TensorFlow Lite (on-device), FastAPI microservice (server fallback)
- **Cache**: Redis

## 🚀 4. Phase-Wise Development Plan

### Phase 0 — Foundations (Weeks 1–2)
**Goal**: Set up infrastructure, database schema, and monorepo.
- Stand up Supabase project, enable PostGIS extension.
- Local dev environment via Supabase CLI.
- Expo Router monorepo scaffold (`(farmer)` and `(admin)` route groups).
- Write `schema.prisma` from ER model and run first migration.
- Finalize Auth strategy (Supabase Auth).

### Phase 1 — Core Farmer Flow (Weeks 3–6)
**Goal**: Implement the core offline-first diagnosis flow.
- Port on-device TFLite inference into Expo app.
- Port symptom logging UI and rule inputs.
- Offline record storage using local SQLite persistence.
- Implement mobile Auth flow (OTP).
- Image capture pipeline to local cache.

### Phase 2 — Sync & Backend (Weeks 7–9)
**Goal**: Cloud synchronization, security, and reference data.
- Batched `/predict/sync` endpoint using Prisma.
- Row-Level Security (RLS) policies on Prediction/Symptom tables.
- Rate limiting on Auth and Sync endpoints.
- Medicine reference dataset with Redis caching.

### Phase 3 — Vet Routing & Admin Dashboard (Weeks 10–12)
**Goal**: Geospatial routing and administrative oversight.
- Vet proximity search with PostGIS (`/vets/nearby`) and Redis cache.
- Admin analytics dashboard (`(admin)` route group).
- Vet management UI.
- Audit logging for admin data access.

### Phase 4 — ML Microservice & Hardening (Weeks 13–15)
**Goal**: Server-side fallback inference, validation, and monitoring.
- Extract `/predict/analyze` to FastAPI over HTTP.
- Zod input validation across all endpoints.
- Sentry crash/error monitoring for mobile and API.

### Phase 5 — Realtime, CI/CD & Launch Prep (Weeks 16–18)
**Goal**: Push notifications, automated deployments, and load testing.
- Realtime outbreak alerts via Supabase Realtime and Expo Notifications.
- GitHub Actions CI/CD pipeline (Prisma migrate + EAS Build).
- Load testing and tuning against capacity estimates.

## 🧪 5. Testing & Validation Strategy
- **Phase 0**: Environment smoke tests, schema migration test, monorepo build test.
- **Phase 1**: TFLite unit tests, rule engine table-driven tests, offline persistence tests, Auth integration test.
- **Phase 2**: Sync flow integration test, RLS automated tests, rate limit test, Redis cache test.
- **Phase 3**: Vet lookup accuracy test, GIST index performance test, Admin dashboard E2E test, Audit log verification.
- **Phase 4**: ML microservice contract tests, validation tests, dependency security scan, ML soak test.
- **Phase 5**: Offline-first E2E flow test, cross-platform parity E2E, Load tests, Penetration test.
