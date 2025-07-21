import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// POST /api/gemini-chat
router.post('/chat', async (req, res) => {
  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not set in backend.' });
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }
  try {
    // Use the latest Gemini model and endpoint (as of July 2025)
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
        ]
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(400).json({ error: data.error?.message || 'Gemini API error.' });
    // Extract AI response
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ aiText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
