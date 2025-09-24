const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const db = require('../config/database-sqlite');

const router = express.Router();

// @route   GET /api/operators
// @desc    Get all approved operators
// @access  Public
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.company_name, u.status, u.created_at
      FROM users u
      WHERE u.role = 'operator' AND u.status = 'approved'
      ORDER BY u.created_at DESC
    `;
    
    const result = await db.query(sql);
    
    res.json({
      operators: result.rows.map(op => ({
        id: op.id,
        email: op.email,
        firstName: op.first_name,
        lastName: op.last_name,
        companyName: op.company_name,
        status: op.status,
        createdAt: op.created_at
      }))
    });
  } catch (error) {
    console.error('Operators error:', error);
    res.status(500).json({
      error: 'Failed to fetch operators'
    });
  }
});

// @route   GET /api/operators/pending
// @desc    Get all pending operators (Admin only)
// @access  Private (Admin)
router.get('/pending', authenticate, authorize(['super-admin', 'admin']), async (req, res) => {
  try {
    const sql = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.company_name, u.status, u.created_at
      FROM users u
      WHERE u.role = 'operator' AND u.status = 'pending'
      ORDER BY u.created_at ASC
    `;
    
    const result = await db.query(sql);
    
    res.json({
      operators: result.rows.map(op => ({
        id: op.id,
        email: op.email,
        firstName: op.first_name,
        lastName: op.last_name,
        companyName: op.company_name,
        status: op.status,
        createdAt: op.created_at
      }))
    });
  } catch (error) {
    console.error('Pending operators error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending operators'
    });
  }
});

// @route   PATCH /api/operators/:id/status
// @desc    Approve or deny operator (Admin only)
// @access  Private (Admin)
router.patch('/:id/status', authenticate, authorize(['super-admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // status should be 'approved' or 'denied'
    
    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be "approved" or "denied"'
      });
    }

    // Check if operator exists and is pending
    const operatorCheck = await db.query(
      'SELECT id, email, first_name, last_name, company_name, status FROM users WHERE id = ? AND role = ?',
      [id, 'operator']
    );

    if (operatorCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Operator not found'
      });
    }

    const operator = operatorCheck.rows[0];

    if (operator.status !== 'pending') {
      return res.status(400).json({
        error: `Operator is already ${operator.status}`
      });
    }

    // Update operator status
    await db.run(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // Create notification for the operator
    try {
      const notificationType = status === 'approved' ? 'operator_approved' : 'operator_denied';
      const notificationTitle = status === 'approved' ? 'Account Approved! ✅' : 'Account Application Update ❌';
      const notificationMessage = status === 'approved' 
        ? `Congratulations! Your operator account for "${operator.company_name}" has been approved. You can now create and publish flights.`
        : `Your operator account application for "${operator.company_name}" was not approved. ${reason ? `Reason: ${reason}` : 'Please contact support for more details.'}`;
      
      await createNotification(
        db,
        operator.id,
        notificationType,
        notificationTitle,
        notificationMessage,
        null
      );
      
      console.log(`✅ Created ${status} notification for operator ${operator.email}`);
    } catch (notificationError) {
      console.error('❌ Failed to create operator approval notification:', notificationError);
      // Don't fail the approval if notification fails
    }

    console.log(`Operator ${id} ${status} by admin ${req.user.email}`);

    res.json({
      message: `Operator ${status} successfully`,
      operator: {
        id: operator.id,
        email: operator.email,
        firstName: operator.first_name,
        lastName: operator.last_name,
        companyName: operator.company_name,
        status: status
      }
    });

  } catch (error) {
    console.error('Operator approval error:', error);
    res.status(500).json({
      error: 'Failed to update operator status'
    });
  }
});

module.exports = router;