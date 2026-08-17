# PashuRakshak Pitch-Ready Extension Plan (Pre-Demo Day)

This document details the implementation plan for extending the **PashuRakshak** platform prior to demo day. The objective is to maximize pitch impact, align with fintech/investor interest, demonstrate high rural accessibility, and mitigate engineering risk by leveraging existing capabilities and building highly controlled demonstrations.

---

## 📌 1. Alignment & Repackaging (Zero Code Changes)
To align with investor expectations without writing redundant code, the following existing features are repackaged under pitch-friendly terminology:

* **Digital Health Passport** (Formerly *Phase 7 Digital Twin*):
  * **Current Code:** Located in [`AnimalDetail.jsx`](file:///d:/Uba_PashuRakshak/Web/src/pages/AnimalDetail.jsx) (web) and `animals/[id].tsx` (mobile).
  * **Pitch Action:** Rebrand the printable PDF health record from [`Certificate.jsx`](file:///d:/Uba_PashuRakshak/Web/src/pages/Certificate.jsx) as a **"Digital Health Passport"** that serves as an official health verification document for insurance underwriting and micro-finance credit scoring.
* **Animal Medical History Log** (Formerly *Digital Twin Logs*):
  * **Current Code:** Historical prediction and vaccination sub-schemas associated with specific animal tag IDs.
  * **Pitch Action:** Emphasize this as a tamper-proof verification ledger for animal provenance and lifelong health history tracking.

---

## 🛠️ 2. New Features: Technical Specifications & Tasks

### Feature A: Smart Treatment Cost Calculator
Provides a direct financial connection for judges by showing the economic loss avoided by diagnosing early.

* **Technical Scope:**
  * Define a cost database (estimated treatment cost, production loss/milk yield drop values, and average cattle replacement values).
  * Build a UI component that compares:
    * **Early Stage Intervention Cost**: Low cost (e.g. anti-inflammatory, local antiseptic).
    * **Late Stage Intervention Cost**: High cost (antibiotics, vet surgery, milk loss).
    * **Total Loss Avoided**: Net saving displayed as a financial metric.
* **Tasks:**
  * Create `Backend/src/routes/costCalculator.js` to serve cost estimates based on predicted disease.
  * Implement frontend visual card in `app/app/(farmer)/diagnose/index.tsx` (mobile) and [`Medicine.jsx`](file:///d:/Uba_PashuRakshak/Web/src/pages/Medicine.jsx) (web) showing the cost comparison.
* **Verification:**
  * Verify that choosing "LSD" or "FMD" dynamically displays calculated cost comparison metrics.

---

### Feature B: WhatsApp/SMS Offline Integration Bridge
Addresses the "digital literacy & connectivity" hurdle by letting low-end feature phone users interact with the system via SMS or WhatsApp without downloading the app.

* **Technical Scope:**
  * Integrate Twilio SMS / WhatsApp Business API Webhook.
  * Webhook receives incoming message containing: `[Cattle ID] + [Symptom description / raw text] + [Optional Location]`.
  * The webhook passes the symptoms to the server's rules engine (`rulesEngineService.js`) and calls the AI assistant.
  * Generates a template-based text reply containing the predicted risk, recommended first aid, and the nearest vet's phone number.
* **Tasks:**
  * Build a new backend route `Backend/src/routes/webhook.js` to receive SMS/WhatsApp incoming requests.
  * Write a message parser utility to extract key-value data from conversational texts.
  * Connect message parser to the existing disease database and PostgreSQL vet routing queries.
* **Verification:**
  * Mock an incoming HTTP payload simulating a SMS request and assert that a correct, formatted SMS message reply is returned.

---

### Feature C: Climate-Driven Vector Risk Prediction
Elevates the "Surveillance Heatmap" into a predictive ClimateTech tool by correlating weather trends (temperature, humidity, rainfall) with vector-borne disease transmission (like Lumpy Skin Disease, which spreads via mosquitoes/ticks).

* **Technical Scope:**
  * Integrate a free weather forecasting API (like Open-Meteo) to fetch historical and 7-day temperature and humidity data for coordinates.
  * Implement a simple risk index formula: 
    $$\text{Risk Index} = (\text{Temperature} \times 0.6) + (\text{Humidity} \times 0.4)$$
    *High temperature + high humidity = high insect vector activity (mosquitoes/ticks).*
  * Feed this calculated vector index into the existing surveillance mapping dashboard to color-code regions.
* **Tasks:**
  * Implement weather fetcher client in `Backend/src/services/weatherService.js`.
  * Update `/outbreaks/predict` route in `Backend/src/routes/outbreaks.js` to fetch weather data and adjust prediction risk weightings.
  * Connect to the Web Heatmap screen [`Heatmap.jsx`](file:///d:/Uba_PashuRakshak/Web/src/pages/Heatmap.jsx) to show a "Climate Vector Layer".
* **Verification:**
  * Call `/outbreaks/predict` with sample latitude/longitude coordinates and verify that the API returns weather metrics alongside disease prediction coordinates.

---

## ⚠️ 3. Scoped/Mocked Features (Risk-Mitigated Demos)

### Feature D: Scoped Bluetooth Mesh Community Alert
* **Demonstration Strategy:**
  * Real mesh networking is prone to connection drops in live venues.
  * **Solution:** Create a *Simulated Mesh Demo Mode* inside the app. When activated via a hidden developer tap, the app broadcasts a local Bluetooth LE (BLE) advertisement packet.
  * A second nearby device scanning for this specific BLE service ID picks it up and immediately pops up a local notification: *"Outbreak alert received via peer-to-peer relay!"*
* **Tasks:**
  * Add `react-native-ble-plx` or a basic React Native BLE advertiser package to `app/package.json`.
  * Write a lightweight controller `app/utils/simulatedMesh.ts` to start broadcasting and scanning for a single unique UUID when the "Demo Alert" is triggered.
* **Verification:**
  * Test with two physical devices in the room to confirm that hitting "Broadcast Alert" on device A triggers the notification on device B within 3-5 seconds over BLE.

---

### Feature E: Thermal Infrared Scanner Mockup
* **Demonstration Strategy:**
  * True thermal scanning requires external hardware (e.g. FLIR attachment).
  * **Solution:** Present this as a **"Phase 10 Future Telemetry Concept"**.
  * Add a "Thermal Camera" option inside the capture screen. When tapped, it loads a pre-made thermal image overlay showing high-temperature hotspots on a cow's udder (indicating Mastitis), simulating how a thermal sensor would interface.
* **Tasks:**
  * Add pre-made thermal image assets to `app/assets/images/thermal/`.
  * Modify `app/app/(farmer)/capture/index.tsx` to add a "Thermal Mode" toggle which switches the camera view to an overlay containing the static thermal assets.
* **Verification:**
  * Ensure selecting "Thermal Mode" displays the mock overlay and flows cleanly into the Mastitis diagnosis screen.

---

## 📅 4. Pre-Demo Build Timeline

| Day | Module / Feature | Details / Deliverable | Risk Level |
| :--- | :--- | :--- | :--- |
| **Day 1** | **Repackage & Cost Calculator** | Rename assets, create `costCalculator.js` backend API, and build frontend cost visual cards. | Low |
| **Day 2** | **Climate Vector Prediction** | Integrate Open-Meteo weather API, calculate vector indexes, update `/outbreaks/predict`, and add Web Heatmap indicators. | Medium |
| **Day 3** | **WhatsApp/SMS Webhook** | Write Twilio webhook endpoint, parsing incoming message triggers, and verify responses. | Medium |
| **Day 4** | **Bluetooth Mesh Demo** | Setup simulated BLE advertiser/scanner utility and test physical device-to-device alerts. | High (Keep fallback ready) |
| **Day 5** | **Thermal UI & Testing** | Drop static thermal assets into app capture overlays and run end-to-end dry-run walkthroughs. | Low |
