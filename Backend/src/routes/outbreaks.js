const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Get historical disease clusters (used for Heatmap and Time Slider)
router.get('/historical', async (req, res) => {
  try {
    const { days = 30, disease } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    let whereClause = {
      reportedAt: { gte: dateLimit }
    };

    if (disease && disease !== 'All') {
      whereClause.diseaseName = disease;
    }

    let reports = await prisma.diseaseReport.findMany({
      where: whereClause,
      orderBy: { reportedAt: 'desc' }
    });

    // Fetch real prediction count from database grouped by disease
    const realPredictions = await prisma.prediction.findMany({
      select: { disease: true }
    });

    const predictionCounts = {};
    realPredictions.forEach((p) => {
      const d = p.disease;
      predictionCounts[d] = (predictionCounts[d] || 0) + 1;
    });

    // Map clean database records
    const formattedData = reports.map((r) => {
      const cases = predictionCounts[r.diseaseName] || 5;
      return {
        id: r.id,
        diseaseName: r.diseaseName,
        latitude: r.latitude,
        longitude: r.longitude,
        severity: r.severity || 'High',
        reportedAt: r.reportedAt,
        confirmedCases: cases,
        locationName: r.latitude && r.longitude ? `${r.latitude.toFixed(2)}° N, ${r.longitude.toFixed(2)}° E` : 'Local Farm Zone'
      };
    });

    res.json({ data: formattedData });
  } catch (error) {
    console.error('Heatmap API Error:', error);
    res.status(500).json({ error: 'Failed to fetch disease reports.' });
  }
});

// Predict future outbreak hotspots (7-14 days)
router.get('/predict', async (req, res) => {
  try {
    // In a real scenario, this would call a sophisticated ML model with weather & density data.
    // For now, we simulate predictions based on current clusters.
    
    const recentReports = await prisma.diseaseReport.findMany({
      where: {
        reportedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }
    });

    // Mock predictive algorithm: Shift hotspots slightly based on simulated wind/migration
    const predictions = recentReports.map(report => ({
      ...report,
      id: `pred_${report.id}`,
      latitude: report.latitude + (Math.random() * 0.02 - 0.01),
      longitude: report.longitude + (Math.random() * 0.02 - 0.01),
      riskLevel: Math.random() > 0.7 ? 'High' : 'Medium',
      predictedFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days in future
    }));

    res.json({ data: predictions });
  } catch (error) {
    console.error('Prediction API Error:', error);
    res.status(500).json({ error: 'Failed to generate predictions.' });
  }
});

// Add a mock report (For testing the heatmap)
router.post('/seed', async (req, res) => {
  try {
    const mockData = [
      { diseaseName: 'Lumpy Skin Disease', latitude: 19.0760, longitude: 72.8777, severity: 'High' }, // Mumbai
      { diseaseName: 'FMD', latitude: 18.5204, longitude: 73.8567, severity: 'Medium' }, // Pune
      { diseaseName: 'Lumpy Skin Disease', latitude: 19.2183, longitude: 72.9781, severity: 'High' }, // Thane
      { diseaseName: 'Mastitis', latitude: 21.1458, longitude: 79.0882, severity: 'Low' }, // Nagpur
      { diseaseName: 'FMD', latitude: 20.0110, longitude: 73.7903, severity: 'High' } // Nashik
    ];
    
    await prisma.diseaseReport.createMany({ data: mockData });
    res.json({ success: true, message: 'Seeded mock disease reports.' });
  } catch (error) {
    console.error('Seed API Error:', error);
    res.status(500).json({ error: 'Failed to seed reports.' });
  }
});

module.exports = router;
