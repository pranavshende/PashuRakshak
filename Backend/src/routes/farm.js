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

// Live News Ticker for Cattle Diseases & Policies
router.get('/news', async (req, res) => {
  try {
    // Dynamically fetch live news from Google News RSS feed for cattle diseases and livestock policy in India
    let fetchedNews = [];
    try {
      const rssUrl = 'https://news.google.com/rss/search?q=cattle+disease+OR+livestock+scheme+India&hl=en-IN&gl=IN&ceid=IN:en';
      const response = await fetch(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.ok) {
        const xml = await response.text();
        const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

        for (let i = 0; i < Math.min(itemMatches.length, 8); i++) {
          const match = itemMatches[i];
          const titleMatch = match.match(/<title>([\s\S]*?)<\/title>/);
          const linkMatch = match.match(/<link>([\s\S]*?)<\/link>/);
          const pubDateMatch = match.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

          let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
          let link = linkMatch ? linkMatch[1].trim() : 'https://dahd.nic.in/';
          let pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

          // Clean HTML entities
          title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

          if (title) {
            // Determine category
            let category = 'DISEASE ALERT';
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('scheme') || lowerTitle.includes('loan') || lowerTitle.includes('kisan') || lowerTitle.includes('credit')) {
              category = 'GOVT SCHEME';
            } else if (lowerTitle.includes('policy') || lowerTitle.includes('ministry') || lowerTitle.includes('gokul') || lowerTitle.includes('subsidy')) {
              category = 'POLICY';
            } else if (lowerTitle.includes('vaccin') || lowerTitle.includes('drive') || lowerTitle.includes('health')) {
              category = 'HEALTH ADVISORY';
            }

            fetchedNews.push({
              id: `live_${i}_${Date.now()}`,
              title: title,
              category: category,
              source: 'Live Web Feed',
              time: pubDate ? new Date(pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
              url: link,
              urgent: category === 'DISEASE ALERT'
            });
          }
        }
      }
    } catch (e) {
      console.warn('Live RSS fetch failed, utilizing database/fallback news.', e);
    }

    // Fallback if live RSS feed is unreachable
    if (fetchedNews.length === 0) {
      fetchedNews = [
        {
          id: '1',
          title: 'NADCP Free Vaccination Drive: FMD & Brucellosis shots active in local districts',
          category: 'DISEASE ALERT',
          source: 'DAHD Ministry',
          time: '1 hour ago',
          url: 'https://dahd.nic.in/',
          urgent: true
        },
        {
          id: '2',
          title: 'Lumpy Skin Disease Prevention Guidelines issued for dairy farmers',
          category: 'HEALTH ADVISORY',
          source: 'Livestock Health Board',
          time: '3 hours ago',
          url: 'https://dahd.nic.in/',
          urgent: true
        },
        {
          id: '3',
          title: 'Pashu Kisan Credit Card: Up to ₹1.6 Lakh collateral-free loan at 4% interest',
          category: 'GOVT SCHEME',
          source: 'NABARD',
          time: '5 hours ago',
          url: 'https://nabard.org/',
          urgent: false
        },
        {
          id: '4',
          title: 'Rashtriya Gokul Mission: Subsidies available for high-yield breed development',
          category: 'POLICY',
          source: 'Ministry of Animal Husbandry',
          time: '1 day ago',
          url: 'https://dahd.nic.in/',
          urgent: false
        }
      ];
    }

    res.json({ news: fetchedNews });
  } catch (error) {
    console.error('Farm News API Error:', error);
    res.status(500).json({ error: 'Failed to fetch live livestock news.' });
  }
});

module.exports = router;
