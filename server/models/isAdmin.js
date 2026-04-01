const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error checking admin role.' });
  }
};

module.exports = isAdmin;