const mongoose = require('mongoose');
const AvailableDoctor = require('./models/AvailableDoctor');

const doctors = [
  { name: 'Dr. Alice Smith', specialty: 'Cognitive Behavioral Therapy' },
  { name: 'Dr. Bob Johnson', specialty: 'Mindfulness Therapy' },
  { name: 'Dr. Carol Lee', specialty: 'Family Therapy' },
  { name: 'Dr. David Kim', specialty: 'Trauma Therapy' }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/health-app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await AvailableDoctor.deleteMany({});
    await AvailableDoctor.insertMany(doctors);
    console.log('Seeded available doctors');
    process.exit();
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
