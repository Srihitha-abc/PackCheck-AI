import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema({
  inspectionId: { type: String, unique: true }, product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, productInfo: Object,
  images: [{ originalName: String, filename: String, path: String, imageType: String, quality: Object, ocr: Object }],
  declarations: [{ key: String, label: String, value: String, status: String, confidence: Number, evidence: Object }],
  violations: [{ violationId: String, ruleId: String, title: String, description: String, declaration: String, detectedValue: String, expectedRequirement: String, severity: String, confidence: Number, evidenceImage: String, evidenceCoordinates: Object, status: { type: String, default: 'Requires Officer Review' }, officerComments: String }],
  score: Number, status: String, ruleVersion: String, ruleSetSnapshot: [Object], notes: String,
  reviewActions: [{ actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, action: String, comment: String, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });
export default mongoose.model('Inspection', inspectionSchema);
