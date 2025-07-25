import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import Resource from './models/Resource.js';
import fs from 'fs';
import path from 'path';
import { getAudioVideoDuration, getPdfPageCount } from './detectFileMeta.js';
import cloudinary from './cloudinaryConfig.js';
import { v2 as cloudinaryV2 } from 'cloudinary';
dotenv.config(); // Load .env variables

const router = express.Router();
const MONGO_URL = process.env.MONGO_URL;
const conn = mongoose.createConnection(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gridfsBucket;
conn.once('open', () => {
  gridfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

function detectTypeFromExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.mp3', '.wav', '.aac', '.ogg'].includes(ext)) return 'song';
  if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) return 'video';
  if (['.pdf'].includes(ext)) return 'ebook';
  if (['.m4a', '.flac', '.aac', '.ogg'].includes(ext)) return 'podcast';
  if (ext) return ext.replace('.', ''); // Use extension as type for unknowns
  return 'unknown';
}

// Upload endpoint (Cloudinary)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!title) return res.status(400).json({ error: 'Name is required.' });
    // Prevent duplicate by name
    const existing = await Resource.findOne({ title });
    if (existing) return res.status(400).json({ error: 'A file with this name already exists.' });
    // Detect type
    const type = detectTypeFromExt(file.originalname);
    let duration = '', pageCount = 0;
    // Upload to Cloudinary
    const uploadResult = await cloudinaryV2.uploader.upload_stream({
      resource_type: type === 'video' ? 'video' : (type === 'ebook' ? 'raw' : 'auto'),
      folder: 'healthapp_resources',
      public_id: title.replace(/\s+/g, '_'),
    }, async (error, result) => {
      if (error || !result) {
        return res.status(500).json({ error: 'Cloudinary upload failed', details: error });
      }
      // Save resource with Cloudinary URL
      const resource = new Resource({
        type,
        title,
        duration,
        url: result.secure_url,
        ...(type === 'ebook' ? { pageCount } : {})
      });
      try {
        await resource.save();
        res.status(201).json({
          message: 'File uploaded and resource saved successfully.',
          resource
        });
      } catch (err) {
        res.status(400).json({
          error: 'Resource validation failed.',
          details: err.errors || err.message,
          resourceAttempted: resource
        });
      }
    });
    // Pipe file buffer to Cloudinary
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    bufferStream.pipe(uploadResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve by name
router.get('/byname/:title', async (req, res) => {
  try {
    const resource = await Resource.findOne({ title: req.params.title });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stream file endpoint
router.get('/file/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gridfsBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) return res.status(404).json({ error: 'File not found' });
    res.set('Content-Type', files[0].contentType);
    gridfsBucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;