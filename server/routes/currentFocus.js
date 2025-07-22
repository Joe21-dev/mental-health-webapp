import express from 'express';
import CurrentFocus from '../models/CurrentFocus.js';

const router = express.Router();

// Get current focus for a user
router.get('/', async (req, res) => {
  try {
    const user = req.query.user || 'User';
    const focus = await CurrentFocus.findOne({ user });
    res.json(focus || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current focus' });
  }
});

// Set/update current focus
router.post('/', async (req, res) => {
  try {
    const { user = 'User', title, startDate } = req.body;
    let focus = await CurrentFocus.findOne({ user });
    if (focus) {
      focus.title = title;
      focus.startDate = startDate;
      await focus.save();
    } else {
      focus = new CurrentFocus({ user, title, startDate });
      await focus.save();
    }
    res.json(focus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to set current focus' });
  }
});

export default router;
