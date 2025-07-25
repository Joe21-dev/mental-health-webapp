// Usage: node seedResources.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Load .env variables

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error('MONGO_URL not found in .env');
  process.exit(1);
}

const resourceSchema = new mongoose.Schema({
  title: String,
  type: String,
  artist: String,
  author: String,
  speaker: String,
  host: String,
  duration: String,
  url: String,
});
const Resource = mongoose.model('Resource', resourceSchema, 'resources');

async function seed() {
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

  const resources = [
    {
      title: 'Sample Song',
      type: 'song',
      artist: 'Sample Artist',
      duration: '3:45',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3', // public mp3
    },
    {
      title: 'Sample E-book',
      type: 'ebook',
      author: 'Sample Author',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // public PDF
    },
    {
      title: 'Motivational Speech',
      type: 'video',
      speaker: 'Sample Speaker',
      duration: '5:00',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4', // public mp4
    },
    {
      title: 'Sample Podcast',
      type: 'podcast',
      host: 'Sample Host',
      duration: '10:00',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // public mp3
    },
  ];

  await Resource.deleteMany({}); // Clear old resources
  await Resource.insertMany(resources);
  console.log('Seeded resources!');
  mongoose.disconnect();
}

seed();
