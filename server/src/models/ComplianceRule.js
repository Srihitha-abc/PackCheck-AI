import mongoose from 'mongoose';

const complianceRuleSchema = new mongoose.Schema({
  // Core identification
  ruleId: { type: String, required: true, unique: true },
  title: String,
  description: String,

  // Legal reference and source
  legalReference: String,
  legalSource: String,
  sourceDocument: String,
  officialSourceName: String,
  officialSourceUrl: String,
  lastVerifiedDate: Date,

  // Categorization
  category: { 
    type: String, 
    enum: ['MANDATORY_DECLARATION', 'IMPORTED_PRODUCT', 'PRICE_DECLARATION', 'QUANTITY_DECLARATION', 
           'DATE_DECLARATION', 'CONSUMER_INFORMATION', 'PRODUCT_IDENTIFICATION', 'DIMENSION_DECLARATION',
           'READABILITY', 'FONT_SCREENING', 'PLACEMENT_AND_DISPLAY', 'E_COMMERCE', 'CATEGORY_SPECIFIC'],
    default: 'MANDATORY_DECLARATION'
  },
  subCategory: String,

  // Declaration and validation
  declaration: String,
  required: Boolean,
  validationType: { 
    type: String, 
    enum: ['PRESENCE', 'FORMAT', 'COMPLETENESS', 'PATTERN', 'VALUE', 'UNIT', 'CONFLICT', 
           'READABILITY', 'FONT_SCREENING', 'PLACEMENT', 'MANUAL_REVIEW', 'CATEGORY_CONDITION', 'IMPORT_CONDITION'],
    default: 'PRESENCE'
  },
  validationMethod: String,
  expectedPattern: String,
  expectedKeywords: [String],
  allowedUnits: [String],

  // Applicability
  applicableCategory: { type: String, default: 'ALL' },
  applicabilityConditions: mongoose.Schema.Types.Mixed,

  // Severity and automation
  severity: { type: String, enum: ['minor', 'major', 'critical'], default: 'minor' },
  automationLevel: { 
    type: String, 
    enum: ['FULLY_AUTOMATED', 'SEMI_AUTOMATED', 'MANUAL_REVIEW', 'AI_ASSISTED'],
    default: 'FULLY_AUTOMATED'
  },
  officerReviewRequired: { type: Boolean, default: false },

  // Versioning and amendments
  version: { type: String, default: '1.0' },
  amendmentReference: String,
  effectiveDate: Date,
  expiryDate: Date,

  // Status
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ComplianceRule', complianceRuleSchema);
