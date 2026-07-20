# Phase 1 Implementation Plan — Core Farmer Flow

## 📌 Overview
**Duration:** Weeks 3–6
**Goal:** Implement the core offline-first diagnosis flow for the farmer on the mobile application, including local data persistence, auth, image capture, and on-device TFLite inference.

## 📂 File / Module Scope
- `app/(farmer)/capture/` — Image capture screen
- `app/(farmer)/diagnose/` — TFLite inference + symptom logging
- `app/(farmer)/sync/` — Local sync status screen
- `packages/database/` — Local SQLite persistence layer

---

## 🛠️ Implementation Steps

### 1. Auth Flow (Mobile)
* **Goal:** Implement end-to-end custom JWT authentication using Passport.js backed by Supabase PostgreSQL.
* **Tasks:**
  - Setup login/registration screens in the `(farmer)` route group.
  - Implement custom API calls to the Passport.js authentication backend to obtain JWTs.
  - Securely store the JWT session token using `SecureStore` (Expo) or an equivalent for local retention.
  - Setup a context provider/middleware to manage auth state and attach the JWT to protected API requests.

### 2. Local SQLite Persistence
* **Goal:** Set up local, offline record storage for predictions and symptoms.
* **Tasks:**
  - Initialize Expo SQLite (or AsyncStorage/IndexedDB for web fallback).
  - Create local schema/tables equivalent to `Prediction` and `Symptom` (simplified for edge storage).
  - Implement CRUD utility functions (save prediction, mark as synced, fetch pending syncs).

### 3. Image Capture Pipeline
* **Goal:** Implement the mobile camera interface and local image caching.
* **Tasks:**
  - Build the camera screen in `app/(farmer)/capture/` using `react-native-vision-camera` (or equivalent).
  - Implement `<input capture>` fallback for the web build.
  - Save captured images to the local device cache.
  - Prepare the image metadata and file path for the upcoming Supabase Storage upload flow (sync preparation).

### 4. On-Device TFLite Inference & Symptom Logging
* **Goal:** Execute the core AI diagnosis completely offline.
* **Tasks:**
  - Build the symptom logging UI (tabular clinical inputs) in `app/(farmer)/diagnose/`.
  - Port the existing TFLite inference model (MobileNetV2 / EfficientNetB0) into the Expo app.
  - Run the vision model on the captured image and get confidence scores.
  - Execute the symptom rule engine locally.
  - Blend the scores (70% CNN + 30% Rule Engine) to produce the final offline diagnosis result.
  - Save the full result (image path + symptoms + diagnosis) via the local SQLite persistence layer.

### 5. Sync Status UI
* **Goal:** Display the status of offline records.
* **Tasks:**
  - Create the `app/(farmer)/sync/` screen.
  - Fetch pending and synced records from the local database.
  - Display a queue of offline records awaiting cloud sync.

---

## 🧪 Testing Plan

### 1. Auth Flow Integration Test
- Full Passport.js custom JWT request flow.
- Verify credentials submission, successful JWT token issuance, and local storage.

### 2. Offline Persistence Tests
- Verify that records (predictions and symptoms) persist accurately.
- Ensure data survives an app force-close and reopen while offline.

### 3. TFLite Inference Unit Tests
- Provide known sample images to the TFLite model.
- Validate that the model outputs the expected disease classifications and confidence ranges.

### 4. Rule Engine Table-Driven Tests
- Test the symptom rule engine against every entry in the `SYMPTOM_DISEASE_MAP`.
- Ensure edge cases (e.g., conflicting symptoms, missing data) are handled gracefully and scored correctly.

---

## 🚦 Definition of Done for Phase 1
- [ ] A user can log in via custom JWT (Passport.js) and persist their session.
- [ ] A user can open the camera, capture a livestock image, and see it in the app.
- [ ] A user can select clinical symptoms.
- [ ] The app successfully runs the TFLite model and rule engine to generate a blended diagnosis **entirely offline**.
- [ ] The result and image are securely saved to the local SQLite database.
- [ ] The user can view their saved records in the sync status screen.
- [ ] All Phase 1 tests pass successfully.
