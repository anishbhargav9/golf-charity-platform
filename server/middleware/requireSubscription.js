const User = require('../models/User');

const requireSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.subscriptionStatus !== 'active') {
      return res.status(403).json({ message: 'Active subscription required.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error checking subscription.' });
  }
};

module.exports = requireSubscription;