const express = require('express');
const { query, run } = require('../config/database-sqlite');
const router = express.Router();

// Ensure quotes table exists
const createQuotesTable = async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        service_type TEXT NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        departure_date TEXT,
        departure_time TEXT,
        passengers INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        contact_status TEXT DEFAULT 'not_contacted',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        seen_at DATETIME
      )
    `);
    
    // Add contact_status column if it doesn't exist (for existing databases)
    try {
      await run(`ALTER TABLE quotes ADD COLUMN contact_status TEXT DEFAULT 'not_contacted'`);
    } catch (alterError) {
      // Column probably already exists, ignore error
    }
  } catch (error) {
    console.error('Error creating quotes table:', error);
  }
};

// Initialize table
createQuotesTable();

// Get all quotes (admin only)
router.get('/', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        id,
        name,
        email,
        phone,
        service_type,
        origin,
        destination,
        departure_date,
        departure_time,
        passengers,
        notes,
        contact_status,
        created_at,
        seen_at
      FROM quotes 
      ORDER BY created_at DESC
    `;
    
    const result = await query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Create new quote
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      service_type,
      origin,
      destination,
      departure_date,
      departure_time,
      passengers,
      notes
    } = req.body;

    console.log('📝 Creating new quote:', { name, email, service_type, origin, destination });

    const result = await run(
      `INSERT INTO quotes (
        name, email, phone, service_type, origin, destination,
        departure_date, departure_time, passengers, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, service_type, origin, destination, departure_date, departure_time, passengers, notes]
    );

    console.log('✅ Quote created with ID:', result.lastID);

    res.status(201).json({
      success: true,
      quoteId: result.lastID,
      message: 'Quote submitted successfully'
    });
  } catch (error) {
    console.error('❌ Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Mark quotes as seen
router.patch('/mark-seen', async (req, res) => {
  try {
    await run(
      'UPDATE quotes SET seen_at = CURRENT_TIMESTAMP WHERE seen_at IS NULL'
    );
    res.json({ success: true, message: 'Quotes marked as seen' });
  } catch (error) {
    console.error('Error marking quotes as seen:', error);
    res.status(500).json({ error: 'Failed to mark quotes as seen' });
  }
});

// Get unseen quotes count
router.get('/unseen-count', async (req, res) => {
  try {
    const queryText = 'SELECT COUNT(*) as count FROM quotes WHERE seen_at IS NULL';
    const result = await query(queryText);
    const count = result.rows[0]?.count || 0;
    res.json({ count });
  } catch (error) {
    console.error('Error getting unseen quotes count:', error);
    res.status(500).json({ error: 'Failed to get unseen quotes count' });
  }
});

// Update quote contact status
router.patch('/:id/contact-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_status } = req.body;

    // Validate contact status
    const validStatuses = ['not_contacted', 'contacted'];
    if (!validStatuses.includes(contact_status)) {
      return res.status(400).json({ 
        error: 'Invalid contact status. Must be: not_contacted or contacted' 
      });
    }

    const result = await run(
      'UPDATE quotes SET contact_status = ? WHERE id = ?',
      [contact_status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ 
      success: true, 
      message: `Quote contact status updated to ${contact_status}` 
    });
  } catch (error) {
    console.error('Error updating quote contact status:', error);
    res.status(500).json({ error: 'Failed to update contact status' });
  }
});

module.exports = router;