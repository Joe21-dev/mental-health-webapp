import mongoose from 'mongoose';

const checkinSchema = new mongoose.Schema({
  user: { type: String, required: true },
  date: { type: String, required: true }, // ISO date string
  checkedIn: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Checkin', checkinSchema, 'checkins');
