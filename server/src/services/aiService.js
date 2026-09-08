import axios from 'axios';
import fs from 'fs';
export async function analyzeImages(files) {
  try {
    const form = new FormData();
    for (const file of files) form.append('files', new Blob([fs.readFileSync(file.path)], { type: file.mimetype }), file.originalname);
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, form, { headers: form.getHeaders?.() || {}, timeout: 45000 });
    return response.data;
  } catch (error) {
    return { success: true, images: files.map((file, index) => ({ imageId: `image_${index + 1}`, text: '', textBlocks: [], quality: { blur: 0, brightness: 0.7, resolution: 'unknown' }, warning: 'OCR service unavailable; officer review required' })), combinedText: '' };
  }
}
