const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const Redis = require('ioredis');
const { requireAuth } = require('../middlewares/authMiddleware');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
});
redis.on('error', () => {}); // Silence connection errors if Redis is not running locally

// Get nearby vets (PostGIS + Redis Caching)
router.get('/nearby', requireAuth, async (req, res) => {
  try {
    const { lat, lon, radius = 50000 } = req.query; // default 50km radius
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    // Cache key based on a rounded grid to reduce cache misses
    // Round to 2 decimal places (approx 1.1km grid)
    const latGrid = parseFloat(lat).toFixed(2);
    const lonGrid = parseFloat(lon).toFixed(2);
    const cacheKey = `vets_nearby:${latGrid}:${lonGrid}:${radius}`;

    // Check Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // PostGIS Query to find vets within radius (in meters), sorted by distance
    const nearbyVets = await prisma.$queryRaw`
      SELECT 
        id, name, phone, latitude, longitude,
        ST_Distance(location, ST_SetSRID(ST_MakePoint(${parseFloat(lon)}, ${parseFloat(lat)}), 4326)) as distance
      FROM "Vet"
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(${parseFloat(lon)}, ${parseFloat(lat)}), 4326), ${parseInt(radius)})
      ORDER BY distance ASC
      LIMIT 5
    `;

    // Cache the result for 15 minutes
    await redis.setex(cacheKey, 900, JSON.stringify(nearbyVets));

    res.json(nearbyVets);
  } catch (error) {
    console.error('Error finding nearby vets:', error);
    res.status(500).json({ error: 'Failed to find nearby vets.' });
  }
});

module.exports = router;
