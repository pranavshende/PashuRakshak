const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate, syncSchema } = require('../middlewares/validate');
const prisma = require('../config/db');

let GoogleGenAI;
try { ({ GoogleGenAI } = require('@google/genai')); } catch (e) { console.warn('@google/genai not installed'); }

const upload = multer({ storage: multer.memoryStorage() });

// ─── Disease Knowledge Base ─────────────────────────────────────────────────
// Keys match EXACT labels returned by the TFLite model (from labels.txt + all_scores)
const DISEASE_KB = {
  'FMD': {
    label: 'Foot and Mouth Disease (FMD)',
    riskLevel: 'CRITICAL',
    symptoms: ['Blisters/vesicles on hooves and mouth', 'Excessive salivation and drooling', 'Lameness, inability to walk', 'High fever (40–41°C)', 'Reduced milk production'],
    recommendation: 'CRITICAL: Immediately isolate the infected animal. FMD is highly contagious. Report to local animal husbandry department. Do NOT move the animal.',
    treatment: {
      medicines: ['Meloxicam (0.5mg/kg IV/IM) for pain & fever', 'Oxytetracycline (20mg/kg) to prevent secondary bacterial infection', 'Zinc Sulphate foot bath (10% solution) daily'],
      firstAid: 'Wash lesions with 0.2% citric acid or potassium permanganate. Apply glycerine + iodine to mouth lesions. Provide soft feed and clean water.',
      prevention: 'Vaccinate entire herd with polyvalent FMD vaccine every 6 months. Disinfect shed with 2% sodium hydroxide. Restrict visitor access.'
    }
  },
  'Healthy': {
    label: 'Healthy Cattle',
    riskLevel: 'LOW',
    symptoms: ['No visible signs of disease detected', 'Normal skin and coat appearance', 'Normal body posture and movement'],
    recommendation: 'Animal appears healthy. Maintain regular vaccination schedule, deworming every 3 months, and balanced nutrition.',
    treatment: {
      medicines: ['Routine dewormer (Albendazole 7.5mg/kg) every 3 months', 'Vitamin AD3E injection seasonally'],
      firstAid: 'No immediate treatment required. Continue routine preventive care.',
      prevention: 'Maintain clean water, balanced TMR diet, and health checkups every 6 months.'
    }
  },
  'Healthy_Cow': {
    label: 'Healthy Cattle',
    riskLevel: 'LOW',
    symptoms: ['No visible signs of disease detected', 'Normal skin and coat appearance', 'Normal body posture'],
    recommendation: 'Animal appears healthy. Maintain regular vaccination schedule and deworming.',
    treatment: {
      medicines: ['Routine dewormer (Albendazole 7.5mg/kg) every 3 months', 'Vitamin AD3E injection seasonally'],
      firstAid: 'No immediate treatment required.',
      prevention: 'Maintain clean water, balanced diet, and regular health checkups.'
    }
  },
  'Lumpy Skin Disease': {
    label: 'Lumpy Skin Disease (LSD)',
    riskLevel: 'HIGH',
    symptoms: ['Multiple firm nodular skin lumps (2–5cm)', 'High fever (40–41.5°C)', 'Enlarged superficial lymph nodes', 'Reduced milk yield', 'Nasal and eye discharge'],
    recommendation: 'Isolate immediately. LSD spreads via insects. Notify local veterinary authority. Apply insect repellent around shed.',
    treatment: {
      medicines: ['Ivermectin injection (1ml/50kg body weight)', 'Meloxicam anti-inflammatory (0.5mg/kg) for fever', 'Oxytetracycline (20mg/kg) to prevent secondary infection', 'Topical Betadine on skin nodules'],
      firstAid: 'Clean nodules with warm saline water. Apply neem+turmeric paste. Maintain dry shaded bedding.',
      prevention: 'Vaccinate with live attenuated LSD vaccine. Use permethrin sprays to control insects. Disinfect shed daily.'
    }
  },
  'LSD': {
    label: 'Lumpy Skin Disease (LSD)',
    riskLevel: 'HIGH',
    symptoms: ['Multiple firm nodular skin lumps (2–5cm)', 'High fever (40–41.5°C)', 'Enlarged superficial lymph nodes', 'Reduced milk yield'],
    recommendation: 'Isolate immediately. LSD spreads via insects. Notify local vet authority.',
    treatment: {
      medicines: ['Ivermectin injection (1ml/50kg)', 'Meloxicam (0.5mg/kg)', 'Oxytetracycline (20mg/kg)', 'Topical Betadine'],
      firstAid: 'Clean nodules with saline water. Apply neem+turmeric paste.',
      prevention: 'Vaccinate with LSD vaccine. Control insects with permethrin sprays.'
    }
  },
  'Mastitis': {
    label: 'Bovine Mastitis',
    riskLevel: 'HIGH',
    symptoms: ['Hot, swollen, painful udder', 'Abnormal milk (watery, clots, blood-tinged)', 'Reduced or stopped milk yield', 'Cow reluctant to be milked', 'Fever in acute cases'],
    recommendation: 'Strip affected quarter 3x/day. Collect milk sample for culture. Begin intramammary antibiotic treatment immediately.',
    treatment: {
      medicines: ['Amoxicillin/Cloxacillin intramammary tube (Noroclav) twice daily for 3 days', 'Oxytocin (10–20 IU IV/IM) before milking', 'Flunixin NSAID (2.2mg/kg) for pain'],
      firstAid: 'Wash udder with warm water. Fore-strip and discard infected milk. Post-dip teats with 0.5% iodine after milking.',
      prevention: 'Use teat dip after every milking. Dry-cow intramammary therapy. Keep milking equipment clean.'
    }
  }
};

