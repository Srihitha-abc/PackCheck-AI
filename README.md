# PackCheck AI - Legal Metrology Compliance Screening System

AI-Powered decision-support system for package label compliance screening based on Legal Metrology (Packaged Commodities) Rules, 2011.

## Overview

PackCheck AI is a Smart India Hackathon project that helps legal metrology officers conduct compliance screening of product package labels. The system uses AI/OCR for declaration extraction and a comprehensive rule engine to perform compliance validation.

**Important**: This system provides AI-assisted preliminary screening results. Final legal interpretation and enforcement decisions remain with authorized officers.

---

## Legal Metrology Rule Engine

### Architecture

The rule engine is built on a comprehensive, versioned repository of compliance rules stored in MongoDB. Each rule includes:

- **Rule Identification**: Internal ID (LMPC_*), official legal reference
- **Validation Configuration**: Type, method, expected patterns, allowed units
- **Applicability Conditions**: Which products the rule applies to
- **Automation Levels**: How the rule is validated (fully automated, semi-automated, manual review)
- **Source Traceability**: Official source, legal reference, verification date
- **Versioning**: Version number, effective date, amendments

### Rule Categories

The system supports 13 categories of compliance rules:

1. **MANDATORY_DECLARATION** - Core declarations required on all packages
2. **IMPORTED_PRODUCT** - Rules specific to imported products
3. **PRICE_DECLARATION** - MRP, unit sale price, pricing format
4. **QUANTITY_DECLARATION** - Net quantity, standard units
5. **DATE_DECLARATION** - Manufacturing date, packing date, best before date
6. **CONSUMER_INFORMATION** - Consumer care contact details, phone, email
7. **PRODUCT_IDENTIFICATION** - Commodity name, product identity
8. **DIMENSION_DECLARATION** - Product dimensions where applicable
9. **READABILITY** - OCR confidence, image clarity, text visibility
10. **FONT_SCREENING** - Text size verification (requires officer review)
11. **PLACEMENT_AND_DISPLAY** - Declaration visibility and location
12. **E_COMMERCE** - E-commerce listing requirements
13. **CATEGORY_SPECIFIC** - Rules for specific product categories

### Validation Types

Each rule supports one of these validation types:

- **PRESENCE** - Declaration must be present
- **FORMAT** - Declaration must match pattern
- **UNIT** - Declaration must use allowed units
- **COMPLETENESS** - Declaration must contain all required elements
- **VALUE** - Declaration value validation
- **CONFLICT** - Multiple conflicting values detection
- **READABILITY** - Image quality analysis
- **FONT_SCREENING** - Text size estimation (AI-assisted)
- **PLACEMENT** - Declaration location requirements
- **MANUAL_REVIEW** - Requires officer verification
- **CATEGORY_CONDITION** - Conditional rules based on product category
- **IMPORT_CONDITION** - Rules that apply only to imported products

### Automation Levels

Rules are classified by how they are validated:

- **FULLY_AUTOMATED** - Complete automated validation without officer review needed
- **SEMI_AUTOMATED** - Automated detection with recommended officer verification
- **AI_ASSISTED** - AI provides assistance, officer makes final determination
- **MANUAL_REVIEW** - Officer must manually verify compliance

### Rule Applicability

A critical feature: **rules only apply to relevant products**. 

For example:
- Importer details are only required for imported products
- Country of origin applies only when `isImported = true`
- Best before date applies only to perishable commodities
- Dimension rules apply only when `dimensionsRelevant = true`

The system **does not generate violations** for rules that don't apply to a product.

### Current Rule Repository

The system includes **25+ comprehensive rules** covering:

**Mandatory Declarations** (LMPC_MFG_NAME_001 through LMPC_DATE_MFG_PACK_011):
- Manufacturer/packer name and address
- Commodity name
- Net quantity and units
- Date of manufacture/packing
- Best before date (where applicable)

**Price Declarations** (LMPC_MRP_DECLARATION_009 through LMPC_UNIT_SALE_PRICE_016):
- MRP presence and format validation
- Unit sale price (where applicable)

**Imported Products** (LMPC_IMPORTER_DETAILS_003 through LMPC_COUNTRY_ORIGIN_004):
- Importer details
- Country of origin

**Consumer Information** (LMPC_CONSUMER_CARE_013 through LMPC_CONTACT_EMAIL_015):
- Consumer care contact details
- Phone number format validation
- Email format validation

**Screening & Display** (LMPC_READABILITY_018 through LMPC_PLACEMENT_020):
- Text readability assessment
- Font size screening (AI-assisted)
- Declaration placement

**Conflict Detection** (LMPC_CONFLICT_MRP_021 through LMPC_CONFLICT_QTY_022):
- Multiple MRP detection
- Quantity value conflicts

**Category-Specific** (LMPC_FOOD_ALLERGEN_023 through LMPC_COSMETIC_INGREDIENTS_025):
- Food allergen declarations
- Apparel size declarations
- Cosmetic composition requirements

### Legal References

All rules include official legal references from:

