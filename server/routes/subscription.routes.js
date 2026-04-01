const express       = require('express');
const User          = require('../models/User');
const Subscription  = require('../models/Subscription');
const verifyToken   = require('../middleware/verifyToken');
const { createMockCustomer, createMockSubscription, cancelMockSubscription } = require('../services/stripeService');
const { sendSubscriptionConfirmEmail } = require('../services/emailService');
const router        = express.Router();

// GET /api/subscription/status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.userId });
    res.json(sub || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/subscription/subscribe
router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan.' });
    }
    const user = await User.findById(req.userId);
    const customer = createMockCustomer(user.email);
    const mockSub  = createMockSubscription(customer.id, plan);

    const existing = await Subscription.findOne({ userId: req.userId });
    if (existing) {
      existing.plan = plan;
      existing.status = 'active';
      existing.amount = mockSub.amount;
      existing.renewalDate = mockSub.renewalDate;
      existing.cancelledAt = null;
      await existing.save();
    } else {
      await Subscription.create({
        userId: req.userId,
        plan, status: 'active',
        amount: mockSub.amount,
        renewalDate: mockSub.renewalDate,
        stripeSubscriptionId: mockSub.id
      });
    }

    user.subscriptionStatus = 'active';
    user.subscriptionPlan   = plan;
    user.stripeCustomerId   = customer.id;
    await user.save();

    sendSubscriptionConfirmEmail(user.email, plan);
    res.json({ message: 'Subscribed successfully.', plan });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/subscription/cancel
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.userId });
    if (!sub) return res.status(404).json({ message: 'No active subscription.' });

    cancelMockSubscription(sub.stripeSubscriptionId);
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    await sub.save();

    await User.findByIdAndUpdate(req.userId, {
      subscriptionStatus: 'cancelled',
      subscriptionPlan:   null
    });

    res.json({ message: 'Subscription cancelled.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;