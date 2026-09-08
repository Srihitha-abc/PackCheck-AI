import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, brand: String, category: String, manufacturer: String,
  normalizedKey: { type: String, index: true }, images: [{ url: String, type: String }]
}, { timestamps: true });
export default mongoose.model('Product', productSchema);
