const express      = require('express');
const User         = require('../models/User');
const Draw         = require('../models/Draw');
const Winner       = require('../models/Winner');
const Charity      = require('../models/Charity');
const Subscription = require('../models/Subscription');
const Score        = require('../models/Score');
const verifyToken  = require('../middleware/verifyToken');
const isAdmin      = require('../middleware/isAdmin');
const router       = express.Router();

// GET /api/admin/stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers        = await User.countDocuments({ role: 'user' });
    const activeSubscribers = await User.countDocuments({ subscriptionStatus: 'active' });
    const totalCharities    = await Charity.countDocuments();
    const totalDraws        = await Draw.countDocuments({ status: 'published' });
    const pendingWinners    = await Winner.countDocuments({ verificationStatus: 'pending' });
    const subs              = await Subscription.find({ status: 'active' });
    const totalPrizePool    = subs.reduce((sum, s) => sum + (s.amount * 0.60), 0);

    res.json({
      totalUsers,
      activeSubscribers,
      totalCharities,
      totalDraws,
      pendingWinners,
      totalPrizePool
    });
  } catch (err) {
    console.error('STATS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate({ path: 'charityId', select: 'name', strictPopulate: false });
    res.json(users || []);
  } catch (err) {
    console.error('USERS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, subscriptionStatus, role, charityId, charityPercent } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, subscriptionStatus, role, charityId, charityPercent },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('UPDATE USER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users/:id/scores
router.get('/users/:id/scores', verifyToken, isAdmin, async (req, res) => {
  try {
    const doc = await Score.findOne({ userId: req.params.id });
    res.json(doc || { scores: [] });
  } catch (err) {
    console.error('USER SCORES ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/draws
router.get('/draws', verifyToken, isAdmin, async (req, res) => {
  try {
    const draws = await Draw.find({}).sort({ year: -1, month: -1 });
    res.json(draws || []);
  } catch (err) {
    console.error('DRAWS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/winners
router.get('/winners', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('Fetching winners...');
    const winners = await Winner.find({}).sort({ createdAt: -1 });
    console.log('Winners found:', winners.length);

    // Manually populate to avoid any populate errors
    const populated = await Promise.all(winners.map(async (w) => {
      const obj = w.toObject();
      try {
        if (w.userId) {
          const user = await User.findById(w.userId).select('name email');
          obj.userId = user || { name: 'Unknown', email: 'Unknown' };
        }
        if (w.drawId) {
          const draw = await Draw.findById(w.drawId).select('month year');
          obj.drawId = draw || { month: 0, year: 0 };
        }
      } catch (popErr) {
        console.error('Population error:', popErr.message);
      }
      return obj;
    }));

    res.json(populated);
  } catch (err) {
    console.error('WINNERS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;