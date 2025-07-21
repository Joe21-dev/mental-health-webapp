import express from 'express';
import Checkin from '../models/Checkin.js';

const router = express.Router();

// Get all checkins for a user
router.get('/', async (req, res) => {
  const user = req.query.user || 'User';
  const checkins = await Checkin.find({ user });
  res.json(checkins);
});

// Record a checkin for today
router.post('/', async (req, res) => {
  const { user = 'User', date } = req.body;
  let checkin = await Checkin.findOne({ user, date });
  if (!checkin) {
    checkin = new Checkin({ user, date });
    await checkin.save();
  }
  res.json(checkin);
});

export default router;
