import mongoose from 'mongoose';

const therapyTrackerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  condition: { type: String, required: true },
  suggestedTreatment: { type: String, required: true },
  doctorName: { type: String, default: 'Not assigned' },
  sessionsRequired: { type: Number, default: 5 },
  progress: { type: Number, default: 0 },
  consistency: { type: String, enum: ['red', 'orange', 'green'], default: 'red' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('TherapyTracker', therapyTrackerSchema, 'therapytrackers');
