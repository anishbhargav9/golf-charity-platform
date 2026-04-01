const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token      = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId   = decoded.id;
    req.userRole = decoded.role;

    // If role not in token, fetch from DB
    if (!req.userRole) {
      const user   = await User.findById(decoded.id).select('role');
      req.userRole = user?.role || 'user';
    }

    next();
  } catch (err) {
    console.error('Token error:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
