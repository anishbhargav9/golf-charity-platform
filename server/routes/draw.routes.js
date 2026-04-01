const express     = require('express');
const Draw        = require('../models/Draw');
const Winner      = require('../models/Winner');
const Prize       = require('../models/Prize');
const User        = require('../models/User');
const Score       = require('../models/Score');
const verifyToken = require('../middleware/verifyToken');
const isAdmin     = require('../middleware/isAdmin');
const { randomDraw, algorithmicDraw, matchWinners } = require('../services/drawEngine');
const { calcPrizePool, calcPools, splitPrize }      = require('../services/prizeCalc');
const router      = express.Router();

// GET /api/draws  — all published draws
router.get('/', verifyToken, async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' }).sort({ year: -1, month: -1 });
    res.json(draws);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/draws/current
router.get('/current', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const draw = await Draw.findOne({
      month: now.getMonth() + 1,
      year:  now.getFullYear()
    });
    res.json(draw || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/draws/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ message: 'Draw not found.' });
    res.json(draw);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/draws/simulate  — admin only
router.post('/simulate', verifyToken, isAdmin, async (req, res) => {
  try {
    const { algorithmType, month, year, jackpotCarried } = req.body;
    const now = new Date();
    const drawMonth = month || now.getMonth() + 1;
    const drawYear  = year  || now.getFullYear();

    const numbers = algorithmType === 'algorithmic'
      ? await algorithmicDraw()
      : randomDraw();

    const activeUsers = await User.find({ subscriptionStatus: 'active' });
    const prizePool   = calcPrizePool(activeUsers.length);
    const pools       = calcPools(prizePool, jackpotCarried || 0);

    let draw = await Draw.findOne({ month: drawMonth, year: drawYear });
    if (!draw) {
      draw = new Draw({ month: drawMonth, year: drawYear });
    }
    draw.drawnNumbers       = numbers;
    draw.algorithmType      = algorithmType || 'random';
    draw.status             = 'simulated';
    draw.prizePool          = prizePool;
    draw.jackpotCarriedAmount = jackpotCarried || 0;
    draw.totalSubscribers   = activeUsers.length;
    await draw.save();

    res.json({ draw, pools, numbers });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/draws/publish  — admin only
router.post('/publish', verifyToken, isAdmin, async (req, res) => {
  try {
    const { drawId } = req.body;
    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ message: 'Draw not found.' });
    if (draw.status === 'published') {
      return res.status(400).json({ message: 'Draw already published.' });
    }

    const allScores   = await Score.find({});
    const winnerMap   = matchWinners(draw.drawnNumbers, allScores);
    const prizePool   = draw.prizePool;
    const pools       = calcPools(prizePool, draw.jackpotCarriedAmount);

    const prizeRecords = [];
    let jackpotRollover = false;

    for (const [matchType, userIds] of Object.entries(winnerMap)) {
      const poolKey = matchType === '5' ? 'five' : matchType === '4' ? 'four' : 'three';
      const poolAmt = pools[poolKey];
      const split   = splitPrize(poolAmt, userIds.length);

      if (matchType === '5' && userIds.length === 0) jackpotRollover = true;

      const prize = await Prize.create({
        drawId: draw._id, matchType, poolAmount: poolAmt,
        winnersCount: userIds.length, splitAmount: split
      });
      prizeRecords.push(prize);

      for (const uid of userIds) {
        await Winner.create({
          userId: uid, drawId: draw._id,
          matchType, prizeAmount: split
        });
      }
    }

    draw.status          = 'published';
    draw.jackpotRollover = jackpotRollover;
    await draw.save();

    res.json({ draw, prizeRecords, winnerMap });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;