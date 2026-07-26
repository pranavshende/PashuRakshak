const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth } = require('../middlewares/authMiddleware');

// Calculate AI Farm Productivity Score
router.get('/score', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all animals for the farmer
    const animals = await prisma.animal.findMany({
      where: { userId },
      include: {
        vaccinations: true,
        predictions: true,
        milkRecords: {
          where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Last 30 days
        }
      }
    });

    if (animals.length === 0) {
      return res.json({
        score: 0,
        message: 'No animals found. Add animals to generate a Farm Score.',
        details: { health: 0, milk: 0, vaccination: 0 }
      });
    }

    let totalVaccinations = 0;
    let totalDiseases = 0;
    let totalMilkLiters = 0;

    animals.forEach(animal => {
      totalVaccinations += animal.vaccinations.length;
      totalDiseases += animal.predictions.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Medium').length;
      animal.milkRecords.forEach(m => totalMilkLiters += m.quantityLiters);
    });

    // Scoring Logic (Out of 100)
    // 1. Vaccination Coverage (Max 40 points) - Expect at least 1 vaccination per animal
    const vaxRatio = totalVaccinations / animals.length;
    let vaxScore = Math.min((vaxRatio / 1) * 40, 40);

    // 2. Health / Disease Penalty (Max 40 points) - Lose points for frequent diseases
    const diseaseRatio = totalDiseases / animals.length;
    let healthScore = 40 - Math.min((diseaseRatio * 10), 40);

    // 3. Productivity / Milk Yield (Max 20 points) - Base metric: 10L per day per animal over 30 days
    const expectedMilk = animals.length * 10 * 30; // 300L per animal per month
    let milkScore = expectedMilk > 0 ? Math.min((totalMilkLiters / expectedMilk) * 20, 20) : 0;

    const finalScore = Math.round(vaxScore + healthScore + milkScore);

    // AI Generated Suggestion
    let suggestion = 'Your farm is doing excellently!';
    if (vaxScore < 20) suggestion = 'Vaccination coverage is low. Schedule a vet visit for routine shots.';
    else if (healthScore < 20) suggestion = 'High disease frequency detected. Review farm sanitation and quarantine protocols.';
    else if (milkScore < 10 && expectedMilk > 0) suggestion = 'Milk yield is below average. Check cattle nutrition and hydration.';

    res.json({
      score: finalScore,
      suggestion,
      details: {
        healthScore: Math.round(healthScore),
        milkScore: Math.round(milkScore),
        vaccinationScore: Math.round(vaxScore),
        totalAnimals: animals.length,
        totalDiseases,
        totalMilkLiters
      }
    });

  } catch (error) {
    console.error('Farm Score API Error:', error);
    res.status(500).json({ error: 'Failed to calculate farm score.' });
  }
});

module.exports = router;
