import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch'; // Needed if using older Node versions
import geminiChatRouter from './routes/geminiChat.js';
import healthRoutes from './routes/health.js';
import doctorsRouter from './routes/therapists.js';
import resourcesRouterModule from './routes/resources.js';
import therapyTrackerRouter from './routes/therapyTracker.js';
import externalResourcesRouter from './routes/externalResources.js';
import schedulesRouter from './routes/schedules.js';
import checkinsRouter from './routes/checkins.js';
import goalsRouter from './routes/goals.js';
import currentFocusRouter from './routes/currentFocus.js';
import authRouter from './auth/index.js';
import Therapist from './models/Therapist.js';
// Line: After other imports like express, mongoose, cors, etc.
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

require('dotenv').config();

dotenv.config();

// ES modules don't support __dirname directly, so use this workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve frontend build from dist
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Support React Router for all frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});


// Improved CORS config for multiple production URLs
const prodOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = [
  ...prodOrigins,
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static files
app.use('/resources', express.static(path.join(process.cwd(), 'resources')));

// API routes
app.use('/api/gemini-chat', geminiChatRouter);
app.use('/api/health', healthRoutes);
app.use('/api/doctors', doctorsRouter);
app.use('/api/resources', resourcesRouterModule.default || resourcesRouterModule);
app.use('/api/therapy-tracker', therapyTrackerRouter);
app.use('/api/external-resources', externalResourcesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/current-focus', currentFocusRouter);
app.use('/api/auth', authRouter);

app.get('/api/external', async (req, res) => {
  res.json({ message: 'External API integration placeholder' });
});

// Line: Replace your current /api/resources/upload block (~line 120–140)
app.post('/api/resources/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        file.stream.pipe(stream);
      });

    const result = await streamUpload();

    const Resource = (await import('./models/Resource.js')).default;
    const resource = new Resource({
      ...req.body,
      url: result.secure_url
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Keep Render.com or other services awake
setInterval(async () => {
  try {
    await fetch(`${process.env.BASE_URL}/api/doctors/approve-pending`, { method: 'POST' });
  } catch (err) {
    console.log('Heartbeat failed silently:', err.message);
  }
}, 10 * 60 * 1000);

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('MONGO_URL is not defined in .env');
  
}
console.log('Connecting to MongoDB at:', MONGO_URL);

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });


mongoose.connection.on('error', err => console.error('MongoDB error:', err.message));
mongoose.connection.on('disconnected', () => console.error('MongoDB disconnected'));

mongoose.connection.on('connected', async () => {
  console.log('MongoDB connected (seed check)');
  const count = await Therapist.countDocuments();
  if (count === 0) {
    await Therapist.create([
      {
        name: 'Dr. Winston',
        specialty: 'Cognitive Behavioral Therapy',
        status: 'approved',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face',
        booked: false
      },
      {
        name: 'Dr. Sandra',
        specialty: 'Mindfulness',
        status: 'approved',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        booked: false
      }
    ]);
    console.log('Seeded default therapists');
  }
});

// External API keys (if needed)
export const EXTERNAL_API_KEYS = {
  SONGS_API_KEY: process.env.SONGS_API_KEY || 'your-default-key',
};
app.get('/health', (req, res) => {
  res.status(200).send('Backend is up and running!');
});
