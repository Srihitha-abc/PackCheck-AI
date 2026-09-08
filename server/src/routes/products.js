import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Inspection from '../models/Inspection.js';
const router = Router();
router.get('/', protect, async (req, res, next) => { try { const search = req.query.search || ''; const products = await Product.find({ $or: [{ name: new RegExp(search, 'i') }, { brand: new RegExp(search, 'i') }, { manufacturer: new RegExp(search, 'i') }] }).limit(100); res.json({ products }); } catch (e) { next(e); } });
router.get('/search', protect, async (req, res, next) => { try { const search = req.query.q || req.query.search || ''; const products = await Product.find({ $or: [{ name: new RegExp(search, 'i') }, { brand: new RegExp(search, 'i') }, { manufacturer: new RegExp(search, 'i') }] }).limit(100); res.json({ products }); } catch (e) { next(e); } });
router.get('/:id', protect, async (req, res, next) => { try { const product = await Product.findById(req.params.id); const inspections = await Inspection.find({ product: req.params.id }).sort('-createdAt').populate('inspector', 'name'); res.json({ product, inspections }); } catch (e) { next(e); } });
export default router;
