import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  status: { type: String, default: 'waiting approval' },
  avatar: { type: String },
  booked: { type: Boolean, default: false },
  bookedBy: { type: String, default: null },
  bookingInfo: { type: Object, default: null },
  // Contact and workplace info
  phoneNumber: { type: String, default: '' },
  hospitalName: { type: String, default: '' },
  hospitalLocation: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
});

export default mongoose.model('Doctor', doctorSchema, 'therapists');
