const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const router = express.Router();

// Initialize database connection
const dbPath = path.join(__dirname, '..', 'jetchance.db');
const db = new Database(dbPath);

// Create airports table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'pending',
    created_by INTEGER,
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET /api/airports - Get all approved airports (for autocomplete)
router.get('/', (req, res) => {
  try {
    const query = req.query.q;
    let airports;
    
    if (query) {
      // Search approved airports by code, name, city, or country
      const searchPattern = `%${query}%`;
      airports = db.prepare(`
        SELECT * FROM airports 
        WHERE status = 'approved' AND (code LIKE ? OR name LIKE ? OR city LIKE ? OR country LIKE ?)
        ORDER BY code
      `).all(searchPattern, searchPattern, searchPattern, searchPattern);
    } else {
      // Get all approved airports
      airports = db.prepare('SELECT * FROM airports WHERE status = \'approved\' ORDER BY code').all();
    }
    
    res.json(airports);
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ error: 'Failed to fetch airports' });
  }
});

// POST /api/airports - Create a new custom airport (pending approval)
router.post('/', (req, res) => {
  try {
    const { code, name, city, country, latitude, longitude } = req.body;
    const userId = req.user?.id; // Get user ID from auth middleware if available
    
    // Validate required fields
    if (!code || !name || !city || !country) {
      return res.status(400).json({ 
        error: 'Code, name, city, and country are required' 
      });
    }
    
    // Insert new airport as pending
    const stmt = db.prepare(`
      INSERT INTO airports (code, name, city, country, latitude, longitude, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `);
    
    const result = stmt.run(
      code.toUpperCase(),
      name,
      city,
      country,
      latitude || null,
      longitude || null,
      userId || null
    );
    
    // Return the created airport
    const newAirport = db.prepare('SELECT * FROM airports WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newAirport);
  } catch (error) {
    console.error('Error creating airport:', error);
    
    // Handle unique constraint error for airport code
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ 
        error: 'Airport code already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create airport' });
  }
});

// GET /api/airports/:id - Get a specific airport
router.get('/:id', (req, res) => {
  try {
    const airport = db.prepare('SELECT * FROM airports WHERE id = ?').get(req.params.id);
    
    if (!airport) {
      return res.status(404).json({ error: 'Airport not found' });
    }
    
    res.json(airport);
  } catch (error) {
    console.error('Error fetching airport:', error);
    res.status(500).json({ error: 'Failed to fetch airport' });
  }
});

// GET /api/airports/pending - Get all pending airports (super admin only)
router.get('/admin/pending', (req, res) => {
  try {
    // TODO: Add super admin auth middleware check
    
    const pendingAirports = db.prepare(`
      SELECT 
        a.*,
        u.email as created_by_email,
        o.company_name as operator_company_name
      FROM airports a 
      LEFT JOIN users u ON CAST(a.created_by AS TEXT) = u.id 
      LEFT JOIN operators o ON u.id = o.user_id
      WHERE a.status = 'pending' 
      ORDER BY a.created_at DESC
    `).all();
    
    console.log('📡 Pending airports with operator info:', pendingAirports);
    res.json(pendingAirports);
  } catch (error) {
    console.error('Error fetching pending airports:', error);
    res.status(500).json({ error: 'Failed to fetch pending airports' });
  }
});

// POST /api/airports/admin/approve/:id - Approve a pending airport
router.post('/admin/approve/:id', (req, res) => {
  try {
    // TODO: Add super admin auth middleware check
    const { latitude, longitude } = req.body;
    const airportId = req.params.id;
    const reviewerId = req.user?.id;
    
    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required for approval' 
      });
    }
    
    // Update airport status to approved and add coordinates
    const stmt = db.prepare(`
      UPDATE airports 
      SET status = 'approved', 
          latitude = ?, 
          longitude = ?, 
          reviewed_by = ?, 
          reviewed_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'pending'
    `);
    
    const result = stmt.run(latitude, longitude, reviewerId, airportId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pending airport not found' });
    }
    
    // Return updated airport
    const updatedAirport = db.prepare('SELECT * FROM airports WHERE id = ?').get(airportId);
    res.json(updatedAirport);
  } catch (error) {
    console.error('Error approving airport:', error);
    res.status(500).json({ error: 'Failed to approve airport' });
  }
});

// POST /api/airports/admin/reject/:id - Reject a pending airport
router.post('/admin/reject/:id', (req, res) => {
  try {
    // TODO: Add super admin auth middleware check
    const airportId = req.params.id;
    const reviewerId = req.user?.id;
    
    // Update airport status to rejected
    const stmt = db.prepare(`
      UPDATE airports 
      SET status = 'rejected', 
          reviewed_by = ?, 
          reviewed_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'pending'
    `);
    
    const result = stmt.run(reviewerId, airportId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pending airport not found' });
    }
    
    // Return updated airport
    const updatedAirport = db.prepare('SELECT * FROM airports WHERE id = ?').get(airportId);
    res.json(updatedAirport);
  } catch (error) {
    console.error('Error rejecting airport:', error);
    res.status(500).json({ error: 'Failed to reject airport' });
  }
});

module.exports = router;