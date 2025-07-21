import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import geminiChatRouter from './routes/geminiChat.js';

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/gemini-chat', geminiChatRouter);

const PORT = process.env.PORT || 5000;

// Middleware


// Serve static files from resources folder
app.use('/resources', express.static(path.join(process.cwd(), 'resources')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/healthapp', {
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
        name: 'Dr. Winston',
        specialty: 'Cognitive Behavioral Therapy',
        status: 'approved',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face',
        booked: false,
      },
      {
        name: 'Dr. Sandra',
        specialty: 'Mindfulness',
        status: 'approved',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        booked: false,
      },
    ]);
    console.log('Seeded default therapists');
  }
});

import healthRoutes from './routes/health.js';
app.use('/api/health', healthRoutes);

import doctorsRouter from './routes/therapists.js';
app.use('/api/doctors', doctorsRouter);

import resourcesRouterModule from './routes/resources.js';
const resourcesRouter = resourcesRouterModule.default || resourcesRouterModule;
app.use('/api/resources', resourcesRouter);

import therapistsRouter from './routes/therapists.js';
app.use('/api/therapists', therapistsRouter);

import therapyTrackerRouter from './routes/therapyTracker.js';
app.use('/api/therapy-tracker', therapyTrackerRouter);

export const EXTERNAL_API_KEYS = {
  SONGS_API_KEY: 'c9393000f8mshfbaa9c41ffbc3f7p1704d3jsn3435ca190753', // Replace with your real Songs API key

};

// External resource endpoints
import externalResourcesRouter from './routes/externalResources.js';
app.use('/api/external-resources', externalResourcesRouter);

// Placeholder for external API integration
app.get('/api/external', async (req, res) => {
  // Example: fetch from an external API
  // const response = await axios.get('https://api.example.com/data');
  res.json({ message: 'External API integration placeholder' });
});

// Periodically approve doctors every 10 minutes
setInterval(async () => {
  try {
    await fetch('http://localhost:5000/api/doctors/approve-pending', { method: 'POST' });
  } catch (err) {
    // Ignore errors
  }
}, 10 * 60 * 1000);

// Endpoint to add a resource file to MongoDB
app.post('/api/resources/upload', async (req, res) => {
  try {
    const { type, title, artist, duration, host, typeDetail, author, speaker, fileName } = req.body;
    // File should already be placed in /resources folder manually
    const filePath = `/resources/${fileName}`;
    const resourceData = { type, title, artist, duration, host, typeDetail, author, speaker, url: filePath };
    const Resource = (await import('./models/Resource.js')).default;
    const resource = new Resource(resourceData);
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

import schedulesRouter from './routes/schedules.js';
app.use('/api/schedules', schedulesRouter);

import checkinsRouter from './routes/checkins.js';
app.use('/api/checkins', checkinsRouter);

import goalsRouter from './routes/goals.js';
app.use('/api/goals', goalsRouter);

import currentFocusRouter from './routes/currentFocus.js';
app.use('/api/current-focus', currentFocusRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
