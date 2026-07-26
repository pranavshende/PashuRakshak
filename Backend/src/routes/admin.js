const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const { validate, vetSchema } = require('../middlewares/validate');

// Get high-level analytics
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalPredictions = await prisma.prediction.count();
    const totalVets = await prisma.vet.count();
    const totalFarmers = await prisma.user.count({ where: { role: 'FARMER' } });

    res.json({
      totalPredictions,
      totalVets,
      totalFarmers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// Get all vets
router.get('/vets', requireAuth, requireAdmin, async (req, res) => {
  try {
    const vets = await prisma.vet.findMany();
    res.json(vets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vets.' });
  }
});

// Add a new vet
router.post('/vets', requireAuth, requireAdmin, validate(vetSchema), async (req, res) => {
  try {
    const { name, phone, latitude, longitude } = req.body;
    
    // We insert the Vet and update the PostGIS geography column
    const newVet = await prisma.$transaction(async (tx) => {
      const vet = await tx.vet.create({
        data: { name, phone, latitude, longitude },
      });
      // Set PostGIS location point
      await tx.$executeRaw`
        UPDATE "Vet" 
        SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = ${vet.id}
      `;
      return vet;
    });

    res.json({ success: true, vet: newVet });
  } catch (error) {
    console.error('Error adding vet:', error);
    res.status(500).json({ error: 'Failed to add vet.' });
  }
});

// Delete a vet
router.delete('/vets/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.vet.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vet.' });
  }
});

module.exports = router;
