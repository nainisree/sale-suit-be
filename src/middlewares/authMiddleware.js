const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect Route — Verify JWT ──────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ detail: ['Not authenticated. Please log in.'] });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ detail: ['User no longer exists.'] });
    }

    if (!user.is_active) {
      return res.status(403).json({ detail: ['Your account has been deactivated.'] });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ detail: ['Invalid token. Please log in again.'] });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: ['Token expired. Please log in again.'] });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ detail: ['Authentication error.'] });
  }
};

// ─── Restrict to Specific Roles ──────────────────────────────────────
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        detail: ['You do not have permission to perform this action.'],
      });
    }
    next();
  };
};
