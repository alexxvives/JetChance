const jwt = require('jsonwebtoken');
const db = require('../config/database-sqlite');

const authenticate = async (req, res, next) => {
  try {
    // Only log non-polling requests to reduce console noise
    if (!req.path.includes('unread-count')) {
      console.log(`🔐 Auth middleware - ${req.method} ${req.path}`);
    }
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided for', req.path);
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const result = await db.query(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found for token:', decoded.userId);
      // User not found - likely old UUID from before migration
      // Treat as invalid token to force re-login
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token contains outdated user reference. Please log in again.'
      });
    }

    req.user = result.rows[0];
    if (!req.path.includes('unread-count')) {
      console.log('✅ User authenticated:', req.user.id, req.user.email);
    }
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};