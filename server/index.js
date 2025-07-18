import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

import Therapist from './models/Therapist.js';

mongoose.connection.on('connected', async () => {
  console.log('MongoDB connected');
  // Seed default doctors if collection is empty
  const count = await Therapist.countDocuments();
  if (count === 0) {
    await Therapist.create([
      {
        name: 'Dr. Ogolla',
        specialty: 'Cognitive Behavioral Therapy',
        status: 'approved',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face',
        booked: false,
      },
      {
        name: 'Dr. Achieng',
        specialty: 'Mindfulness',
        status: 'approved',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        booked: false,
      },
    ]);
    console.log('Seeded default therapists');
  }
});

// Example modular route
import healthRoutes from './routes/health.js';
app.use('/api/health', healthRoutes);

import therapistRoutes from './routes/therapists.js';
app.use('/api/therapists', therapistRoutes);

// Placeholder for external API integration
app.get('/api/external', async (req, res) => {
  // Example: fetch from an external API
  // const response = await axios.get('https://api.example.com/data');
  res.json({ message: 'External API integration placeholder' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
