const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middlewares/authMiddleware');
const { GoogleGenAI } = require('@google/genai');
const prisma = require('../config/db');

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

// System prompt to constrain the AI to veterinary use cases
const SYSTEM_PROMPT = `
You are the PashuRakshak AI Veterinary Assistant. 
You are an expert in livestock health, particularly cattle and buffalo. 
Your goal is to help rural farmers diagnose symptoms, provide first-aid advice, and explain diseases like Lumpy Skin Disease (LSD), Foot and Mouth Disease (FMD), and Mastitis.
If asked about topics unrelated to agriculture, livestock, or veterinary care, politely decline to answer.
Always advise the user to consult a professional veterinarian for serious conditions.
Keep your answers concise, practical, and easy to understand.
`;

// Get chat history
router.get('/history', requireAuth, async (req, res) => {
  try {
    let conversation = await prisma.conversation.findFirst({
      where: { userId: req.user.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId: req.user.id, title: 'AI Vet Consultation' },
        include: { messages: true }
      });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Fetch History Error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Clear Chat history
router.delete('/clear', requireAuth, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { userId: req.user.id }
    });
    if (conversation) {
      await prisma.message.deleteMany({
        where: { conversationId: conversation.id }
      });
    }
    res.json({ success: true, message: 'Consultation history cleared successfully.' });
  } catch (error) {
    console.error('Clear History Error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// Text chat route
router.post('/', requireAuth, async (req, res) => {
  try {
    const { message, language } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let conversation = await prisma.conversation.findFirst({
      where: { userId: req.user.id }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId: req.user.id, title: 'AI Vet Consultation' }
      });
    }

    // Save user message
    await prisma.message.create({
      data: { conversationId: conversation.id, sender: 'user', text: message }
    });

    let langPrompt = '';
    if (language && language !== 'English') {
      langPrompt = `\nPlease respond entirely in ${language}.`;
    }

    let aiText = '';
    if (!process.env.GEMINI_API_KEY) {
      aiText = `[Mock AI Response in ${language || 'English'}]: I see you are asking about: "${message}". Please provide a GEMINI_API_KEY in the .env file to activate the real AI assistant.`;
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: SYSTEM_PROMPT + langPrompt + "\n\nUser: " + message,
        config: {
          temperature: 0.2,
        }
      });
      aiText = response.text ? response.text.replace(/\\n/g, '\n') : 'Error generating response';
    }

    // Save AI message
    await prisma.message.create({
      data: { conversationId: conversation.id, sender: 'bot', text: aiText }
    });

    res.json({ response: aiText });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response.' });
  }
});

// Audio voice chat route
router.post('/audio', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    let langPrompt = '';
    if (language && language !== 'English') {
      langPrompt = `\nPlease respond entirely in ${language}.`;
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ 
        response: `[Mock Audio AI Response in ${language || 'English'}]: Received your audio recording! Please provide a GEMINI_API_KEY in the .env file to activate the real voice AI assistant.` 
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            data: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype || 'audio/m4a'
          }
        },
        {
          text: SYSTEM_PROMPT + langPrompt + "\n\nAnalyze the spoken audio query and provide veterinary advice based on it. You MUST output a JSON object containing exactly two keys:\n1. 'transcript': The exact transcription of the user's spoken words in the audio.\n2. 'response': Your professional veterinary response to their query.\n\nEnsure the JSON is valid and matches the requested keys."
        }
      ],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      try {
        let cleaned = response.text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
        }
        const result = JSON.parse(cleaned);
        const cleanResponse = (result.response || "").replace(/\\n/g, '\n');
        res.json({ 
          transcript: result.transcript || "Spoken Audio", 
          response: cleanResponse || "I heard your audio but could not formulate a response."
        });
      } catch (parseError) {
        console.error('JSON Parse Error of Gemini Output:', response.text, parseError);
        const cleanResponse = response.text.replace(/\\n/g, '\n');
        res.json({ 
          transcript: "Spoken Audio", 
          response: cleanResponse 
        });
      }
    } else {
      res.status(500).json({ error: 'Empty response from AI.' });
    }

  } catch (error) {
    console.error('Audio Chat API Error:', error);
    res.status(500).json({ error: 'Failed to process audio AI response.' });
  }
});

module.exports = router;
