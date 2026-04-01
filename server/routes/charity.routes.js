const express     = require('express');
const Charity     = require('../models/Charity');
const verifyToken = require('../middleware/verifyToken');
const isAdmin     = require('../middleware/isAdmin');
const router      = express.Router();

// GET /api/charities  — public
router.get('/', async (req, res) => {
  try {
    const { search, featured } = req.query;
    const query = {};
    if (search)   query.name = { $regex: search, $options: 'i' };
    if (featured) query.featured = true;
    const charities = await Charity.find(query).sort({ featured: -1, createdAt: -1 });
    res.json(charities);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/charities/:id  — public
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found.' });
    res.json(charity);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/charities  — admin
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json(charity);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/charities/:id  — admin
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!charity) return res.status(404).json({ message: 'Charity not found.' });
    res.json(charity);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/charities/:id  — admin
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Charity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charity deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;