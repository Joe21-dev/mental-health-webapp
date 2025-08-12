const mongoose = require('mongoose');

const AvailableDoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String },
  bookedBy: { type: String, default: null }, // username of user who booked
  conditions: [{
    username: String,
    condition: String,
    suggestedTreatment: String,
    dateAdded: { type: Date, default: Date.now }
  }],
  therapyTracker: [{
    username: String,
    doctorName: String,
    suggestedTreatment: String,
    sessionsRequired: Number,
    progress: Number, // 0-100
    consistency: String // 'red', 'orange', 'green'
  }]
});

module.exports = mongoose.model('AvailableDoctor', AvailableDoctorSchema);