- **Primary Source**: Legal Metrology (Packaged Commodities) Rules, 2011
- **Department of Consumer Affairs**: Government of India
- **Official URL**: https://consumeraffairs.gov.in/pages/legal-metrology-act

Rules also include:
- Amendment references for modified rules
- Effective date information
- Last verification date
- Source document titles

---

## Rule Management

### Viewing Rules

1. Navigate to **Compliance Rules** page
2. View rule statistics:
   - Total rules in database
   - Active rules count
   - Rules requiring officer review
   - Historical/inactive rules

3. **Filter Rules** by:
   - Category (13 types)
   - Severity (minor, major, critical)
   - Automation level
   - Status (active/inactive)

4. **Search Rules** by:
   - Rule title
   - Rule ID (LMPC_*)
   - Declaration name
   - Legal reference

5. **View Rule Details**:
   - Click any rule to see complete information
   - View legal reference and source
   - See applicability conditions
   - Check automation level
   - Review officer review requirements
   - Verify version and effective date

### Adding/Editing Rules (Admin Only)

Rules can be managed programmatically or through the database:

#### Via Seed Script

Edit `server/src/seed/complianceRulesSeed.js` to add new rules:

```javascript
{
  ruleId: 'LMPC_NEW_RULE_XXX',
  title: 'Rule Title',
  description: 'What this rule checks',
  category: 'MANDATORY_DECLARATION',
  subCategory: 'Category Name',
  declaration: 'declarationKey',
  required: true,
  validationType: 'PRESENCE',
  severity: 'critical',
  automationLevel: 'FULLY_AUTOMATED',
  legalReference: 'Official rule reference',
  legalSource: 'Department of Consumer Affairs',
  sourceDocument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
  officialSourceName: 'Department of Consumer Affairs',
  officialSourceUrl: 'https://consumeraffairs.gov.in/...',
  applicabilityConditions: { /* conditions */ },
  version: '2026.1',
  effectiveDate: new Date('2011-07-01'),
  active: true
}
```

#### Via API

```bash
# Get all rules
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/rules

# Create new rule (admin only)
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ rule data }' \
  http://localhost:5000/api/rules

# Update rule (admin only)
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ rule data }' \
  http://localhost:5000/api/rules/:ruleId

# Deactivate rule (admin only)
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/rules/:ruleId
```

### Seeding Rules

#### Initial Seed

Run the comprehensive seed to populate all rules:

```bash
cd server
npm run seed
```

This will:
- Create demo users (admin@packcheck.gov.in, inspector@packcheck.gov.in)
- Seed 25+ compliance rules with legal references
- Create a demo inspection for testing
- Preserve any existing rules in database

#### Safe Upsert Logic

The seed process uses MongoDB upsert logic to safely add/update rules:

```javascript
await ComplianceRule.updateOne(
  { ruleId: rule.ruleId },
  { $set: rule },
  { upsert: true }
)
```

This ensures:
- Existing rules are not deleted
- New rules are added
- Rules are updated based on ruleId (not duplication)
- Version information is preserved

---

## Compliance Validation Engine

### How Rules Are Applied

During inspection analysis:

1. **Product Metadata Extraction** - Determine product category, import status, etc.
2. **Applicability Check** - Load only applicable rules for this product
3. **Declaration Extraction** - AI extracts declarations from package label
4. **Validation** - Each applicable rule is checked against declarations
5. **Violation Scoring** - Violations are scored and reported
6. **Status Determination** - Overall compliance status is calculated

### Violation Status

Violations are classified as:

- **COMPLIANT** - No violations detected
- **PARTIALLY_COMPLIANT** - Minor violations found
- **REQUIRES REVIEW** - Needs officer verification
- **NON-COMPLIANT** - Critical violations found
- **NOT_APPLICABLE** - Rule doesn't apply to this product (not reported as violation)

### Example: Imported Product Inspection

```javascript
// Product metadata
{
  category: 'Food',
  isImported: true,
  dimensionsRelevant: false
}

// Applicable rules automatically include:
// ✓ LMPC_IMPORTER_DETAILS_003
// ✓ LMPC_COUNTRY_ORIGIN_004
// ✓ LMPC_ECOMMERCE_DECLARATION_020
// ✗ LMPC_DIMENSIONS_017 (dimensionsRelevant = false)

// Result:
// - Missing importer details → VIOLATION (severity: critical)
// - Missing country of origin → VIOLATION (severity: major)
// - Missing dimensions → NOT GENERATED (rule not applicable)
```

---

## Important Safety Requirements

### What NOT to Assume

❌ Do not generate violations for non-applicable rules  
❌ Do not assume every product needs all declarations  
❌ Do not label AI estimates as confirmed violations  
❌ Do not override applicability conditions  

### What to DO

✅ Use applicability conditions for every product  
✅ Check isImported, category, dimensionsRelevant, etc.  
✅ Flag uncertain results as REQUIRES_OFFICER_REVIEW  
✅ Preserve rule version snapshots with inspections  
✅ Use official legal references only  
✅ Mark officer review required for complex rules  
✅ Document rule source and verification date  

### Disclaimer

