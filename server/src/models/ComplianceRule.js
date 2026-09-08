import mongoose from 'mongoose';

const complianceRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true }, title: String, description: String,
  legalReference: String, applicableCategory: { type: String, default: 'ALL' }, declaration: String,
  required: Boolean, validationType: { type: String, enum: ['presence', 'format', 'completeness', 'readability'] },
  expectedPattern: String, severity: { type: String, enum: ['minor', 'major', 'critical'] },
  active: { type: Boolean, default: true }, version: { type: String, default: '1.0' }, effectiveDate: Date
}, { timestamps: true });

export default mongoose.model('ComplianceRule', complianceRuleSchema);
