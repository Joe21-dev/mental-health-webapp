import express from 'express';
import AvailableDoctor from '../models/AvailableDoctor.js';
const router = express.Router();

// Get all available doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await AvailableDoctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Add a new doctor
router.post('/', async (req, res) => {
  try {
    const doctor = new AvailableDoctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add doctor' });
  }
});

// Update doctor (book/unbook, add condition, update tracker)
router.put('/:id', async (req, res) => {
  try {
    const doctor = await AvailableDoctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update doctor' });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    await AvailableDoctor.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete doctor' });
  }
});

export default router;
