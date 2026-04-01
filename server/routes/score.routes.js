const express  = require('express');
const Score    = require('../models/Score');
const verifyToken = require('../middleware/verifyToken');
const requireSubscription = require('../middleware/requireSubscription');
const router   = express.Router();

// GET /api/scores
router.get('/', verifyToken, async (req, res) => {
  try {
    const doc = await Score.findOne({ userId: req.userId });
    if (!doc) return res.json({ scores: [] });
    const sorted = [...doc.scores].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ scores: sorted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/scores — rolling 5 logic
router.post('/', verifyToken, requireSubscription, async (req, res) => {
  try {
    const { value, date } = req.body;
    if (!value || value < 1 || value > 45) {
      return res.status(400).json({ message: 'Score must be between 1 and 45.' });
    }
    if (!date) return res.status(400).json({ message: 'Date is required.' });

    let doc = await Score.findOne({ userId: req.userId });
    if (!doc) doc = new Score({ userId: req.userId, scores: [] });

    // Sort by date ascending so we remove the oldest
    doc.scores.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Rolling 5 — remove oldest if already at 5
    if (doc.scores.length >= 5) doc.scores.shift();

    doc.scores.push({ value: Number(value), date: new Date(date) });
    await doc.save();

    // Return sorted newest first
    const sorted = [...doc.scores].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(201).json({ scores: sorted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/scores/:id — delete by MongoDB _id
router.delete('/:id', verifyToken, requireSubscription, async (req, res) => {
  try {
    const doc = await Score.findOne({ userId: req.userId });
    if (!doc) return res.status(404).json({ message: 'No scores found.' });

    const before = doc.scores.length;
    doc.scores = doc.scores.filter(s => s._id.toString() !== req.params.id);

    if (doc.scores.length === before) {
      return res.status(404).json({ message: 'Score not found.' });
    }

    await doc.save();
    const sorted = [...doc.scores].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ scores: sorted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;