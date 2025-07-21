import express from 'express';
import TherapyTracker from '../models/TherapyTracker.js';

const router = express.Router();

// Get tracker for a user (for now, use 'User' as default)
router.get('/', async (req, res) => {
  const user = req.query.user || 'User';
  const tracker = await TherapyTracker.findOne({ user }).sort({ bookedAt: -1 });
  res.json(tracker || {});
});

// Update or create tracker for a user
router.post('/', async (req, res) => {
  const { user = 'User', doctor, therapy, condition, date, description, bookedAt, streak, longestStreak } = req.body;
  let tracker = await TherapyTracker.findOne({ user });
  if (tracker) {
    tracker.doctor = doctor;
    tracker.therapy = therapy;
    tracker.condition = condition;
    tracker.date = date;
    tracker.description = description;
    tracker.bookedAt = bookedAt;
    tracker.streak = streak;
    tracker.longestStreak = longestStreak;
    await tracker.save();
  } else {
    tracker = new TherapyTracker({ user, doctor, therapy, condition, date, description, bookedAt, streak, longestStreak });
    await tracker.save();
  }
  res.json(tracker);
});

export default router;
