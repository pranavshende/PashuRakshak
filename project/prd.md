# Product Requirements Document (PRD)

## 1. Product Overview
PashuRakshak (“Animal Guardian”) is an offline-first Edge AI system that detects livestock diseases — Lumpy Skin Disease (LSD), Foot-and-Mouth Disease (FMD), and Mastitis — directly on a farmer's phone. It combines on-device CNN inference (MobileNetV2 / EfficientNetB0 via TensorFlow Lite) with a clinical symptom rule engine to produce a hybrid diagnosis, and works fully offline with opportunistic cloud sync.

## 2. Problem Statement
Rural farmers often lack immediate veterinary access and reliable internet connectivity. Delays in diagnosing LSD, FMD, and Mastitis drive up livestock mortality and economic loss. PashuRakshak brings diagnostic capability directly to the farmer's phone, working fully offline, and reconciles with the cloud opportunistically once connectivity is restored.

## 3. Goals & Objectives
- Provide accurate, offline, on-device disease detection for livestock at the point of need.
- Minimise time-to-diagnosis in low-connectivity rural regions.
- Route farmers to the nearest available veterinarian using location-based search.
- Give administrators visibility into regional disease trends via a web dashboard.
- Keep the platform maintainable with a single unified codebase across mobile and web.

## 4. Target Users
| User | Needs | Platform |
|---|---|---|
| Farmer | Fast, offline, low-literacy-friendly disease detection and vet routing | Mobile (iOS/Android) |
| Veterinarian | Receive routing requests, view case context | Mobile/Web |
| Admin | Regional outbreak analytics, vet management, audit visibility | Web dashboard |

## 5. Core Product Requirements
### Functional Requirements
- Offline diagnosis using on-device TFLite inference — no internet required.
- Symptom logging via tabular clinical inputs feeding a rule engine.
- Hybrid inference engine blending 70% vision-model score with 30% symptom-based rule score.
- Multilingual, icon-driven UI for users with low digital literacy.
- Vet routing — nearest-vet lookup via PostGIS geo-proximity search.
- Medicine recommendations from a cached reference dataset.
- Cloud sync — bulk upload of cached predictions once connectivity returns.
- Web admin dashboard for outbreak monitoring and vet management.
- Regional outbreak push/realtime alerts.
- Audit logging of admin data access.

### Non-Functional Requirements
- **Availability**: core diagnosis must work with zero connectivity.
- **Security**: JWT/Supabase Auth plus Postgres Row-Level Security as defense in depth.
- **Scalability**: comfortably support 10,000–50,000 users on the target infrastructure.
- **Performance**: read-heavy geo queries must be cache-backed; sync bursts must not block the event loop.
- **Observability**: crash and latency visibility via Sentry/APM.
- **Portability**: one codebase serving iOS, Android, and Web.

## 6. Capacity Estimation (Target Scale: 50,000 Farmers)
- **Daily active users**: ~5,000 (10% DAU/MAU)
- **Predictions/day**: ~7,500 (1.5 per active user)
- **Avg image size**: ~300 KB (compressed on-device)
- **Storage growth**: ~2.25 GB/day → ~68 GB/month
- **Peak sync burst**: Up to 500 req/min
- **`/vets/nearby` reads**: ~5–10x more frequent than writes
