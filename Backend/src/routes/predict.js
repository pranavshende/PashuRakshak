const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { requireAuth } = require('../middlewares/authMiddleware');

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

    // Make the request to the local FastAPI service (running on port 8000)
    // NOTE: In production, this URL should be an environment variable (e.g., process.env.ML_SERVICE_URL)
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
      // The request was made and the ML server responded with a status code outside of 2xx
      return res.status(error.response.status).json({ error: error.response.data });
    }
    res.status(500).json({ error: 'Failed to communicate with the ML service.' });
  }
});

module.exports = router;
