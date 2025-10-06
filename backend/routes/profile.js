const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const { query, run } = require('../config/database-sqlite');
const { authenticate } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const db = require('../config/database-sqlite');

const router = express.Router();

// Log database path on module load
const dbPath = path.join(__dirname, '..', 'jetchance.db');
console.log('📁 Database path being used:', path.resolve(dbPath));

// GET /api/profile - Get user profile data
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('\n📖 ===== PROFILE GET REQUEST =====');
    console.log('👤 User ID:', userId);

    // Get user data
    const userResult = await query(
      'SELECT id, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    console.log('👥 User Role:', user.role);
    let operator = null;
    let customer = null;

    // Get customer data if user is a customer
    if (user.role === 'customer') {
      const customerResult = await query(
        'SELECT id, first_name, last_name, phone, email_notifications, sms_notifications, marketing_emails FROM customers WHERE user_id = ?',
        [userId]
      );
      
      if (customerResult.rows.length > 0) {
        customer = customerResult.rows[0];
        console.log('📊 Customer found:', customer.id);
        console.log('📧 Notification values from DB:');
        console.log('   - email_notifications:', customer.email_notifications);
        console.log('   - sms_notifications:', customer.sms_notifications);
        console.log('   - marketing_emails:', customer.marketing_emails);
      } else {
        console.log('⚠️  No customer record found for user_id:', userId);
      }
    }

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

    // Prepare profile data (combine user, customer, and operator data)
    const profile = {
      firstName: customer?.first_name || null,
      lastName: customer?.last_name || null,
      email: user.email,
      phone: customer?.phone || null,
      address: null, // Removed from schema
      dateOfBirth: null, // Removed from schema
      emailNotifications: customer?.email_notifications === 1,
      smsNotifications: customer?.sms_notifications === 1,
      marketingEmails: customer?.marketing_emails === 1
    };

    console.log('📧 Notification values converted to booleans:');
    console.log('   - emailNotifications:', profile.emailNotifications);
    console.log('   - smsNotifications:', profile.smsNotifications);
    console.log('   - marketingEmails:', profile.marketingEmails);
    console.log('===== END PROFILE GET =====\n');

    if (operator) {
      profile.companyName = operator.company_name;
      profile.companyAddress = operator.company_address;
    }

    res.json({
      user,
      operator,
      customer,
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
      emailNotifications,
      smsNotifications,
      marketingEmails,
      companyName,
      companyAddress,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    console.log('\n🔄 ===== PROFILE UPDATE REQUEST =====');
    console.log('👤 User ID:', userId);
    console.log('📧 Notification Preferences Received:');
    console.log('   - emailNotifications:', emailNotifications, '(type:', typeof emailNotifications, ')');
    console.log('   - smsNotifications:', smsNotifications, '(type:', typeof smsNotifications, ')');
    console.log('   - marketingEmails:', marketingEmails, '(type:', typeof marketingEmails, ')');
    console.log('📝 Profile Data:', { firstName, lastName, email, phone });

    // Get current user data
    const userResult = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    console.log('👥 User Role:', user.role);

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

    // Update user table (email and password only)
    let updateUserQuery = 'UPDATE users SET email = ?';
    let userParams = [email || user.email];

    // Add password update if provided
    if (newPassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updateUserQuery += ', password_hash = ?';
      userParams.push(hashedPassword);
    }

    updateUserQuery += ' WHERE id = ?';
    userParams.push(userId);

    console.log('🔐 Updating users table...');
    await run(updateUserQuery, userParams);
    console.log('✅ Users table updated');

    // Update customer table if user is a customer
    if (user.role === 'customer') {
      const customerResult = await query('SELECT * FROM customers WHERE user_id = ?', [userId]);
      
      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        
        const notificationValues = {
          emailNotifications: emailNotifications === true ? 1 : 0,
          smsNotifications: smsNotifications === true ? 1 : 0,
          marketingEmails: marketingEmails === true ? 1 : 0
        };
        
        console.log('📊 Customer found:', customer.id);
        console.log('📧 Converting notification booleans to integers:');
        console.log('   - emailNotifications:', emailNotifications, '→', notificationValues.emailNotifications);
        console.log('   - smsNotifications:', smsNotifications, '→', notificationValues.smsNotifications);
        console.log('   - marketingEmails:', marketingEmails, '→', notificationValues.marketingEmails);
        
        console.log('💾 Updating customers table...');
        const updateResult = await run(
          `UPDATE customers SET 
            first_name = ?, 
            last_name = ?, 
            phone = ?,
            email_notifications = ?,
            sms_notifications = ?,
            marketing_emails = ?
          WHERE user_id = ?`,
          [
            firstName || customer.first_name,
            lastName || customer.last_name,
            phone || customer.phone,
            notificationValues.emailNotifications,
            notificationValues.smsNotifications,
            notificationValues.marketingEmails,
            userId
          ]
        );
        console.log('✅ UPDATE executed - Rows affected:', updateResult.changes);
        
        // Verify the update
        const verifyResult = await query('SELECT email_notifications, sms_notifications, marketing_emails FROM customers WHERE user_id = ?', [userId]);
        if (verifyResult.rows.length > 0) {
          console.log('🔍 Verification - Values now in database:');
          console.log('   - email_notifications:', verifyResult.rows[0].email_notifications);
          console.log('   - sms_notifications:', verifyResult.rows[0].sms_notifications);
          console.log('   - marketing_emails:', verifyResult.rows[0].marketing_emails);
        }
      } else {
        console.log('⚠️  No customer record found for user_id:', userId);
      }
    }

    // Update operator table if user is an operator
    if (user.role === 'operator' && (companyName || companyAddress)) {
      const operatorResult = await query('SELECT id FROM operators WHERE user_id = ?', [userId]);
      
      if (operatorResult.rows.length > 0) {
        console.log('🏢 Updating operator table...');
        await run(
          'UPDATE operators SET company_name = ?, company_address = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
          [
            companyName || null,
            companyAddress || null,
            userId
          ]
        );
        console.log('✅ Operator table updated');
      }
    }

    console.log('✨ Profile update completed successfully');
    console.log('===== END PROFILE UPDATE =====\n');

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

// DELETE /api/profile - Delete user account
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data before deletion
    const userResult = await query(
      'SELECT u.id, u.email, u.role, o.company_name, c.first_name, c.last_name FROM users u LEFT JOIN operators o ON u.id = o.user_id LEFT JOIN customers c ON u.id = c.user_id WHERE u.id = ?',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const isOperator = user.role === 'operator';
    const userName = isOperator ? user.company_name : `${user.first_name} ${user.last_name}`;
    
    // Delete role-specific records first (foreign key constraints)
    if (isOperator) {
      await run('DELETE FROM operators WHERE user_id = ?', [userId]);
      
      // Also delete any flights owned by this operator
      await run('DELETE FROM flights WHERE user_id = ?', [userId]);
    } else {
      await run('DELETE FROM customers WHERE user_id = ?', [userId]);
    }
    
    // Delete notifications for this user
    await run('DELETE FROM notifications WHERE user_id = ?', [userId]);
    
    // Delete the user account
    await run('DELETE FROM users WHERE id = ?', [userId]);
    
    // Notify admins about account deletion
    try {
      const adminQuery = await query(
        'SELECT id FROM users WHERE role IN (?, ?)',
        ['admin', 'super-admin']
      );
      
      const roleLabel = isOperator ? 'Operator' : 'Customer';
      for (const admin of adminQuery.rows) {
        await createNotification(
          admin.id,
          `${roleLabel} Account Deleted`,
          `${roleLabel} account deleted: ${userName} (${user.email})`
        );
      }
      console.log(`✅ Notified ${adminQuery.rows.length} admins about account deletion`);
    } catch (notificationError) {
      console.error('❌ Failed to create admin notification for account deletion:', notificationError);
      // Don't fail deletion if notification fails
    }
    
    console.log(`✅ Account deleted successfully: ${user.email} (${user.role})`);
    res.json({ message: 'Account deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
});

module.exports = router;