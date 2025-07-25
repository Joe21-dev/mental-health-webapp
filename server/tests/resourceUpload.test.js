import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server/index.js'; // Adjust path if needed
import fs from 'fs';
import path from 'path';

describe('Resource Upload API', () => {
  it('should upload a file to Cloudinary and save metadata to MongoDB', async () => {
    const testFilePath = path.join(__dirname, '../resources/season.mp3');
    const res = await request(app)
      .post('/api/resources/upload')
      .attach('file', testFilePath)
      .field('title', 'Test Song');
    expect(res.statusCode).toBe(201);
    expect(res.body.url || (res.body.resource && res.body.resource.url)).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(res.body.title || (res.body.resource && res.body.resource.title)).toBe('Test Song');
  });

  afterAll(() => mongoose.disconnect());
});
