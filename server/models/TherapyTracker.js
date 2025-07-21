import mongoose from 'mongoose';

const therapyTrackerSchema = new mongoose.Schema({
  user: { type: String, required: true }, // username or userId
  doctor: {
    name: String,
    specialty: String,
  },
  therapy: String,
  condition: String,
  date: String, // ISO date string
  description: String,
  bookedAt: String, // ISO datetime string
  streak: { type: Number, default: 1 },
  longestStreak: { type: Number, default: 1 },
});

export default mongoose.model('TherapyTracker', therapyTrackerSchema, 'therapytrackers');
