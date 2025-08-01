// --- LOCAL DEV: Enable local MongoDB and local file storage for offline testing ---
// If process.env.LOCAL_DEV is set, use local MongoDB and store uploads in /resources folder
// This block is placed after all imports and app initialization to avoid ES module import issues
if (process.env.LOCAL_DEV === 'true') {
  (async () => {
    console.log('LOCAL_DEV mode enabled: Using local MongoDB and local file storage for resources.');

    // Local MongoDB URI fallback
    if (!process.env.MONGO_URL) {
      process.env.MONGO_URL = 'mongodb://127.0.0.1:27017/mental-health-app';
      console.log('Set MONGO_URL to local MongoDB:', process.env.MONGO_URL);
    }

    // Local resource upload endpoint (bypasses Cloudinary)
    const { default: localMulter } = await import('multer');
    const localUpload = localMulter({ dest: path.join(process.cwd(), 'resources') });

    app.post('/api/resources/upload-local', localUpload.single('file'), async (req, res) => {
      try {
        const Resource = (await import('./models/Resource.js')).default;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });
        // Save resource with local file path
        const url = `/resources/${file.filename}`;
        const resource = new Resource({
          ...req.body,
          url
        });
        await resource.save();
        res.status(201).json(resource);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  })();
}
// All imports and dotenv.config at the top
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch';
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
import Therapist from './models/Therapist.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// User model (inline, since auth folder is being deleted)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ES modules don't support __dirname directly, so use this workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Improved CORS config for local and hosted access
const prodOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = Array.from(new Set([
  ...prodOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost',
  'http://127.0.0.1'
]));
console.log('Allowed origins for CORS:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or direct server-to-server)
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
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
app.use('/api/therapists', doctorsRouter); // Alias for therapists
app.use('/api/resources', resourcesRouterModule.default || resourcesRouterModule);
app.use('/api/therapy-tracker', therapyTrackerRouter);
app.use('/api/external-resources', externalResourcesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/current-focus', currentFocusRouter);
// app.use('/api/auth', authRouter); // Removed: authRouter is not defined, auth logic is inline

app.get('/api/external', async (req, res) => {
  res.json({ message: 'External API integration placeholder' });
});

// Resource upload
// Middleware: require JWT and admin
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.post('/api/resources/upload', requireAdmin, upload.single('file'), async (req, res) => {
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

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }, message: 'Signup successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required.' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Get current user info (requires JWT)
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Serve frontend build from dist (after all API routes), only if it exists
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}


// Keep Render.com or other services awake (DISABLED: endpoint does not exist or fails)
// setInterval(async () => {
//   try {
//     await fetch(`${process.env.BASE_URL}/api/doctors/approve-pending`, { method: 'POST' });
//   } catch (err) {
//     console.log('Heartbeat failed silently:', err.message);
//   }
// }, 10 * 60 * 1000);

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
  console.log('MongoDB connected to DB:', mongoose.connection.name);
  const count = await Therapist.countDocuments();
  if (count === 0) {
    await Therapist.create([
      {
        name: 'Winston',
        specialty: 'Cognitive Behavioral Therapy',
        status: 'approved',
        booked: false
      },
      {
        name: 'Sandra',
        specialty: 'Mindfulness',
        status: 'approved',
        booked: false
      }
    ]);
    console.log('Seeded default therapists (no avatar, name only)');
  }
});

// External API keys (if needed)
export const EXTERNAL_API_KEYS = {
  SONGS_API_KEY: process.env.SONGS_API_KEY || 'your-default-key',
};
app.get('/health', (req, res) => {
  res.status(200).send('Backend is up and running!');
});
