import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  date: { type: String, required: true }, // ISO date string
  time: String,
  color: { type: String, default: 'blue' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Schedule', scheduleSchema, 'schedules');