function getLabelKey(rawLabel) {
  if (!rawLabel) return null;
  const label = rawLabel.toString().trim();
  // Exact match first (covers all model output labels)
  if (DISEASE_KB[label]) return label;
  // Case-insensitive fuzzy match
  const lower = label.toLowerCase();
  if (lower.includes('fmd') || lower.includes('foot and mouth')) return 'FMD';
  if (lower.includes('healthy') || lower.includes('normal') || lower.includes('unknown')) return 'Healthy';
  if (lower.includes('lumpy') || lower.includes('lsd')) return 'Lumpy Skin Disease';
  if (lower.includes('mastitis')) return 'Mastitis';
  return null;
}

// ─── Try Local Python TFLite ML Service ───────────────────────────────────────
async function tryLocalML(fileBuffer, filename) {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
    const form = new FormData();
    form.append('file', fileBuffer, { filename: filename || 'image.jpg', contentType: 'image/jpeg' });

    const response = await axios.post(mlServiceUrl, form, {
      headers: form.getHeaders(),
      timeout: 120000
    });

    const d = response.data;
    console.log('[LocalML] Raw response:', JSON.stringify(d));

    if (d.error) {
      console.warn('[LocalML] Service returned error:', d.error);
      return null;
    }

    const rawLabel = d.label;
    const labelKey = getLabelKey(rawLabel);

    if (!labelKey) {
      console.warn('[LocalML] Unknown label:', rawLabel);
      return null;
    }

    const kb = DISEASE_KB[labelKey];
    const confidence = parseFloat(d.confidence) || 0.0;

    // Low confidence means the model isn't sure
    if (confidence < 0.30 && labelKey !== 'Healthy_Cow') {
      console.warn(`[LocalML] Low confidence (${confidence}) for label ${rawLabel} — unreliable result.`);
    }

    const prediction = {
      isLivestock: labelKey !== 'non_livestock',
      label: kb.label,
      confidence: parseFloat(confidence.toFixed(3)),
      riskLevel: kb.riskLevel,
      symptoms: kb.symptoms,
      recommendation: kb.recommendation,
      treatment: kb.treatment,
      allScores: d.all_scores || {},
      source: 'Local TFLite ML Model (CattleCare v1)'
    };

    console.log(`[LocalML] Diagnosed: ${kb.label} (confidence: ${confidence})`);
    return prediction;

  } catch (mlErr) {
    console.warn('[LocalML] Service error:', mlErr.message);
    return null;
  }
}

