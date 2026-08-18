const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Supported mock parsing database
const DISEASE_RULES = {
  'Lumpy Skin Disease': {
    name: 'Lumpy Skin Disease (LSD)',
    medicines: 'Neem Oil topicals, Meloxicam (pain relief).',
    quarantine: 'Immediate isolation required for 28 days. Spray stalls to control flies/ticks.',
  },
  'FMD': {
    name: 'Foot-and-Mouth Disease (FMD)',
    medicines: 'Potassium Permanganate hoof wash, Meloxicam for lameness.',
    quarantine: 'Strict isolation. Do not move cattle. Keep floor dry.',
  },
  'Mastitis': {
    name: 'Bovine Mastitis',
    medicines: 'Amoxicillin + Cloxacillin, Flunixin Meglumine.',
    quarantine: 'Milk infected cow last. Disinfect milking cups thoroughly.',
  }
};

router.post('/sms', async (req, res) => {
  try {
    // Support URLencoded (Twilio default) or JSON body parser formats
    const bodyText = req.body.Body || req.body.body || '';
    const sender = req.body.From || req.body.from || 'Unknown Farmer';

    if (!bodyText) {
      return res.status(400).json({ error: 'SMS body text (Body field) is required.' });
    }

    const textUpper = bodyText.toUpperCase();
    let diagnosedDisease = 'Lumpy Skin Disease';
    let diseaseKey = 'Lumpy Skin Disease';

    // Rule-engine parsing
    if (textUpper.includes('FOOT') || textUpper.includes('MOUTH') || textUpper.includes('FMD') || textUpper.includes('WOUND')) {
      diagnosedDisease = 'Foot-and-Mouth Disease (FMD)';
      diseaseKey = 'FMD';
    } else if (textUpper.includes('UDDER') || textUpper.includes('MILK') || textUpper.includes('MASTITIS') || textUpper.includes('SWELLING')) {
      diagnosedDisease = 'Bovine Mastitis';
      diseaseKey = 'Mastitis';
    }

    const guidelines = DISEASE_RULES[diseaseKey];

    // Find a vet near the text location, if specified
    let targetVet = { name: 'Dr. Arjun More', phone: '+919011111112' };
    try {
      const dbVets = await prisma.vet.findMany({ take: 3 });
      if (dbVets.length > 0) {
        // Simple search: does text specify Pune, Nagpur, Mumbai etc.
        const matchedVet = dbVets.find(v => textUpper.includes(v.name.toUpperCase()) || (v.address && textUpper.includes(v.address.toUpperCase())));
        if (matchedVet) {
          targetVet = matchedVet;
        } else {
          targetVet = dbVets[0]; // default to first seeded vet
        }
      }
    } catch (dbError) {
      console.warn('Database vet lookup in SMS webhook failed, using default vet:', dbError.message);
    }

    // Format Twilio SMS response XML or clean template JSON
    const responseSms = `[PashuRakshak AI SMS Vet]
Diag: ${guidelines.name}
First-Aid: ${guidelines.medicines}
Isolation: ${guidelines.quarantine}
Local Vet: ${targetVet.name} (${targetVet.phone})
Emergency: Dial 1962 (Free)`;

    // Return as XML (Twilio TwiML format) or standard JSON depending on request content-type
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('xml')) {
      res.header('Content-Type', 'text/xml');
      return res.send(`
        <Response>
          <Message>${responseSms}</Message>
        </Response>
      `);
    }

    res.json({
      success: true,
      sender,
      bodyReceived: bodyText,
      diagnosedDisease: guidelines.name,
      replyMessage: responseSms
    });
  } catch (error) {
    console.error('Webhook SMS Error:', error);
    res.status(500).json({ error: 'Failed to process SMS webhook request.' });
  }
});

module.exports = router;
