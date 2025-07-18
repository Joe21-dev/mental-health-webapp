import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  status: { type: String, default: 'approved' },
  avatar: { type: String },
  booked: { type: Boolean, default: false },
});

const Therapist = mongoose.model('Therapist', therapistSchema);
export default Therapist;
