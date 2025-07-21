import express from 'express';
import Doctor from '../models/Therapist.js';

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Add a new doctor
router.post('/', async (req, res) => {
  try {
    const { name, specialty, avatar } = req.body;
    const doctor = new Doctor({
      name,
      specialty,
      avatar,
      status: 'waiting approval',
      booked: false,
      createdAt: new Date(),
    });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add doctor' });
  }
});

// Book/unbook doctor and update bookingInfo
router.put('/:id/book', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Not found' });
    doctor.booked = req.body.booked;
    doctor.bookingInfo = req.body.bookingInfo || null;
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update booking' });
  }
});

// Approve doctors after 4 hours
router.post('/approve-pending', async (req, res) => {
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const doctors = await Doctor.find({ status: 'waiting approval', createdAt: { $lte: fourHoursAgo } });
    for (const d of doctors) {
      d.status = 'approved';
      d.approvedAt = new Date();
      await d.save();
    }
    res.json({ approved: doctors.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve doctors' });
  }
});

// Add a test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Doctors router is working' });
});

export default router;
