const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  try {
    // First check from token role (faster)
    if (req.userRole === 'admin') return next();

    // Fallback — check database
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  } catch (err) {
    console.error('isAdmin error:', err.message);
    res.status(500).json({ message: 'Server error checking admin role.' });
  }
};

module.exports = isAdmin;