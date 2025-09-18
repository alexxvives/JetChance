const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile (alias for /auth/me)
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  res.redirect('/api/auth/me');
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    // This would contain dashboard-specific data
    // For now, just return basic structure
    res.json({
      message: 'Dashboard data endpoint',
      userRole: req.user.role,
      // Add more dashboard data here
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;