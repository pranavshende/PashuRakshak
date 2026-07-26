const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt to constrain the AI to veterinary use cases
const SYSTEM_PROMPT = `
You are the PashuRakshak AI Veterinary Assistant. 
You are an expert in livestock health, particularly cattle and buffalo. 
Your goal is to help rural farmers diagnose symptoms, provide first-aid advice, and explain diseases like Lumpy Skin Disease (LSD), Foot and Mouth Disease (FMD), and Mastitis.
If asked about topics unrelated to agriculture, livestock, or veterinary care, politely decline to answer.
Always advise the user to consult a professional veterinarian for serious conditions.
Keep your answers concise, practical, and easy to understand.
`;

router.post('/', requireAuth, async (req, res) => {
  try {
    const { message, language } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let langPrompt = '';
    if (language && language !== 'English') {
      langPrompt = `\nPlease respond entirely in ${language}.`;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock response if no key is provided
      return res.json({ 
        response: `[Mock AI Response in ${language || 'English'}]: I see you are asking about: "${message}". Please provide a GEMINI_API_KEY in the .env file to activate the real AI assistant.` 
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: SYSTEM_PROMPT + langPrompt + "\n\nUser: " + message,
      config: {
        temperature: 0.2,
      }
    });

    if (response.text) {
      res.json({ response: response.text });
    } else {
      res.status(500).json({ error: 'Empty response from AI.' });
    }
    
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response.' });
  }
});

module.exports = router;
