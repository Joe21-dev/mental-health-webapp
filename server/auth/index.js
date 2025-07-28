// Express router for signup/login
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
// import connectDB from './mongo.js';
import User from './user.model.js';

const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

authRouter.use(cors());
authRouter.use(express.json());

// Signup
authRouter.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }, message: 'Signup successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required.' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }, message: 'Login successful!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default authRouter;
