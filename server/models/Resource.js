import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  title: { type: String, required: true },
  artist: String,         // For songs
  duration: String,       // For songs, podcasts, videos
  host: String,           // For podcasts
  typeDetail: String,     // For podcasts (audio/video)
  author: String,         // For ebooks
  speaker: String,        // For videos
  url: { type: String },  // Path or URL to resource file
  pageCount: Number,      // For ebooks
  createdAt: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
