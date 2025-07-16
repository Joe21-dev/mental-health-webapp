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

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

// Example modular route
import healthRoutes from './routes/health.js';
app.use('/api/health', healthRoutes);

// Placeholder for external API integration
app.get('/api/external', async (req, res) => {
  // Example: fetch from an external API
  // const response = await axios.get('https://api.example.com/data');
  res.json({ message: 'External API integration placeholder' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
