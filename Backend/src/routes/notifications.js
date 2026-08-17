const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = [];

    // 1. Fetch user's high-risk predictions
    const predictions = await prisma.prediction.findMany({
      where: { userId, riskLevel: { in: ['High', 'CRITICAL', 'HIGH'] } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    predictions.forEach(p => {
      notifications.push({
        id: `pred_${p.id}`,
        type: 'HEALTH_ALERT',
        title: `Health Alert: ${p.disease}`,
        message: `High risk detected. Recommended action: Isolate immediately.`,
        createdAt: p.createdAt,
        entityId: p.id,
        entityType: 'prediction',
        severity: 'high'
      });
    });

    // 2. Fetch recent outbreaks (last 14 days)
    const recentOutbreaks = await prisma.diseaseReport.findMany({
      where: {
        reportedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { reportedAt: 'desc' },
      take: 5
    });

    recentOutbreaks.forEach(o => {
      notifications.push({
        id: `outbreak_${o.id}`,
        type: 'OUTBREAK_ALERT',
        title: `Outbreak Alert: ${o.diseaseName}`,
        message: `New outbreak cluster of ${o.diseaseName} reported at ${o.latitude.toFixed(2)}° N, ${o.longitude.toFixed(2)}° E.`,
        createdAt: o.reportedAt,
        entityId: o.id,
        entityType: 'outbreak',
        severity: o.severity === 'High' ? 'high' : 'medium'
      });
    });

    // 3. Fetch IoT anomalies
    const animals = await prisma.animal.findMany({
      where: { userId, sensorStatus: 'LIVE' },
      take: 10
    });

    animals.forEach(a => {
      if (a.temperature && a.temperature > 103) {
        notifications.push({
          id: `iot_temp_${a.id}`,
          type: 'IOT_ALERT',
          title: `IoT Alert: High Temp on ${a.name || 'Cattle'}`,
          message: `${a.name || 'Cattle'} body temperature is abnormally high (${a.temperature.toFixed(1)}°F).`,
          createdAt: a.lastSensorUpdate || new Date(),
          entityId: a.id,
          entityType: 'animal',
          severity: 'high'
        });
      }
      if (a.heartRate && a.heartRate > 100) {
        notifications.push({
          id: `iot_heart_${a.id}`,
          type: 'IOT_ALERT',
          title: `IoT Alert: High Heart Rate on ${a.name || 'Cattle'}`,
          message: `${a.name || 'Cattle'} heart rate is abnormally high (${a.heartRate.toFixed(0)} bpm).`,
          createdAt: a.lastSensorUpdate || new Date(),
          entityId: a.id,
          entityType: 'animal',
          severity: 'high'
        });
      }
    });

    // Sort by date descending
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ notifications });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
