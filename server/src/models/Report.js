import mongoose from 'mongoose';
const schema = new mongoose.Schema({ inspection: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' }, generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, fileName: String }, { timestamps: true });
export default mongoose.model('Report', schema);
