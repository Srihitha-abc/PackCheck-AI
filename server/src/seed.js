import 'dotenv/config';
import './config/env.js';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import ComplianceRule from './models/ComplianceRule.js';
import Product from './models/Product.js';
import Inspection from './models/Inspection.js';

await connectDatabase();
await Promise.all([User.deleteMany({}), ComplianceRule.deleteMany({}), Product.deleteMany({}), Inspection.deleteMany({})]);
const [admin, inspector] = await User.create([
  { name: 'System Administrator', email: 'admin@packcheck.gov.in', password: await bcrypt.hash('Admin@123', 12), role: 'ADMIN' },
  { name: 'Demo Inspector', email: 'inspector@packcheck.gov.in', password: await bcrypt.hash('Inspector@123', 12), role: 'INSPECTOR' }
]);
const rules = await ComplianceRule.create([
  { ruleId: 'LMPC_MRP_001', title: 'MRP Declaration', description: 'Maximum Retail Price must be declared.', legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011', declaration: 'mrp', required: true, validationType: 'presence', severity: 'critical', version: '2024.1', effectiveDate: new Date() },
  { ruleId: 'LMPC_QTY_001', title: 'Net Quantity Declaration', description: 'Net quantity must be declared with a unit.', legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011', declaration: 'netQuantity', required: true, validationType: 'presence', severity: 'major', version: '2024.1', effectiveDate: new Date() },
  { ruleId: 'LMPC_MFG_001', title: 'Manufacturer Details', description: 'Manufacturer identification must be declared.', legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011', declaration: 'manufacturer', required: true, validationType: 'presence', severity: 'major', version: '2024.1', effectiveDate: new Date() },
  { ruleId: 'LMPC_CARE_001', title: 'Consumer Care Contact', description: 'Consumer care phone or email must be available.', legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011', declaration: 'phone', required: true, validationType: 'presence', severity: 'major', version: '2024.1', effectiveDate: new Date() },
  { ruleId: 'LMPC_EMAIL_001', title: 'Consumer Care Email Format', description: 'Detected email must use a valid format.', legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011', declaration: 'email', required: false, validationType: 'format', expectedPattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', severity: 'minor', version: '2024.1', effectiveDate: new Date() }
]);
const product = await Product.create({ name: 'Demo Fortified Atta', brand: 'Bharat Harvest', category: 'Food', manufacturer: 'ABC Foods Pvt Ltd', normalizedKey: 'demo fortified atta|bharat harvest' });
await Inspection.create({ inspectionId: 'PCI-DEMO-001', product: product._id, inspector: inspector._id, productInfo: { name: product.name, brand: product.brand, category: product.category, manufacturer: product.manufacturer }, declarations: [{ key: 'mrp', label: 'MRP', value: '50', status: 'Found', confidence: .95 }, { key: 'netQuantity', label: 'Net Quantity', value: '500 g', status: 'Found', confidence: .94 }, { key: 'manufacturer', label: 'Manufacturer', value: 'ABC Foods Pvt Ltd', status: 'Found', confidence: .92 }, { key: 'phone', label: 'Phone', value: '', status: 'Not Found', confidence: .88 }], violations: [{ violationId: 'V-DEMO-001', ruleId: 'LMPC_CARE_001', title: 'Consumer Care Contact', description: 'Consumer care details were not detected.', declaration: 'phone', severity: 'major', confidence: .88, status: 'Requires Officer Review' }], score: 85, status: 'NON-COMPLIANT', ruleVersion: '2024.1', ruleSetSnapshot: rules.map(rule => rule.toObject()) });
console.log('Seed complete', { admin: admin.email, inspector: inspector.email, rules: rules.length });
process.exit(0);
