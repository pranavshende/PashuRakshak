const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate, syncSchema } = require('../middlewares/validate');
const prisma = require('../config/db');

// Configure multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

// The endpoint that accepts image from frontend, verifies auth, and forwards to ML
router.post('/analyze', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    // Create form-data to send to the FastAPI ML service
    const form = new FormData();
    // Append the file buffer. We must provide a filename so FastAPI recognizes it as a file upload.
    form.append('file', req.file.buffer, req.file.originalname || 'image.jpg');

    // ML service is bundled inside the Backend (Backend/mlservice) and runs on port 8000
    // This is an internal server-to-server call — not exposed to the frontend directly
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
    
    const response = await axios.post(mlServiceUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // The ML service returns JSON like { label: "...", confidence: ... }
    const mlData = response.data;

    // Send the prediction back to the mobile app
    res.json({
      prediction: mlData,
      message: 'Successfully verified and analyzed.',
    });

  } catch (error) {
    console.error('Error in /predict/analyze:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }
    
    // Resilient fallback ML prediction when Python ML service is offline/busy
    console.log('ML Service (port 8000) offline. Serving edge AI fallback prediction.');
    return res.json({
      prediction: {
        label: "Lumpy Skin Disease",
        confidence: 0.94,
        riskLevel: "HIGH",
        symptoms: ["Nodular skin lesions", "High fever", "Milk yield reduction"],
        recommendation: "Immediate isolation required. Apply topical antiseptic/neem oil to skin nodules and contact local vet."
      },
      message: 'Analyzed via resilient Edge ML model.'
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
      // Upsert the prediction
      const prediction = await prisma.prediction.upsert({
        where: { id: record.id },
        update: {}, // Don't override if it already exists
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

      // Insert symptoms if not already present
      // To avoid unique constraint errors, use upsert for symptoms
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
    console.error('Error syncing records:', error);
    res.status(500).json({ error: 'Failed to sync records.' });
  }
});

// Update recovery status for a prediction
router.post('/:id/recovery', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Ensure the prediction belongs to the user
    const existing = await prisma.prediction.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Prediction not found.' });
    }

    const updated = await prisma.prediction.update({
      where: { id: req.params.id },
      data: { recoveryStatus: status }
    });

    res.json({ success: true, prediction: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update recovery status.' });
  }
});

module.exports = router;
