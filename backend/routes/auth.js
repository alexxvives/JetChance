const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SimpleIDGenerator = require('../utils/idGenerator');
const { body, validationResult } = require('express-validator');
const db = require('../config/database-sqlite');
const { authenticate } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('first_name').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('last_name').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('role').optional().isIn(['customer', 'operator']),
  body('signupCode').optional().trim(),
  body('companyName').optional().trim(),
  body('isIndividual').optional().isBoolean(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, role = 'customer', signupCode, companyName } = req.body;
    
    // Handle both firstName/lastName and first_name/last_name formats
    const firstName = req.body.firstName || req.body.first_name;
    const lastName = req.body.lastName || req.body.last_name;
    const phone = req.body.phone;

    // Validate required fields based on role
    if (role === 'customer') {
      if (!firstName || !lastName) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'First name and last name are required for customer accounts'
        });
      }
    } else if (role === 'operator') {
      if (!companyName || !companyName.trim()) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Company/Organization name is required for operator accounts'
        });
      }
    }

    // Validate signup code for operators
    if (role === 'operator') {
      if (!signupCode || signupCode !== 'code') {
        return res.status(400).json({
          error: 'Wrong Signup Code',
          message: 'Wrong Signup Code'
        });
      }
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = SimpleIDGenerator.generateUserId();
    
    const status = 'approved'; // All users are automatically approved now

    // Create user in users table
    await db.run(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [userId, email, passwordHash, role]
    );

    // Create role-specific record
    let roleSpecificId;
    if (role === 'customer') {
      roleSpecificId = SimpleIDGenerator.generateCustomerId();
      await db.run(
        `INSERT INTO customers (id, user_id, first_name, last_name)
         VALUES (?, ?, ?, ?)`,
        [roleSpecificId, userId, firstName, lastName]
      );
    } else if (role === 'operator') {
      roleSpecificId = SimpleIDGenerator.generateOperatorId();
      await db.run(
        `INSERT INTO operators (id, user_id, company_name, total_flights, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [roleSpecificId, userId, companyName.trim(), 0, new Date().toISOString()]
      );
      
      // Notify all admins about new operator registration
      try {
        const adminQuery = await db.query(
          'SELECT id FROM users WHERE role IN (?, ?)',
          ['admin', 'super-admin']
        );
        
        for (const admin of adminQuery.rows) {
          await createNotification(
            db,
            admin.id,
            'New Operator Registration',
            `New operator account registered: ${companyName.trim()} (${email})`
          );
        }
        console.log(`✅ Notified ${adminQuery.rows.length} admins about new operator registration`);
      } catch (notificationError) {
        console.error('❌ Failed to create admin notification for operator registration:', notificationError);
        // Don't fail registration if notification fails
      }
    }

    // Get the created user data
    let userResponse;
    if (role === 'customer') {
      const result = await db.query(`
        SELECT au.id, au.email, au.role, au.created_at, c.first_name, c.last_name
        FROM users au
        JOIN customers c ON au.id = c.user_id
        WHERE au.id = ?
      `, [userId]);
      const user = result.rows[0];
      userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      };
    } else if (role === 'operator') {
      const result = await db.query(`
        SELECT au.id, au.email, au.role, au.created_at, o.company_name
        FROM users au
        JOIN operators o ON au.id = o.user_id
        WHERE au.id = ?
      `, [userId]);
      const user = result.rows[0];
      userResponse = {
        id: user.id,
        email: user.email,
        companyName: user.company_name,
        role: user.role,
        createdAt: user.created_at
      };
    }
    
    const { accessToken, refreshToken } = generateTokens(userId);

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create account. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user in users
    const result = await db.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Get role-specific data
    let userResponse = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    if (user.role === 'customer') {
      const customerResult = await db.query(`
        SELECT first_name, last_name FROM customers WHERE user_id = ?
      `, [user.id]);
      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        userResponse.firstName = customer.first_name;
        userResponse.lastName = customer.last_name;
      }
    } else if (user.role === 'operator') {
      const operatorResult = await db.query(`
        SELECT company_name FROM operators WHERE user_id = ?
      `, [user.id]);
      if (operatorResult.rows.length > 0) {
        const operator = operatorResult.rows[0];
        userResponse.companyName = operator.company_name;
      }
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    res.json({
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate. Please try again.'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'No refresh token provided'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user still exists and is active
    const result = await db.query(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found or account disabled'
      });
    }

    const user = result.rows[0];
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.json({
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Unable to refresh token. Please login again.'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  res.json({
    message: 'Logout successful',
    instruction: 'Please remove tokens from client storage'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, role, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = result.rows[0];
    
    // Get role-specific data
    let userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    };

    if (user.role === 'customer') {
      const customerResult = await db.query(`
        SELECT first_name, last_name FROM customers WHERE user_id = ?
      `, [user.id]);
      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        userResponse.firstName = customer.first_name;
        userResponse.lastName = customer.last_name;
        userResponse.dateOfBirth = customer.date_of_birth;
      }
    } else if (user.role === 'operator') {
      const operatorResult = await db.query(`
        SELECT company_name FROM operators WHERE user_id = ?
      `, [user.id]);
      if (operatorResult.rows.length > 0) {
        const operator = operatorResult.rows[0];
        userResponse.companyName = operator.company_name;
      }
    }

    res.json(userResponse);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, phone } = req.body;
    const updates = {};
    const params = [req.user.id];
    let paramIndex = 2;

    if (firstName) {
      updates.first_name = `?`;
      params.push(firstName);
    }

    if (lastName) {
      updates.last_name = `?`;
      params.push(lastName);
    }

    if (phone) {
      updates.phone = `?`;
      params.push(phone);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No updates provided'
      });
    }

    updates.updated_at = 'datetime("now")';

    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');

    // Update the user
    await db.run(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...params.slice(1), req.user.id]
    );

    // Get the updated user
    const result = await db.query(
      'SELECT id, email, first_name, last_name, phone, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const updatedUser = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

module.exports = router;