// ─── Try Google Gemini Vision API ─────────────────────────────────────────────
async function tryGeminiVision(fileBuffer, mimeType, apiKey) {
  if (!GoogleGenAI || !apiKey || apiKey === 'PASTE_YOUR_AIzaSy_KEY_HERE') return null;

  const promptText = `You are an expert veterinary AI pathologist specializing in cattle and livestock health.
Examine the provided image carefully.

If the image does NOT show a livestock animal or skin lesion (laptop, keyboard, face, furniture, etc.):
Return ONLY this JSON:
{"isLivestock":false,"label":"Non-Livestock Image Detected","confidence":0.0,"riskLevel":"NONE","symptoms":["No animal detected"],"recommendation":"Please capture a clear photo of your cattle skin or lesion.","treatment":{"medicines":[],"firstAid":"Capture cattle skin photo.","prevention":"Ensure good lighting."}}

If IS livestock/lesion, diagnose and return ONLY this JSON:
{"isLivestock":true,"label":"<Disease or Healthy Cattle>","confidence":<0.85-0.99>,"riskLevel":"<CRITICAL|HIGH|MODERATE|LOW>","symptoms":["Symptom 1","Symptom 2","Symptom 3"],"recommendation":"<detailed vet action plan>","treatment":{"medicines":["Medicine 1 with dosage"],"firstAid":"First aid steps","prevention":"Prevention steps"}}

IMPORTANT: Output ONLY raw valid JSON. No markdown. No explanation.`;

  // Try multiple models in order (each has separate quota)
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const modelName of models) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      const ai = new GoogleGenAI({ apiKey });
      const base64Image = fileBuffer.toString('base64');

      const sdkResponse = await ai.models.generateContent({
        model: modelName,
        contents: [{
          role: 'user',
          parts: [
            { text: promptText },
            { inlineData: { mimeType, data: base64Image } }
          ]
        }]
      });

      let rawText = sdkResponse?.candidates?.[0]?.content?.parts?.[0]?.text || sdkResponse?.text || '';
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      if (!rawText) continue;

      const prediction = JSON.parse(rawText);
      prediction.source = `Google Gemini Vision (${modelName})`;
      console.log(`[Gemini] Success with ${modelName}:`, prediction.label);
      return prediction;

    } catch (err) {
      const status = err?.status || err?.response?.status || 0;
      const msg = err?.message || '';
      if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        console.warn(`[Gemini] ${modelName} quota exhausted, trying next model...`);
        continue; // Try next model
      }
      console.warn(`[Gemini] ${modelName} error:`, msg.substring(0, 100));
    }
  }

  console.warn('[Gemini] All model quotas exhausted, falling back.');
  return null;
}

// ─── POST /predict/analyze ────────────────────────────────────────────────────
router.post('/analyze', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

    const apiKey = process.env.GEMINI_API_KEY;
    const modelChoice = req.body.model || req.query.model || 'gemini';
    let prediction = null;

    console.log(`[Predict] Model selected: ${modelChoice}`);

    if (modelChoice === 'edge') {
      prediction = await tryLocalML(req.file.buffer, req.file.originalname || 'image.jpg');
      if (prediction) {
        prediction.source = 'Edge Rulebook / Local ML';
      }
    } else if (modelChoice === 'nano' || modelChoice === 'localml') {
      prediction = await tryLocalML(req.file.buffer, req.file.originalname || 'image.jpg');
      if (prediction) {
        prediction.source = modelChoice === 'nano'
          ? 'Gemini Nano (On-Device TFLite)'
          : 'Local TFLite ML Model (CattleCare v1)';
      }

    } else {
      // gemini: cloud first, then local ML
      prediction = await tryGeminiVision(req.file.buffer, req.file.mimetype || 'image/jpeg', apiKey);
      if (!prediction) {
        console.log('[Predict] Gemini failed, trying local ML...');
        prediction = await tryLocalML(req.file.buffer, req.file.originalname || 'image.jpg');
      }
    }

    // Final safety net — if local ML also returned nothing
    if (!prediction) {
      console.warn('[Predict] All models failed.');
      return res.status(503).json({ error: 'AI models cannot be reached. Please check your connection and ensure the ML service is running.' });
    }

    // Save to DB
    try {
      if (req.user?.id && prediction.label !== 'Non-Livestock Image Detected') {
        await prisma.prediction.create({
          data: {
            userId: req.user.id,
            disease: prediction.label,
            confidence: prediction.confidence || 0.9,
            riskLevel: prediction.riskLevel || 'HIGH',
            imagePath: req.file.originalname || 'scan.jpg',
          }
        });
      }
    } catch (dbErr) {
      console.warn('[DB] Save warning:', dbErr.message);
    }

    return res.json({ prediction, message: `Analyzed via ${prediction.source}.` });

  } catch (error) {
    console.error('[Predict] Unhandled error:', error?.message);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// ─── POST /predict/sync ───────────────────────────────────────────────────────
router.post('/sync', requireAuth, validate(syncSchema), async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid payload. Expected an array of records.' });
    }

    const userId = req.user.id;
    const syncedIds = [];

    for (const record of records) {
      await prisma.prediction.upsert({
        where: { id: record.id },
        update: {},
        create: {
          id: record.id, userId,
          disease: record.disease,
          confidence: record.confidence,
          riskLevel: record.riskLevel || 'MEDIUM',
          imagePath: record.imagePath,
          createdAt: new Date(record.createdAt || Date.now()),
          syncedAt: new Date(),
        }
      });

      if (record.symptoms) {
        await prisma.symptom.upsert({
          where: { predictionId: record.id },
          update: {},
          create: {
            predictionId: record.id,
            symptomData: typeof record.symptoms === 'string' ? JSON.parse(record.symptoms) : record.symptoms,
          }
        });
      }
      syncedIds.push(record.id);
    }

    res.json({ success: true, syncedIds });
  } catch (error) {
    console.error('[Sync] Error:', error.message);
    res.status(500).json({ error: 'Sync failed.' });
  }
});

module.exports = router;
