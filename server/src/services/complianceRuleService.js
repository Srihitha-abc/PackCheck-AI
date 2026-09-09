import ComplianceRule from '../models/ComplianceRule.js';
import { getApplicableRules, isRuleApplicable } from './ruleApplicabilityService.js';

const deductions = { minor: 5, major: 15, critical: 35 };

/**
 * Evaluate compliance of declarations against applicable rules
 * 
 * @param {Array} declarations - Extracted declarations from OCR
 * @param {String} combinedText - Full OCR text from all images
 * @param {Object} imageQuality - Image quality metrics (blur, contrast, etc.)
 * @param {Object} productMetadata - Product metadata (category, isImported, etc.)
 * @returns {Object} - { rules, violations, score, status }
 */
export async function evaluateCompliance(declarations, combinedText, imageQuality = {}, productMetadata = {}) {
  // Get only applicable rules for this product
  const applicableRules = await getApplicableRules(productMetadata);
  
  // Create declaration map for quick lookup
  const map = Object.fromEntries(declarations.map(item => [item.key.toLowerCase(), item]));
  const violations = [];

  // Evaluate each applicable rule
  for (const rule of applicableRules) {
    const declaration = map[rule.declaration?.toLowerCase()];

    // Handle different validation types
    switch (rule.validationType) {
      case 'PRESENCE':
      case 'presence':
        if (rule.required && !declaration?.value) {
          violations.push({
            violationId: `V-${Date.now()}-${rule.ruleId}`,
            ruleId: rule.ruleId,
            title: rule.title,
            description: rule.description || `${rule.declaration} was not detected`,
            declaration: rule.declaration,
            expectedRequirement: 'Required declaration must be present',
            severity: rule.severity,
            confidence: 0.88,
            automationLevel: rule.automationLevel,
            officerReviewRequired: rule.officerReviewRequired,
            status: rule.officerReviewRequired ? 'Requires Officer Review' : 'Potential Violation'
          });
        }
        break;

      case 'FORMAT':
      case 'format':
        if (declaration?.value && rule.expectedPattern) {
          try {
            const pattern = new RegExp(rule.expectedPattern, 'i');
            if (!pattern.test(declaration.value)) {
              violations.push({
                violationId: `V-${Date.now()}-${rule.ruleId}`,
                ruleId: rule.ruleId,
                title: rule.title,
                description: rule.description || 'Declaration was detected but its format needs review',
                declaration: rule.declaration,
                detectedValue: declaration.value,
                expectedRequirement: `Format should match: ${rule.expectedPattern}`,
                severity: rule.severity,
                confidence: declaration.confidence,
                automationLevel: rule.automationLevel,
                officerReviewRequired: rule.officerReviewRequired,
                status: rule.officerReviewRequired ? 'Requires Officer Review' : 'Potential Violation'
              });
            }
          } catch (e) {
            console.error(`Invalid regex pattern for rule ${rule.ruleId}:`, e.message);
          }
        }
        break;

      case 'UNIT':
        if (declaration?.value && rule.allowedUnits && rule.allowedUnits.length > 0) {
          const hasValidUnit = rule.allowedUnits.some(unit => 
            new RegExp(unit, 'i').test(declaration.value)
          );
          if (!hasValidUnit) {
            violations.push({
              violationId: `V-${Date.now()}-${rule.ruleId}`,
              ruleId: rule.ruleId,
              title: rule.title,
              description: rule.description || 'Quantity unit is not standard',
              declaration: rule.declaration,
              detectedValue: declaration.value,
              expectedRequirement: `Allowed units: ${rule.allowedUnits.join(', ')}`,
              severity: rule.severity,
              confidence: declaration.confidence,
              automationLevel: rule.automationLevel,
              officerReviewRequired: rule.officerReviewRequired,
              status: rule.automationLevel === 'MANUAL_REVIEW' ? 'Requires Officer Review' : 'Potential Violation'
            });
          }
        }
        break;

      case 'READABILITY':
        if ((imageQuality.blur ?? 0) > 0.7 || (imageQuality.contrast ?? 0) < 0.3) {
          violations.push({
            violationId: `V-${Date.now()}-${rule.ruleId}`,
            ruleId: rule.ruleId,
            title: rule.title,
            description: rule.description || 'Image quality may affect declaration readability',
            declaration: rule.declaration,
            expectedRequirement: 'Clear, readable declaration text',
            severity: rule.severity,
            confidence: 0.78,
            automationLevel: rule.automationLevel,
            officerReviewRequired: true,
            status: 'Requires Officer Review'
          });
        }
        break;

      case 'FONT_SCREENING':
        // Font size screening - requires manual measurement or calibration
        violations.push({
          violationId: `V-${Date.now()}-${rule.ruleId}`,
          ruleId: rule.ruleId,
          title: rule.title,
          description: rule.description || 'Font size requires verification through physical measurement',
          declaration: rule.declaration,
          expectedRequirement: 'Font size must meet legal minimum (typically 1mm)',
          severity: rule.severity,
          confidence: 0.65,
          automationLevel: rule.automationLevel,
          officerReviewRequired: true,
          status: 'Requires Officer Review'
        });
        break;

      case 'MANUAL_REVIEW':
        // Flag for manual review without automated checks
        violations.push({
          violationId: `V-${Date.now()}-${rule.ruleId}`,
          ruleId: rule.ruleId,
          title: rule.title,
          description: rule.description || 'This declaration requires manual officer review',
          declaration: rule.declaration,
          expectedRequirement: 'Requires officer verification',
          severity: rule.severity,
          confidence: 0.5,
          automationLevel: rule.automationLevel,
          officerReviewRequired: true,
          status: 'Requires Officer Review'
        });
        break;
    }
  }

  // Additional conflict detection for MRP
  const mrpMatches = [...combinedText.matchAll(/(?:mrp|maximum retail price)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)/gi)].map(match => match[1]);
  if (new Set(mrpMatches).size > 1) {
    const conflictRule = applicableRules.find(r => r.ruleId === 'LMPC_CONFLICT_MRP_021');
    if (!conflictRule || isRuleApplicable(conflictRule, productMetadata)) {
      violations.push({
        violationId: `V-${Date.now()}-CONFLICT-MRP`,
        ruleId: 'LMPC_CONFLICT_MRP_021',
        title: 'Conflicting MRP declarations',
        description: `Multiple MRP values detected: ${mrpMatches.join(', ')}`,
        declaration: 'MRP',
        detectedValue: mrpMatches.join(', '),
        expectedRequirement: 'One consistent MRP declaration',
        severity: 'major',
        confidence: 0.94,
        automationLevel: 'FULLY_AUTOMATED',
        officerReviewRequired: true,
        status: 'Requires Officer Review'
      });
    }
  }

  // Calculate compliance score and status
  const score = Math.max(0, 100 - violations.reduce((sum, item) => sum + deductions[item.severity], 0));
  const criticalViolations = violations.filter(v => v.severity === 'critical' && v.status !== 'Not Applicable');
  const reviewViolations = violations.filter(v => v.status === 'Requires Officer Review');

  let status = 'COMPLIANT';
  if (criticalViolations.length > 0) {
    status = 'NON-COMPLIANT';
  } else if (reviewViolations.length > 0) {
    status = 'REQUIRES REVIEW';
  } else if (violations.length > 0) {
    status = 'PARTIALLY COMPLIANT';
  }

  return {
    rules: applicableRules,
    violations,
    score,
    status,
    applicableRuleCount: applicableRules.length,
    totalRuleCount: await ComplianceRule.countDocuments({ active: true })
  };
}
