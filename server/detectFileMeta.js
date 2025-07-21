import ffmpeg from 'fluent-ffmpeg';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';

ffmpeg.setFfprobePath(ffprobeStatic.path);

export async function getAudioVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      if (metadata && metadata.format && metadata.format.duration) {
        // Return duration as mm:ss
        const totalSec = Math.round(metadata.format.duration);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        resolve(`${min}:${sec.toString().padStart(2, '0')}`);
      } else {
        resolve('');
      }
    });
  });
}

export async function getPdfPageCount(filePath) {
  // Only import pdf-parse when needed to avoid test file errors
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(fs.readFileSync(filePath));
  return data.numpages || 0;
}
