import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  status: { type: String, default: 'waiting approval' },
  avatar: { type: String },
  booked: { type: Boolean, default: false },
  bookingInfo: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
});

export default mongoose.model('Doctor', doctorSchema, 'therapists');
