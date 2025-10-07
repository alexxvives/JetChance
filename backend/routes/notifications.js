const express = require('express');
const router = express.Router();
const SimpleIDGenerator = require('../utils/idGenerator');
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/database-sqlite');

// Helper function to create notification
const createNotification = async (userId, title, message, type = 'general') => {
  try {
    const notificationId = SimpleIDGenerator.generateNotificationId();
    const sql = `
      INSERT INTO notifications (id, user_id, title, message, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const stmt = db.prepare(sql);
    stmt.run(notificationId, userId, title, message, type, new Date().toISOString());
    console.log('✅ Notification created:', notificationId, 'type:', type);
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
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const stmt = db.prepare(sql);
    const notifications = stmt.all(userId);
    res.json(notifications);
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

    const stmt = db.prepare(sql);
    const result = stmt.get(userId);
    res.json({ count: result.count || 0 });
  } catch (err) {
    console.error('❌ Error counting unread notifications:', err);
    res.status(500).json({ error: 'Failed to count notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  console.log('📬 Marking notification as read:', { id, userId });

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const sql = `
      UPDATE notifications
      SET read_at = ?
      WHERE id = ? AND user_id = ? AND read_at IS NULL
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(new Date().toISOString(), id, userId);
    
    console.log('✅ Mark as read result:', { changes: result.changes });
    
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
      SET read_at = ?
      WHERE user_id = ? AND read_at IS NULL
    `;

    const stmt = db.prepare(sql);
    const result = stmt.run(new Date().toISOString(), userId);
    res.json({ success: true, updated: result.changes });
  } catch (err) {
    console.error('❌ Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

module.exports = { router, createNotification };
