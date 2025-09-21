const express = require('express');
const router = express.Router();
const SimpleIDGenerator = require('../utils/idGenerator');
const { authenticate } = require('../middleware/auth');
const db = require('../config/database-sqlite');

// Helper function to create notification
const createNotification = async (db, userId, type, title, message, flightId = null) => {
  try {
    const notificationId = SimpleIDGenerator.generateNotificationId();
    const sql = `
      INSERT INTO notifications (id, user_id, type, title, message, flight_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(sql, [notificationId, userId, type, title, message, flightId]);
    console.log('✅ Notification created:', notificationId);
    return notificationId;
  } catch (err) {
    console.error('❌ Error creating notification:', err);
    throw err;
  }
};

// GET /api/notifications - Get notifications for user
router.get('/', authenticate, async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const sql = `
      SELECT 
        n.*,
        f.origin_code,
        f.destination_code,
        f.departure_datetime
      FROM notifications n
      LEFT JOIN flights f ON n.flight_id = f.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `;

    const result = await db.query(sql, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticate, async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const sql = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND read_at IS NULL
    `;

    const result = await db.query(sql, [userId]);
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('❌ Error counting unread notifications:', err);
    res.status(500).json({ error: 'Failed to count notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const sql = `
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND read_at IS NULL
    `;

    const result = await db.query(sql, [id, userId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found or already read' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch('/mark-all-read', authenticate, async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const sql = `
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND read_at IS NULL
    `;

    const result = await db.query(sql, [userId]);
    res.json({ success: true, updated: result.changes });
  } catch (err) {
    console.error('❌ Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

module.exports = { router, createNotification };