const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const router = express.Router();

// Initialize database connection
const dbPath = path.join(__dirname, '..', 'jetchance.db');
const db = new Database(dbPath);

// City coordinates organized by country-city for accurate matching
const CITY_COORDINATES = {
  // Colombia (CO)
  'CO-BOGOTÁ': { lat: 4.7110, lng: -74.0721 },
  'CO-BOGOTA': { lat: 4.7110, lng: -74.0721 },
  'CO-MEDELLÍN': { lat: 6.2442, lng: -75.5812 },
  'CO-MEDELLIN': { lat: 6.2442, lng: -75.5812 },
  'CO-CALI': { lat: 3.4516, lng: -76.5320 },
  'CO-BARRANQUILLA': { lat: 10.9639, lng: -74.7964 },
  'CO-CARTAGENA': { lat: 10.3910, lng: -75.4794 },
  'CO-BUCARAMANGA': { lat: 7.1253, lng: -73.1198 },
  'CO-PEREIRA': { lat: 4.8133, lng: -75.6961 },
  'CO-CUCUTA': { lat: 7.8939, lng: -72.5078 },
  'CO-IBAGUE': { lat: 4.4389, lng: -75.2322 },
  'CO-SANTA MARTA': { lat: 11.2408, lng: -74.1990 },
  'CO-VILLAVICENCIO': { lat: 4.1420, lng: -73.6266 },
  'CO-PASTO': { lat: 1.2136, lng: -77.2811 },
  'CO-MONTERÍA': { lat: 8.7479, lng: -75.8814 },
  'CO-VALLEDUPAR': { lat: 10.4731, lng: -73.2532 },
  'CO-MANIZALES': { lat: 5.0703, lng: -75.5138 },
  'CO-NEIVA': { lat: 2.9273, lng: -75.2819 },
  'CO-ARMENIA': { lat: 4.5339, lng: -75.6811 },
  
  // Venezuela (VE)
  'VE-CARACAS': { lat: 10.4806, lng: -66.9036 },
  'VE-MARACAIBO': { lat: 10.6316, lng: -71.6419 },
  'VE-VALENCIA': { lat: 10.1620, lng: -68.0077 },
  'VE-BARQUISIMETO': { lat: 10.0647, lng: -69.3570 },
  'VE-SAN CRISTÓBAL': { lat: 7.7669, lng: -72.2252 },
  'VE-SAN CRISTOBAL': { lat: 7.7669, lng: -72.2252 },
  
  // USA (US or USA)
  'US-MIAMI': { lat: 25.7617, lng: -80.1918 },
  'USA-MIAMI': { lat: 25.7617, lng: -80.1918 },
  'US-NEW YORK': { lat: 40.7128, lng: -74.0060 },
  'USA-NEW YORK': { lat: 40.7128, lng: -74.0060 },
  'US-LOS ANGELES': { lat: 34.0522, lng: -118.2437 },
  'USA-LOS ANGELES': { lat: 34.0522, lng: -118.2437 },
  'US-CHICAGO': { lat: 41.8781, lng: -87.6298 },
  'USA-CHICAGO': { lat: 41.8781, lng: -87.6298 },
  'US-HOUSTON': { lat: 29.7604, lng: -95.3698 },
  'USA-HOUSTON': { lat: 29.7604, lng: -95.3698 },
  'US-ATLANTA': { lat: 33.7490, lng: -84.3880 },
  'USA-ATLANTA': { lat: 33.7490, lng: -84.3880 },
  'US-BOSTON': { lat: 42.3601, lng: -71.0589 },
  'USA-BOSTON': { lat: 42.3601, lng: -71.0589 },
  'US-SEATTLE': { lat: 47.6062, lng: -122.3321 },
  'USA-SEATTLE': { lat: 47.6062, lng: -122.3321 },
  'US-SAN FRANCISCO': { lat: 37.7749, lng: -122.4194 },
  'USA-SAN FRANCISCO': { lat: 37.7749, lng: -122.4194 },
  'US-LAS VEGAS': { lat: 36.1699, lng: -115.1398 },
  'USA-LAS VEGAS': { lat: 36.1699, lng: -115.1398 },
  'US-DALLAS': { lat: 32.7767, lng: -96.7970 },
  'USA-DALLAS': { lat: 32.7767, lng: -96.7970 },
  
  // Mexico (MX)
  'MX-MEXICO CITY': { lat: 19.4326, lng: -99.1332 },
  'MX-CANCUN': { lat: 21.1619, lng: -86.8515 },
  'MX-GUADALAJARA': { lat: 20.6597, lng: -103.3496 },
  'MX-MONTERREY': { lat: 25.6866, lng: -100.3161 },
  
  // Spain (ES)
  'ES-MADRID': { lat: 40.4168, lng: -3.7038 },
  'ES-BARCELONA': { lat: 41.3874, lng: 2.1686 },
  'ES-VALENCIA': { lat: 39.4699, lng: -0.3763 },
  'ES-SEVILLA': { lat: 37.3891, lng: -5.9845 },
  
  // Argentina (AR)
  'AR-BUENOS AIRES': { lat: -34.6037, lng: -58.3816 },
  'AR-CÓRDOBA': { lat: -31.4201, lng: -64.1888 },
  'AR-CORDOBA': { lat: -31.4201, lng: -64.1888 },
  'AR-ROSARIO': { lat: -32.9442, lng: -60.6505 },
  'AR-MENDOZA': { lat: -32.8895, lng: -68.8458 }
};

// Helper function to get city coordinates with country-city key
const getCityCoordinates = (cityName, countryCode) => {
  if (!cityName) return null;
  
  const normalizedCity = cityName.toUpperCase().trim();
  const normalizedCountry = countryCode ? countryCode.toUpperCase().trim() : null;
  
  // First try: country-city key (most accurate)
  if (normalizedCountry) {
    const key = `${normalizedCountry}-${normalizedCity}`;
    if (CITY_COORDINATES[key]) {
      console.log(`🎯 Found coordinates for ${key}`);
      return CITY_COORDINATES[key];
    }
  }
  
  // Fallback: try without country (for backward compatibility, but less accurate)
  console.log(`⚠️  No country-city match found, trying city-only for: ${normalizedCity}`);
  return null;
};

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
    
    // If coordinates are not provided, try to get city center coordinates as temporary fallback
    let finalLatitude = latitude;
    let finalLongitude = longitude;
    
    if (!latitude || !longitude) {
      const cityCoords = getCityCoordinates(city, country);
      if (cityCoords) {
        finalLatitude = cityCoords.lat;
        finalLongitude = cityCoords.lng;
        console.log(`🏙️ Using city center coordinates for ${city}, ${country}: ${finalLatitude}, ${finalLongitude}`);
      } else {
        console.log(`⚠️ No coordinates available for city: ${city}, ${country}`);
      }
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
      finalLatitude || null,
      finalLongitude || null,
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