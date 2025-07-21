import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import Resource from './models/Resource.js';
import fs from 'fs';
import path from 'path';
import { getAudioVideoDuration, getPdfPageCount } from './detectFileMeta.js';

const router = express.Router();
const mongoURI = 'mongodb://localhost:27017/healthapp';
const conn = mongoose.createConnection(mongoURI, {
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

// Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!title) return res.status(400).json({ error: 'Name is required.' });
    // Prevent duplicate by name
    const existing = await Resource.findOne({ title });
    if (existing) return res.status(400).json({ error: 'A file with this name already exists.' });
    // Save file to temp for analysis
    const tempPath = `./tmp_${Date.now()}_${file.originalname}`;
    fs.writeFileSync(tempPath, file.buffer);
    // Detect type
    const type = detectTypeFromExt(file.originalname);
    let duration = '', pageCount = 0;
    if (type === 'song' || type === 'video' || type === 'podcast') {
      try { duration = await getAudioVideoDuration(tempPath); } catch {}
    }
    if (type === 'ebook') {
      try { pageCount = await getPdfPageCount(tempPath); } catch {}
    }
    // Upload to GridFS from temp file (not from buffer)
    const readStream = fs.createReadStream(tempPath);
    const uploadStream = gridfsBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { title, type },
    });
    readStream.pipe(uploadStream);
    uploadStream.on('finish', async (uploadedFile) => {
      // Ensure type and title are always set and valid
      if (!type || !title) {
        fs.unlinkSync(tempPath);
        return res.status(400).json({ error: 'File type or name is missing.', details: { type, title } });
      }
      const url = `/api/resources/file/${uploadedFile._id}`;
      const safeType = typeof type === 'string' && type.trim() ? type : 'unknown';
      const safeTitle = typeof title === 'string' && title.trim() ? title : 'untitled';
      const resource = new Resource({
        type: safeType,
        title: safeTitle,
        duration: duration || undefined,
        url,
        ...(safeType === 'ebook' ? { pageCount } : {})
      });
      try {
        await resource.save();
        fs.unlinkSync(tempPath);
        res.status(201).json({
          message: 'File uploaded and resource saved successfully.',
          resource
        });
      } catch (err) {
        fs.unlinkSync(tempPath);
        res.status(400).json({
          error: 'Resource validation failed.',
          details: err.errors || err.message,
          resourceAttempted: resource
        });
      }
    });
    uploadStream.on('error', (err) => {
      fs.unlinkSync(tempPath);
      res.status(500).json({ error: 'GridFS upload failed.', details: err.message });
    });
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