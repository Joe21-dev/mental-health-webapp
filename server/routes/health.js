import express from 'express';
import Health from '../models/Health.js';

const router = express.Router();

// Example GET endpoint
router.get('/', async (req, res) => {
  const healthRecords = await Health.find();
  res.json(healthRecords);
});

// Example POST endpoint
router.post('/', async (req, res) => {
  const newRecord = new Health(req.body);
  await newRecord.save();
  res.status(201).json(newRecord);
});

export default router;
