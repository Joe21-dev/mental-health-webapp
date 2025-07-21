import express from 'express';
import Resource from '../models/Resource.js';
import uploadRouter from '../uploadFile.js';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

const router = express.Router(); // ✅ moved up here

// Use upload and file streaming endpoints
router.use('/', uploadRouter);

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new resource
router.post('/', async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a resource
router.put('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    // Remove file from GridFS if url is /api/resources/file/:id
    if (resource.url && resource.url.includes('/api/resources/file/')) {
      const fileId = resource.url.split('/api/resources/file/')[1];
      const conn = mongoose.connection;
      const gridfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
      await gridfsBucket.delete(new mongoose.Types.ObjectId(fileId));
    }

    res.json({ message: 'Resource and file deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filter resources by type
router.get('/filter/:type', async (req, res) => {
  try {
    const resources = await Resource.find({ type: req.params.type });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search resources by title
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const resources = await Resource.find({ title: { $regex: q, $options: 'i' } });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
