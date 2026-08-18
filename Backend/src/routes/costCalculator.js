const express = require('express');
const router = express.Router();

const COST_DATABASE = {
  'Lumpy Skin Disease': {
    disease: 'Lumpy Skin Disease (LSD)',
    earlyStageCost: 1200,
    lateStageCost: 18500,
    lossAvoided: 17300,
    earlyTreatments: ['Neem Oil Topicals', 'Mild NSAIDs (Meloxicam)', 'Fly Repellent Sprays'],
    lateTreatments: ['Broad-spectrum Antibiotics', 'Secondary Wound Debridement', 'Vet IV Fluid Therapy', 'Milk Yield Drop Loss (15 Days)']
  },
  'FMD': {
    disease: 'Foot-and-Mouth Disease (FMD)',
    earlyStageCost: 800,
    lateStageCost: 14500,
    lossAvoided: 13700,
    earlyTreatments: ['Potassium Permanganate Hoof Wash', 'Meloxicam Analgesics', 'Soft Feeds'],
    lateTreatments: ['Intensive Secondary Antibiotics', 'Hoof Sore Debridement Surgery', 'Milker Contamination Quarantine', 'Milk Yield Loss (20 Days)']
  },
  'Mastitis': {
    disease: 'Bovine Mastitis',
    earlyStageCost: 1500,
    lateStageCost: 22000,
    lossAvoided: 20500,
    earlyTreatments: ['Frequent Stripping', 'Udder Cold Compresses', 'NSAIDs (Flunixin Meglumine)'],
    lateTreatments: ['Intramammary Antibiotics Infusions', 'Teat Canal Surgical Drainage', 'Permanent Udder Quarter Damage Loss', 'Milk Discard Loss (10 Days)']
  }
};

router.get('/:disease', (req, res) => {
  const rawDiseaseName = req.params.disease;
  
  // Standardize keys to match database mapping
  let normalizedKey = 'Lumpy Skin Disease';
  if (rawDiseaseName.toUpperCase().includes('FMD') || rawDiseaseName.toUpperCase().includes('FOOT')) {
    normalizedKey = 'FMD';
  } else if (rawDiseaseName.toUpperCase().includes('MASTITIS') || rawDiseaseName.toUpperCase().includes('UDDER')) {
    normalizedKey = 'Mastitis';
  }

  const data = COST_DATABASE[normalizedKey] || COST_DATABASE['Lumpy Skin Disease'];
  res.json({ success: true, data });
});

module.exports = router;
