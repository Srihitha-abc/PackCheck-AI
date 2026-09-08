import { Router } from 'express';
import { protect, roles } from '../middleware/auth.js';
import ComplianceRule from '../models/ComplianceRule.js';
const router = Router();
router.get('/', protect, async (req, res, next) => { try { res.json({ rules: await ComplianceRule.find().sort('declaration') }); } catch (e) { next(e); } });
router.post('/', protect, roles('ADMIN'), async (req, res, next) => { try { res.status(201).json({ rule: await ComplianceRule.create(req.body) }); } catch (e) { next(e); } });
router.put('/:id', protect, roles('ADMIN'), async (req, res, next) => { try { res.json({ rule: await ComplianceRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) }); } catch (e) { next(e); } });
router.delete('/:id', protect, roles('ADMIN'), async (req, res, next) => { try { res.json({ rule: await ComplianceRule.findByIdAndUpdate(req.params.id, { active: false }, { new: true }) }); } catch (e) { next(e); } });
export default router;
