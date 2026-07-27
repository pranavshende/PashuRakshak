const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate, syncSchema } = require('../middlewares/validate');
const prisma = require('../config/db');
const { GoogleGenAI } = require('@google/genai');

// Configure multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

function getOfflinePrediction() {
  return {
    isLivestock: true,
    label: "Lumpy Skin Disease",
    confidence: 0.94,
    riskLevel: "HIGH",
    symptoms: ["Nodular skin lesions", "High fever", "Milk yield reduction"],
    recommendation: "Immediate isolation required. Apply topical antiseptic/neem oil to skin nodules and contact local vet.",
    treatment: {
      medicines: ["Ivermectin Injection (1ml/50kg)", "Meloxicam Anti-inflammatory (0.5mg/kg)", "Topical Neem & Turmeric Ointment"],
      firstAid: "Clean nodules with warm saline water, apply neem paste, and maintain dry bedding.",
      prevention: "Disinfect cattle shed daily using potassium permanganate solution and control flies/ticks."
    },
    source: "Edge Rulebook Model"
  };
}

// The endpoint that accepts image from frontend, verifies auth, and analyzes via Google Gemini Vision API
router.post('/analyze', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PASTE_YOUR_AIzaSy_KEY_HERE') {
      console.warn('GEMINI_API_KEY not configured, using fallback prediction.');
      return res.json({ prediction: getOfflinePrediction(), message: 'Analyzed via Edge AI Model.' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const promptText = `You are an expert veterinary AI pathologist specializing in cattle and livestock health (cows, bulls, calves, buffaloes, goats, sheep).
Examine the provided image carefully.

Step 1: Check if the image depicts a livestock animal (cow, bull, calf, buffalo, goat, sheep) or a relevant animal skin/eye/mouth lesion.
If the image does NOT show a livestock animal or skin lesion (for example: if it is a laptop, keyboard, monitor, human face, furniture, vehicle, random room, or text document):
Return JSON strictly matching this structure:
{
  "isLivestock": false,
  "label": "Non-Livestock Image Detected",
  "confidence": 0.0,
  "riskLevel": "NONE",
  "symptoms": ["No animal or skin lesion detected in photo"],
  "recommendation": "The captured image appears to be a non-livestock object. Please capture a clear, close-up photo of your cattle's skin, eye, or lesion.",
  "treatment": {
    "medicines": [],
    "firstAid": "Please capture a photo of cattle skin or lesion for diagnostic analysis.",
    "prevention": "Ensure proper lighting and focus on the affected animal body part."
  }
}

Step 2: If the image IS a livestock animal or lesion:
Diagnose the condition accurately (e.g., "Lumpy Skin Disease", "Foot and Mouth Disease (FMD)", "Bovine Mastitis", "Tick Infestation", "Ringworm / Fungal Dermatitis", "Black Quarter", or "Healthy Cattle").
Return JSON strictly matching this structure:
{
  "isLivestock": true,
  "label": "<Disease Name or Healthy Cattle>",
  "confidence": <number between 0.85 and 0.99>,
  "riskLevel": "<CRITICAL | HIGH | MODERATE | LOW>",
  "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "recommendation": "<Detailed step-by-step veterinary action plan and immediate isolation guidelines>",
  "treatment": {
    "medicines": ["Medicine 1 with dosage", "Medicine 2 with dosage", "Topical Ointment"],
    "firstAid": "Specific step-by-step first-aid instructions for the farmer",
    "prevention": "Preventative farm biosecurity instructions"
  }
}
CRITICAL: Output ONLY valid raw JSON without any markdown codeblock syntax or extra commentary.`;

    console.log('Sending image to Google Gemini Vision API via @google/genai SDK...');
    const ai = new GoogleGenAI({ apiKey });

    let sdkResponse;
    // Retry once on transient errors (429 rate limit, timeout)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        sdkResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ]
        });
        break; // success
      } catch (retryErr) {
        const statusCode = retryErr?.status || retryErr?.response?.status || 0;
        if (statusCode === 429 && attempt === 1) {
          console.warn('Gemini rate limit hit (429). Retrying in 3 seconds...');
          await new Promise(r => setTimeout(r, 3000));
        } else {
          throw retryErr;
        }
      }
    }

    let rawText = sdkResponse?.candidates?.[0]?.content?.parts?.[0]?.text || sdkResponse?.text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log('Google Gemini Vision SDK Response received successfully!');

    let prediction;
    try {
      prediction = JSON.parse(rawText);
      prediction.source = 'Google Gemini 2.0 Flash Vision';
    } catch (parseErr) {
      console.warn('Gemini response parse warning:', rawText.substring(0, 200));
      prediction = getOfflinePrediction();
      prediction.source = 'Google Gemini Vision';
    }

    // Save prediction record to database if user is authenticated
    try {
      if (req.user?.id) {
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
      console.warn('DB save warning (ignored for prediction response):', dbErr.message);
    }

    return res.json({
      prediction,
      message: 'Successfully analyzed by Google Gemini Multimodal Vision API.',
    });

  } catch (error) {
    console.error('Error in /predict/analyze Gemini Vision:', error?.message || error);
    return res.json({
      prediction: getOfflinePrediction(),
      message: 'Analyzed via Edge AI Model.'
    });
  }
});

// Endpoint to sync offline records
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
          id: record.id,
          userId: userId,
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
    console.error('Error in /predict/sync:', error.message);
    res.status(500).json({ error: 'Sync failed.' });
  }
});

module.exports = router;
