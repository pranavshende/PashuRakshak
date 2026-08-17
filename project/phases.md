# Project Phases & Timeline

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

### Phase 5 — Realtime, CI/CD & Launch Prep (Weeks 16–18) [COMPLETED]
**Goal**: Push notifications, automated deployments, and load testing.
- Realtime outbreak alerts via Supabase Realtime and Expo Notifications.
- GitHub Actions CI/CD pipeline (Prisma migrate + EAS Build).
- Load testing and tuning against capacity estimates.

### Phase 6 — UI/UX Overhaul & Parity Tuning [COMPLETED]
**Goal**: Modernize web interface to achieve complete parity with the Android mobile app, establishing premium visual guidelines.
- Light Theme Migration
- Unified Header & Navigation Layout
- Mobile Grid Adaptations

### Phase 7 — Digital Twin & Recovery Monitoring [COMPLETED]
**Goal**: Create lifelong animal profiles, recovery tracking, and certification.
- Digital Twin profile (`AnimalDetail.jsx`)
- Livestock Health Certificate (`Certificate.jsx`)

### Phase 8 — Intelligence & Predictive Analytics [COMPLETED]
**Goal**: Outbreak tracking, spatial intelligence, and surveillance networks.
- Surveillance Heatmap (`Heatmap.jsx`)
- Community Intelligence Feed (`Community.jsx`)

### Phase 9 — Smart Farm & Conversational AI [COMPLETED]
**Goal**: Smart analytics, IoT feeds, and conversational diagnostic assistants.
- AI Vet Assistant (`Chat.jsx`)
- AI Farm Productivity Score (`FarmScore.jsx`)
- IoT Smart Livestock Monitor (`IoT.jsx`)

### Phase 10 — Advanced Edge AI & Scaled Deployment
- **Federated Learning AI Platform**: Privacy-preserving on-device model training.
- **Veterinary Teleconsultation Portal**: Secure video-link portal connecting farmers with local vets.
