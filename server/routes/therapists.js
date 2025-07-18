import express from 'express';
import Therapist from '../models/Therapist.js';
const router = express.Router();

// Seed default therapists if not present
const defaultTherapists = [
  {
    name: 'Dr. Ogolla',
    specialty: 'Cognitive Behavioral Therapy',
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face',
  },
  {
    name: 'Dr. Achieng',
    specialty: 'Mindfulness',
    status: 'approved',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
];

async function seedTherapists() {
  const count = await Therapist.countDocuments();
  if (count === 0) {
    await Therapist.insertMany(defaultTherapists);
  }
}
seedTherapists();

// Get all therapists
router.get('/', async (req, res) => {
  const therapists = await Therapist.find();
  res.json(therapists);
});

// Add a therapist
router.post('/', async (req, res) => {
  const { name, specialty, status, avatar } = req.body;
  const therapist = new Therapist({ name, specialty, status, avatar });
  await therapist.save();
  res.json(therapist);
});

// Book/unbook a therapist
router.patch('/:id/book', async (req, res) => {
  const { booked } = req.body;
  const therapist = await Therapist.findByIdAndUpdate(req.params.id, { booked }, { new: true });
  res.json(therapist);
});

export default router;
