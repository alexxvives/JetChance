const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run } = require('../config/database-sqlite');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile - Get user profile data
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const userResult = await query(
      'SELECT id, email, first_name, last_name, phone, address, date_of_birth, notification_email, notification_sms, notification_marketing, role FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    let operator = null;

    // Get operator data if user is an operator
    if (user.role === 'operator') {
      const operatorResult = await query(
        'SELECT id, company_name, company_address, operator_id, status, rating, total_flights FROM operators WHERE user_id = ?',
        [userId]
      );
      
      if (operatorResult.rows.length > 0) {
        operator = operatorResult.rows[0];
      }
    }

    // Prepare profile data (combine user and operator data)
    const profile = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.date_of_birth,
      emailNotifications: user.notification_email,
      smsNotifications: user.notification_sms,
      marketingEmails: user.notification_marketing
    };

    if (operator) {
      profile.companyName = operator.company_name;
      profile.companyAddress = operator.company_address;
    }

    res.json({
      user,
      operator,
      profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile - Update user profile data
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      emailNotifications,
      smsNotifications,
      marketingEmails,
      companyName,
      companyAddress,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    // Get current user data
    const userResult = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Validate password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!passwordMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Update user table
    let updateUserQuery = `
      UPDATE users SET 
        first_name = ?, 
        last_name = ?, 
        email = ?, 
        phone = ?, 
        address = ?, 
        date_of_birth = ?,
        notification_email = ?,
        notification_sms = ?,
        notification_marketing = ?,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    let userParams = [
      firstName || user.first_name,
      lastName || user.last_name,
      email || user.email,
      phone,
      address,
      dateOfBirth,
      emailNotifications !== undefined ? emailNotifications : user.notification_email,
      smsNotifications !== undefined ? smsNotifications : user.notification_sms,
      marketingEmails !== undefined ? marketingEmails : user.notification_marketing
    ];

    // Add password update if provided
    if (newPassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updateUserQuery += ', password_hash = ?';
      userParams.push(hashedPassword);
    }

    updateUserQuery += ' WHERE id = ?';
    userParams.push(userId);

    await run(updateUserQuery, userParams);

    // Update operator table if user is an operator
    if (user.role === 'operator' && (companyName || companyAddress)) {
      const operatorResult = await query('SELECT id FROM operators WHERE user_id = ?', [userId]);
      
      if (operatorResult.rows.length > 0) {
        await run(
          'UPDATE operators SET company_name = ?, company_address = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
          [
            companyName || null,
            companyAddress || null,
            userId
          ]
        );
      }
    }

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle unique constraint violations
    if (error.message.includes('UNIQUE constraint failed: users.email')) {
      return res.status(400).json({ error: 'Email address is already in use' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;