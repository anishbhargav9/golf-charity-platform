const express     = require('express');
const Winner      = require('../models/Winner');
const verifyToken = require('../middleware/verifyToken');
const isAdmin     = require('../middleware/isAdmin');
const upload      = require('../services/uploadService');
const router      = express.Router();

// GET /api/winners
router.get('/', verifyToken, async (req, res) => {
  try {
    let winners;
    if (req.userRole === 'admin') {
      winners = await Winner.find({})
        .populate({ path: 'userId', select: 'name email', strictPopulate: false })
        .populate({ path: 'drawId', select: 'month year', strictPopulate: false })
        .sort({ createdAt: -1 });
    } else {
      winners = await Winner.find({ userId: req.userId })
        .populate({ path: 'drawId', select: 'month year', strictPopulate: false })
        .sort({ createdAt: -1 });
    }
    res.json(winners);
  } catch (err) {
    console.error('GET /winners error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/winners/upload-proof
router.post('/upload-proof', verifyToken, upload.single('proof'), async (req, res) => {
  try {
    const { winnerId } = req.body;
    if (!winnerId) return res.status(400).json({ message: 'Winner ID required.' });
    
    const winner = await Winner.findOne({ _id: winnerId, userId: req.userId });
    if (!winner) return res.status(404).json({ message: 'Winner record not found.' });

    winner.proofUrl = `/uploads/${req.file.filename}`;
    await winner.save();
    res.json({ message: 'Proof uploaded.', proofUrl: winner.proofUrl });
  } catch (err) {
    console.error('Upload proof error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/winners/:id/verify — admin
router.put('/:id/verify', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }
    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    );
    if (!winner) return res.status(404).json({ message: 'Winner not found.' });
    res.json(winner);
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/winners/:id/payout — admin
router.put('/:id/payout', verifyToken, isAdmin, async (req, res) => {
  try {
    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'paid' },
      { new: true }
    );
    if (!winner) return res.status(404).json({ message: 'Winner not found.' });
    res.json(winner);
  } catch (err) {
    console.error('Payout error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;