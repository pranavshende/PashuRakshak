const express = require('express');
const router = express.Router();
const Redis = require('ioredis');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Static mock database of medicines (In production, this would be in Postgres and manageable by Admins)
const MEDICINE_DB = {
  'Lumpy Skin Disease': {
    description: 'A viral disease of cattle and buffalo transmitted by blood-feeding insects.',
    treatments: [
      { name: 'Antibiotics', dosage: 'Consult vet for secondary infections.', notes: 'Do not use without vet prescription.' },
      { name: 'Anti-inflammatory drugs', dosage: 'As prescribed', notes: 'To reduce fever and pain.' },
      { name: 'Wound Care Spray', dosage: 'Apply topically 2x daily', notes: 'Keep lesions clean.' }
    ],
    quarantine: 'Immediate isolation required for 28 days.'
  },
  'FMD': {
    description: 'Foot-and-mouth disease is a severe, highly contagious viral disease of livestock.',
    treatments: [
      { name: 'FMD Vaccine', dosage: 'Annual booster', notes: 'Preventative only. Will not cure active infection.' },
      { name: 'Mild disinfectants', dosage: 'Wash hooves 2x daily', notes: 'E.g. Potassium Permanganate solution.' },
      { name: 'Painkillers (Meloxicam)', dosage: 'Consult Vet', notes: 'For severe pain and lameness.' }
    ],
    quarantine: 'Strict isolation. Do not move animals off farm.'
  },
  'Mastitis': {
    description: 'Inflammation of the mammary gland and udder tissue.',
    treatments: [
      { name: 'Intramammary Antibiotics', dosage: '1 tube per infected quarter every 12h', notes: 'E.g. Cefquinome or Amoxicillin.' },
      { name: 'NSAIDs', dosage: 'As prescribed', notes: 'To reduce swelling and pain.' },
      { name: 'Frequent Milking', dosage: 'Every 2-4 hours', notes: 'Strip out infected milk completely.' }
    ],
    quarantine: 'Milk infected cow last. Disinfect equipment.'
  }
};

router.get('/:disease', async (req, res) => {
  try {
    const diseaseName = req.params.disease;
    
    // Check Redis cache first
    const cacheKey = `medicine:${diseaseName}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return res.json({ source: 'cache', data: JSON.parse(cachedData) });
    }
    
    // If not in cache, fetch from our "Database"
    const data = MEDICINE_DB[diseaseName] || {
      description: 'Disease not found in medicine reference.',
      treatments: [],
      quarantine: 'Consult a veterinarian immediately.'
    };
    
    // Store in cache for 24 hours (86400 seconds)
    await redis.setex(cacheKey, 86400, JSON.stringify(data));
    
    res.json({ source: 'database', data });
  } catch (error) {
    console.error('Medicine API Error:', error);
    res.status(500).json({ error: 'Failed to fetch medicine reference.' });
  }
});

module.exports = router;
