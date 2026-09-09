import ComplianceRule from '../models/ComplianceRule.js';

/**
 * Determine which rules are applicable to a specific product based on its metadata and attributes.
 * This prevents generating violations for rules that don't apply to the product.
 */
export async function getApplicableRules(productMetadata = {}) {
  const allActiveRules = await ComplianceRule.find({ active: true }).lean();

  const applicableRules = allActiveRules.filter(rule => {
    // If no applicability conditions, rule applies to all products
    if (!rule.applicabilityConditions || Object.keys(rule.applicabilityConditions).length === 0) {
      return true;
    }

    const conditions = rule.applicabilityConditions;

    // Check isImported condition
    if (conditions.hasOwnProperty('isImported')) {
      if (conditions.isImported === true && productMetadata.isImported !== true) {
        return false; // Rule only applies to imported products
      }
      if (conditions.isImported === false && productMetadata.isImported === true) {
        return false; // Rule only applies to domestic products
      }
    }

    // Check product category condition
    if (conditions.applicableCategories && Array.isArray(conditions.applicableCategories)) {
      if (!conditions.applicableCategories.includes(productMetadata.category)) {
        return false;
      }
    }

    // Check if dimensions are relevant
    if (conditions.dimensionsRelevant === true && productMetadata.dimensionsRelevant !== true) {
      return false;
    }

    // Check if best before is applicable
    if (conditions.bestBeforeApplicable === true && productMetadata.bestBeforeApplicable !== true) {
      return false;
    }

    // Check if unit sale price is applicable
    if (conditions.unitSalePriceApplicable === true && productMetadata.unitSalePriceApplicable !== true) {
      return false;
    }

    // All conditions satisfied
    return true;
  });

  return applicableRules;
}

/**
 * Get applicable rules for evaluation with caching support
 */
export async function getApplicableRulesForEvaluation(productMetadata = {}) {
  return await getApplicableRules(productMetadata);
}

/**
 * Check if a rule is applicable to a product
 */
export function isRuleApplicable(rule, productMetadata = {}) {
  if (!rule.applicabilityConditions || Object.keys(rule.applicabilityConditions).length === 0) {
    return true;
  }

  const conditions = rule.applicabilityConditions;

  if (conditions.hasOwnProperty('isImported')) {
    if (conditions.isImported === true && productMetadata.isImported !== true) return false;
    if (conditions.isImported === false && productMetadata.isImported === true) return false;
  }

  if (conditions.applicableCategories && Array.isArray(conditions.applicableCategories)) {
    if (!conditions.applicableCategories.includes(productMetadata.category)) return false;
  }

  if (conditions.dimensionsRelevant === true && productMetadata.dimensionsRelevant !== true) return false;
  if (conditions.bestBeforeApplicable === true && productMetadata.bestBeforeApplicable !== true) return false;
  if (conditions.unitSalePriceApplicable === true && productMetadata.unitSalePriceApplicable !== true) return false;

  return true;
}
