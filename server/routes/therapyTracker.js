import express from 'express';
import TherapyTracker from '../models/TherapyTracker.js';

const router = express.Router();

// Get tracker for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const trackers = await TherapyTracker.find({ userId }).sort({ createdAt: -1 });
      res.json(trackers);
    } else {
      const trackers = await TherapyTracker.find().sort({ createdAt: -1 });
      res.json(trackers);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch therapy tracker data' });
  }
});

// Create new therapy tracker entry
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      username,
      condition,
      suggestedTreatment,
      doctorName,
      sessionsRequired,
      progress,
      consistency
    } = req.body;

    const tracker = new TherapyTracker({
      userId,
      username,
      condition,
      suggestedTreatment,
      doctorName,
      sessionsRequired,
      progress,
      consistency,
      createdAt: new Date()
    });

    await tracker.save();
    res.status(201).json(tracker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create therapy tracker entry' });
  }
});

// Update therapy tracker
router.put('/:id', async (req, res) => {
  try {
    const tracker = await TherapyTracker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!tracker) {
      return res.status(404).json({ error: 'Therapy tracker not found' });
    }
    res.json(tracker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update therapy tracker' });
  }
});

// Delete therapy tracker
router.delete('/:id', async (req, res) => {
  try {
    const tracker = await TherapyTracker.findByIdAndDelete(req.params.id);
    if (!tracker) {
      return res.status(404).json({ error: 'Therapy tracker not found' });
    }
    res.json({ message: 'Therapy tracker deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete therapy tracker' });
  }
});

export default router;
