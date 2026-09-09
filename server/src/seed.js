import 'dotenv/config';
import './config/env.js';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import ComplianceRule from './models/ComplianceRule.js';
import Product from './models/Product.js';
import Inspection from './models/Inspection.js';
import complianceRulesSeed from './seed/complianceRulesSeed.js';

await connectDatabase();

// Clean up users, products, and inspections, but preserve rules if they exist
await Promise.all([
  User.deleteMany({}),
  Product.deleteMany({}),
  Inspection.deleteMany({})
]);

// Seed users
const [admin, inspector] = await User.create([
  { name: 'System Administrator', email: 'admin@packcheck.gov.in', password: await bcrypt.hash('Admin@123', 12), role: 'ADMIN' },
  { name: 'Demo Inspector', email: 'inspector@packcheck.gov.in', password: await bcrypt.hash('Inspector@123', 12), role: 'INSPECTOR' }
]);

// Seed rules with upsert logic to preserve existing rules and add new ones
console.log('Seeding comprehensive compliance rules...');
const seedResults = [];
for (const rule of complianceRulesSeed) {
  const result = await ComplianceRule.updateOne(
    { ruleId: rule.ruleId },
    { $set: rule },
    { upsert: true }
  );
  seedResults.push(result);
}

const rules = await ComplianceRule.find({}).lean();
console.log(`✓ Compliance rules seeded: ${rules.length} total rules in database`);

// Create demo product
const product = await Product.create({
  name: 'Demo Fortified Atta',
  brand: 'Bharat Harvest',
  category: 'Food',
  manufacturer: 'ABC Foods Pvt Ltd',
  normalizedKey: 'demo fortified atta|bharat harvest'
});

// Create demo inspection with rule snapshot
const demoInspection = await Inspection.create({
  inspectionId: 'PCI-DEMO-001',
  product: product._id,
  inspector: inspector._id,
  productInfo: {
    name: product.name,
    brand: product.brand,
    category: product.category,
    manufacturer: product.manufacturer,
    isImported: false
  },
  declarations: [
    { key: 'mrp', label: 'MRP', value: '50', status: 'Found', confidence: 0.95 },
    { key: 'netQuantity', label: 'Net Quantity', value: '500 g', status: 'Found', confidence: 0.94 },
    { key: 'manufacturer', label: 'Manufacturer', value: 'ABC Foods Pvt Ltd', status: 'Found', confidence: 0.92 },
    { key: 'phone', label: 'Phone', value: '', status: 'Not Found', confidence: 0.88 }
  ],
  violations: [
    {
      violationId: 'V-DEMO-001',
      ruleId: 'LMPC_CONSUMER_CARE_013',
      title: 'Consumer Care Contact Details',
      description: 'Consumer care details were not detected.',
      declaration: 'consumerCare',
      severity: 'major',
      confidence: 0.88,
      status: 'Requires Officer Review'
    }
  ],
  score: 85,
  status: 'PARTIALLY COMPLIANT',
  ruleVersion: '2026.1',
  ruleSetSnapshot: rules.slice(0, 10).map(rule => rule)
});

console.log('✓ Seed complete', {
  admin: admin.email,
  inspector: inspector.email,
  rules: rules.length,
  demoInspection: demoInspection.inspectionId
});
process.exit(0);
