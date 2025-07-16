import mongoose from 'mongoose';

const HealthSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true }, // e.g. 'sleep', 'meditation', 'pill', etc.
  value: { type: mongoose.Schema.Types.Mixed },
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Health', HealthSchema);