**This automated validation is a compliance screening result. Final legal interpretation and enforcement decision require authorized officer review.**

---

## Database Models

### ComplianceRule Schema

```javascript
{
  // Core identification
  ruleId: String,              // Internal ID: LMPC_*_XXX
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
  category: Enum,              // 13 category types
  subCategory: String,
  
  // Declaration and validation
  declaration: String,
  required: Boolean,
  validationType: Enum,        // PRESENCE, FORMAT, UNIT, etc.
  validationMethod: String,
  expectedPattern: String,
  expectedKeywords: [String],
  allowedUnits: [String],
  
  // Applicability
  applicableCategory: String,
  applicabilityConditions: Object,
  
  // Severity and automation
  severity: Enum,              // minor, major, critical
  automationLevel: Enum,       // FULLY_AUTOMATED, etc.
  officerReviewRequired: Boolean,
  
  // Versioning
  version: String,
  amendmentReference: String,
  effectiveDate: Date,
  expiryDate: Date,
  
  // Status
  active: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Inspection with Rule Snapshots

```javascript
{
  inspectionId: String,
  product: ObjectId,
  inspector: ObjectId,
  productInfo: {
    name: String,
    brand: String,
    category: String,
    isImported: Boolean,
    dimensionsRelevant: Boolean,
    // ... other metadata
  },
  
  declarations: Array,         // Extracted declarations
  violations: Array,           // Violations found
  
  score: Number,               // 0-100 compliance score
  status: String,              // COMPLIANT, REQUIRES REVIEW, etc.
  
  ruleVersion: String,         // Version of rules used
  ruleSetSnapshot: [Object],   // Complete rules applied (for reproducibility)
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Project Structure

```
PackCheck AI/
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   ├── ComplianceRule.js    (✅ Updated: Enhanced schema)
│   │   │   ├── Inspection.js        (Stores rule snapshots)
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── complianceRuleService.js    (✅ Updated: New validation logic)
│   │   │   ├── ruleApplicabilityService.js (✅ New: Applicability filtering)
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── rules.js        (Rule CRUD endpoints)
│   │   │   ├── inspections.js  (✅ Updated: Passes productMetadata)
│   │   │   └── ...
│   │   ├── seed/
│   │   │   └── complianceRulesSeed.js (✅ New: 25+ comprehensive rules)
│   │   ├── seed.js             (✅ Updated: Upsert logic)
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Rules.jsx       (✅ New: Enhanced rule management UI)
│   │   ├── App.jsx             (✅ Updated: Imports new Rules component)
│   │   └── ...
│   └── ...
│
├── README.md                   (✅ This file)
└── ...
```

---

## Key Features

### ✅ Comprehensive Rule Repository
- 25+ rules covering all major compliance requirements
- 13 rule categories for organization
- Official legal references included
- Versioning support for amendments

### ✅ Intelligent Rule Applicability
- Rules automatically filtered based on product type
- No violations generated for non-applicable rules
- Supports: imported status, category, dimensions, shelf-life
- Extensible for additional applicability conditions

### ✅ Multiple Automation Levels
- Fully automated rules (no officer review needed)
- Semi-automated rules (AI helps, officer verifies)
- AI-assisted rules (AI provides data, officer decides)
- Manual review rules (complex requirements)

### ✅ Source Traceability
- All rules linked to official legal sources
- Department of Consumer Affairs references
- Last verification dates tracked
- Amendment history support

### ✅ Version Management
- Rule versions tracked with effective dates
- Historical rule snapshots stored with inspections
- Old inspections remain reproducible even after rule changes
- Amendment references maintained

### ✅ Enhanced Rule Management UI
- Rule statistics dashboard
- Multi-filter interface (category, severity, automation, status)
- Full-text search (name, ID, declaration, legal reference)
- Comprehensive rule details modal
- Source and verification information display
- Officer review requirement indicators

---

## Future Enhancements

Potential improvements:

1. **Rule Template System** - Create rules from templates
2. **Bulk Import** - Import rules from CSV/JSON
3. **Rule Conflict Detection** - Warn on overlapping/conflicting rules
4. **Audit Trail** - Track all rule changes
5. **Category-Specific Validation** - Add more category-specific rules
6. **Amendment Management** - Better historical rule tracking
7. **Export Functionality** - Export rules for analysis
8. **A/B Testing** - Test rule variations
9. **Performance Analytics** - Track rule effectiveness
10. **Integration with E-markings** - Digital label compliance

---

## Support & Documentation

For more information:

- **Legal Metrology Act**: https://consumeraffairs.gov.in/pages/legal-metrology-act
- **Packaged Commodities Rules, 2011**: Official Government source
- **AI/OCR Service**: Handles declaration extraction
- **Officer Dashboard**: Compliance review and decision interface

---

## License

Part of Smart India Hackathon (SIH) project.

**Disclaimer**: This system is a decision-support tool. All compliance decisions must be made by authorized legal metrology officers. The system's output is preliminary and requires officer review.

---

**Last Updated**: September 2026  
**Rule Repository Version**: 2026.1  
**System Version**: 1.0
