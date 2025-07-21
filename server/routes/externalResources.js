import express from 'express';
const router = express.Router();

// Import API keys from main server file
import { EXTERNAL_API_KEYS } from '../index.js';

// Dummy external API fetch simulation
const fetchExternalResource = async (type, query) => {
  // Simulate external API call using dummy key
  // In production, replace with actual fetch logic and use EXTERNAL_API_KEYS[type.toUpperCase() + '_API_KEY']
  return [
    { title: `${type} example 1`, url: 'https://example.com/1', author: 'Author 1', duration: '3:00' },
    { title: `${type} example 2`, url: 'https://example.com/2', author: 'Author 2', duration: '2:30' }
  ];
};

// GET /api/external-resources/:type?query=...
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const { query } = req.query;
  try {
    // Use dummy API key (replace with real API call)
    const resources = await fetchExternalResource(type, query);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch external resources' });
  }
});

export default router;
