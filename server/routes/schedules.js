import express from 'express';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// Get all schedules for a user (default: 'User')
router.get('/', async (req, res) => {
  const user = req.query.user || 'User';
  const schedules = await Schedule.find({ user });
  res.json(schedules);
});

// Add a new schedule
router.post('/', async (req, res) => {
  const { user = 'User', title, description, date, time, color } = req.body;
  const schedule = new Schedule({ user, title, description, date, time, color });
  await schedule.save();
  res.status(201).json(schedule);
});

// Update a schedule
router.put('/:id', async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(schedule);
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  await Schedule.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
