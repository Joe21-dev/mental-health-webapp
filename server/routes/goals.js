import express from 'express';
import Goal from '../models/Goal.js';

const router = express.Router();

// Get all goals for a user
router.get('/', async (req, res) => {
  const user = req.query.user || 'User';
  const goals = await Goal.find({ user });
  res.json(goals);
});

// Add a new goal
router.post('/', async (req, res) => {
  const { user = 'User', title, description, type, color } = req.body;
  const goal = new Goal({ user, title, description, type, color });
  await goal.save();
  res.status(201).json(goal);
});

// Update a goal
router.put('/:id', async (req, res) => {
  const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(goal);
});

// Delete a goal
router.delete('/:id', async (req, res) => {
  await Goal.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
