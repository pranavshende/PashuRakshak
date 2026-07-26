const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth } = require('../middlewares/authMiddleware');

// Get all animals for the logged-in farmer
router.get('/', requireAuth, async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      where: { userId: req.user.id },
      include: {
        vaccinations: true,
        milkRecords: true,
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    res.json({ animals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch animals.' });
  }
});

// Create a new Digital Twin
router.post('/', requireAuth, async (req, res) => {
  try {
    const { tagId, name, breed, dateOfBirth, weight } = req.body;
    
    // In production, validate with Zod
    const animal = await prisma.animal.create({
      data: {
        tagId,
        name,
        breed,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        weight: weight ? parseFloat(weight) : null,
        userId: req.user.id
      }
    });
    
    res.json({ success: true, animal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create animal profile.' });
  }
});

// Get a specific animal by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const animal = await prisma.animal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        vaccinations: { orderBy: { dateAdministered: 'desc' } },
        milkRecords: { orderBy: { date: 'desc' }, take: 30 },
        predictions: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    
    res.json({ animal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch animal.' });
  }
});

module.exports = router;
