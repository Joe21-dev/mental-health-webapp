import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: 'weekly' },
  color: { type: String, default: 'green' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Goal', goalSchema, 'goals');
