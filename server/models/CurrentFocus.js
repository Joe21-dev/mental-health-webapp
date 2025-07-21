import mongoose from 'mongoose';

const currentFocusSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  startDate: { type: String, required: true }, // ISO date string
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('CurrentFocus', currentFocusSchema, 'currentfocus');
