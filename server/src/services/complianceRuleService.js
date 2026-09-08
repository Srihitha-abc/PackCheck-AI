import ComplianceRule from '../models/ComplianceRule.js';

const deductions = { minor: 5, major: 15, critical: 35 };
export async function evaluateCompliance(declarations, combinedText, imageQuality = {}) {
  const rules = await ComplianceRule.find({ active: true }).sort({ declaration: 1 }).lean();
  const map = Object.fromEntries(declarations.map(item => [item.key.toLowerCase(), item]));
  const violations = [];
  for (const rule of rules) {
    const declaration = map[rule.declaration.toLowerCase()];
    if (rule.validationType === 'presence' && rule.required && !declaration?.value) violations.push({ violationId: `V-${Date.now()}-${rule.ruleId}`, ruleId: rule.ruleId, title: rule.title, description: rule.description || `${rule.declaration} was not detected`, declaration: rule.declaration, expectedRequirement: 'Required declaration must be present', severity: rule.severity, confidence: 0.88 });
    if (rule.validationType === 'format' && declaration?.value && rule.expectedPattern && !new RegExp(rule.expectedPattern, 'i').test(declaration.value)) violations.push({ violationId: `V-${Date.now()}-${rule.ruleId}`, ruleId: rule.ruleId, title: rule.title, description: 'Declaration was detected but its format needs review', declaration: rule.declaration, detectedValue: declaration.value, expectedRequirement: rule.expectedPattern, severity: rule.severity, confidence: declaration.confidence });
  }
  const mrpMatches = [...combinedText.matchAll(/(?:mrp|maximum retail price)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)/gi)].map(match => match[1]);
  if (new Set(mrpMatches).size > 1) violations.push({ violationId: `V-${Date.now()}-CONFLICT`, ruleId: 'CONFLICT_MRP', title: 'Conflicting MRP declarations', description: `Multiple MRP values detected: ${mrpMatches.join(', ')}`, declaration: 'MRP', detectedValue: mrpMatches.join(', '), expectedRequirement: 'One consistent MRP declaration', severity: 'major', confidence: 0.94, status: 'Requires Officer Review' });
  if ((imageQuality.blur ?? 0) > 0.7) violations.push({ violationId: `V-${Date.now()}-READABILITY`, ruleId: 'READABILITY_SCREEN', title: 'Potentially unreadable label', description: 'Image quality may affect declaration readability', declaration: 'Readability', expectedRequirement: 'Readable declaration text', severity: 'major', confidence: 0.78 });
  const score = Math.max(0, 100 - violations.reduce((sum, item) => sum + deductions[item.severity], 0));
  const status = violations.some(item => item.severity === 'critical') ? 'NON-COMPLIANT' : violations.some(item => item.status === 'Requires Officer Review') ? 'REQUIRES REVIEW' : violations.length ? 'PARTIALLY COMPLIANT' : 'COMPLIANT';
  return { rules, violations, score, status };
}
