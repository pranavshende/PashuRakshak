const express = require('express');
const router = express.Router();
const Redis = require('ioredis');
const prisma = require('../config/db');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
});
redis.on('error', () => {}); // Silence connection errors if Redis is not running locally

// Static mock fallback database of medicines in case DB is empty initially
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

// GET list of all diseases
router.get('/', async (req, res) => {
  try {
    // Select all unique diseaseKeys from the Medicine table in Postgres
    const medicines = await prisma.medicine.findMany({
      select: { diseaseKey: true },
      distinct: ['diseaseKey']
    });
    
    let diseases = medicines.map(m => m.diseaseKey);
    
    // If Postgres table is empty, fall back to our mock keys so app is populated
    if (diseases.length === 0) {
      diseases = Object.keys(MEDICINE_DB);
    }
    
    res.json({ success: true, data: diseases });
  } catch (error) {
    console.error('Fetch Diseases Error:', error);
    res.status(500).json({ error: 'Failed to fetch disease list.' });
  }
});

// GET specific disease details
router.get('/:disease', async (req, res) => {
  try {
    const diseaseName = req.params.disease;
    
    // Check Redis cache first
    const cacheKey = `medicine:${diseaseName}`;
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {
      console.warn('Redis Cache Get Failed (proceeding to DB):', redisError.message);
    }
    
    if (cachedData) {
      return res.json({ source: 'cache', data: JSON.parse(cachedData) });
    }
    
    // Fetch from Postgres database via Prisma
    const medicines = await prisma.medicine.findMany({
      where: { diseaseKey: diseaseName }
    });
    
    let data;
    if (medicines.length > 0) {
      // Map database schema to frontend expected layout
      data = {
        description: `${diseaseName} treatment plan loaded from Postgres DB.`,
        quarantine: diseaseName === 'Lumpy Skin Disease' ? 'Immediate isolation required for 28 days.' :
                    diseaseName === 'FMD' ? 'Strict isolation. Do not move animals off farm.' :
                    diseaseName === 'Mastitis' ? 'Milk infected cow last. Disinfect equipment.' :
                    'Consult a veterinarian immediately.',
        treatments: medicines.map(m => {
          // Parse dosage and notes out of instructions or fallbacks
          const parts = m.usageInstructions.split('. ');
          return {
            name: m.name,
            dosage: parts[0] || 'Consult vet',
            notes: parts.slice(1).join('. ') || 'None'
          };
        })
      };
    } else {
      // Fallback to static mock DB if not found in Postgres
      data = MEDICINE_DB[diseaseName] || {
        description: 'Disease not found in medicine reference.',
        treatments: [],
        quarantine: 'Consult a veterinarian immediately.'
      };
    }
    
    // Store in cache for 24 hours (86400 seconds)
    try {
      await redis.setex(cacheKey, 86400, JSON.stringify(data));
    } catch (redisError) {
      console.warn('Redis Cache Set Failed:', redisError.message);
    }
    
    res.json({ source: 'database', data });
  } catch (error) {
    console.error('Medicine API Error:', error);
    res.status(500).json({ error: 'Failed to fetch medicine reference.' });
  }
});

// POST a new disease treatment plan
router.post('/', async (req, res) => {
  try {
    const { disease, description, quarantine, treatments } = req.body;
    
    if (!disease || !treatments || !Array.isArray(treatments)) {
      return res.status(400).json({ error: 'Disease name and treatments array are required' });
    }

    // Map treatments payload to DB format and save
    const dbRecords = treatments.map(t => ({
      diseaseKey: disease,
      name: t.name,
      usageInstructions: `${t.dosage}. ${t.notes}`
    }));

    // Insert many records in Postgres
    await prisma.medicine.createMany({
      data: dbRecords
    });

    const responsePayload = {
      description: description || `${disease} treatment plan.`,
      quarantine: quarantine || 'Consult a veterinarian immediately.',
      treatments
    };

    // Invalidate Redis cache
    try {
      await redis.del(`medicine:${disease}`);
      // Store newly added data in Redis cache for 24 hours
      await redis.setex(`medicine:${disease}`, 86400, JSON.stringify(responsePayload));
    } catch (redisError) {
      console.warn('Redis Cache Invalidation Failed:', redisError.message);
    }

    res.json({ success: true, message: 'Treatment plan added successfully to Postgres', data: { disease, ...responsePayload } });
  } catch (error) {
    console.error('Add Medicine Error:', error);
    res.status(500).json({ error: 'Failed to add treatment plan.' });
  }
});

module.exports = router;
