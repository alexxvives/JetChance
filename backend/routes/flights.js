const express = require('express');
const { body, query, validationResult } = require('express-validator');
const SimpleIDGenerator = require('../utils/idGenerator');
const db = require('../config/database-sqlite');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/flights
// @desc    Get all available flights with search and filter options
// @access  Public (customers see approved flights only)
router.get('/', [
  query('origin').optional().trim(),
  query('destination').optional().trim(),
  query('departure_date').optional().isISO8601(),
  query('passengers').optional().isInt({ min: 1, max: 20 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('aircraft_type').optional().trim(),
  query('user_id').optional().matches(/^[A-Z]{2,3}\d{3}$/),
  query('status').optional().isIn(['pending', 'approved', 'denied']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort_by').optional().isIn(['price', 'departure', 'duration']),
  query('sort_order').optional().isIn(['asc', 'desc']),
], async (req, res) => {
  try {
    console.log('=== FLIGHTS API CALLED ===');
    console.log('Query params:', req.query);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: errors.array()
      });
    }

    const {
      origin,
      destination,
      departure_date,
      passengers = 1,
      max_price,
      aircraft_type,
      user_id,
      page = 1,
      limit = 20,
      sort_by = 'departure',
      sort_order = 'asc'
    } = req.query;

    // Simple status filtering - default to approved flights for catalog
    let statusFilter = req.query.status || 'approved';
    let isOperatorOwned = false;
    let isSuperAdmin = false;
    let operatorId = null;
    
    // If user_id is provided, check if it's for operator viewing their own flights
    if (user_id) {
      const userResult = await db.query('SELECT role FROM users WHERE id = ?', [user_id]);
      if (userResult.rows.length > 0) {
        const userRole = userResult.rows[0].role;
        if (userRole === 'operator') {
          // Operator viewing their own flights
          isOperatorOwned = true;
          const operatorResult = await db.query('SELECT id FROM operators WHERE user_id = ?', [user_id]);
          if (operatorResult.rows.length > 0) {
            operatorId = operatorResult.rows[0].id;
          }
        } else if (userRole === 'super-admin') {
          // Super-admin viewing their operator flights
          isOperatorOwned = true;
          isSuperAdmin = true;
          const operatorResult = await db.query('SELECT id FROM operators WHERE user_id = ?', [user_id]);
          if (operatorResult.rows.length > 0) {
            operatorId = operatorResult.rows[0].id;
          }
        }
      }
    }

    // Build WHERE conditions
    let whereConditions = [];
    let params = [];

    // Status filtering based on role and query parameter
    if (statusFilter) {
      whereConditions.push(`f.status = ?`);
      params.push(statusFilter);
    }

    // Only show future flights for customers (when not viewing operator-specific flights)
    if (!isOperatorOwned && !isSuperAdmin && req.user && req.user.role === 'customer') {
      whereConditions.push(`f.departure_datetime > datetime('now')`);
    }

    // Passenger capacity filter
    whereConditions.push(`f.available_seats >= ?`);
    params.push(parseInt(passengers));

    if (origin) {
      whereConditions.push(`(f.origin_code LIKE ? OR f.origin_city LIKE ?)`);
      params.push(`%${origin}%`, `%${origin}%`);
    }

    if (destination) {
      whereConditions.push(`(f.destination_code LIKE ? OR f.destination_city LIKE ?)`);
      params.push(`%${destination}%`, `%${destination}%`);
    }

    if (departure_date) {
      whereConditions.push(`DATE(f.departure_datetime) = ?`);
      params.push(departure_date);
    }

    if (max_price) {
      whereConditions.push(`f.empty_leg_price <= ?`);
      params.push(parseFloat(max_price));
    }

    if (aircraft_type) {
      whereConditions.push(`f.aircraft_name LIKE ?`);
      params.push(`%${aircraft_type}%`);
    }

    if (operatorId && isOperatorOwned) {
      // For operators viewing their own flights
      whereConditions.push(`f.operator_id = ?`);
      params.push(operatorId);
    }

    // Build ORDER BY clause
    let orderBy = 'f.departure_datetime ASC';
    if (sort_by === 'price') {
      orderBy = `f.empty_leg_price ${sort_order.toUpperCase()}`;
    } else if (sort_by === 'departure') {
      orderBy = `f.departure_datetime ${sort_order.toUpperCase()}`;
    } else if (sort_by === 'duration') {
      orderBy = `f.estimated_duration_minutes ${sort_order.toUpperCase()}`;
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Main query
    const query = `
      SELECT 
        f.id,
        f.flight_number,
        f.origin_code,
        f.origin_name,
        f.origin_city,
        f.origin_country,
        f.destination_code,
        f.destination_name,
        f.destination_city,
        f.destination_country,
        f.departure_datetime,
        f.arrival_datetime,
        f.estimated_duration_minutes,
        f.original_price,
        f.empty_leg_price,
        f.currency,
        f.max_passengers,
        f.available_seats,
        f.status,
        f.description,
        f.aircraft_name,
        f.aircraft_image_url,
        o.company_name as operator_name
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count for pagination (without LIMIT and OFFSET)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    // Use original params without the LIMIT and OFFSET values
    const countParams = params.slice(0, -2);
    const countResult = await db.query(countQuery, countParams);
    const totalFlights = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalFlights / parseInt(limit));

    // Format response
    const flights = result.rows.map(flight => ({
      id: flight.id,
      flightNumber: flight.flight_number,
      origin: {
        code: flight.origin_code,
        name: flight.origin_name,
        city: flight.origin_city,
        country: flight.origin_country
      },
      destination: {
        code: flight.destination_code,
        name: flight.destination_name,
        city: flight.destination_city,
        country: flight.destination_country
      },
      schedule: {
        departure: flight.departure_datetime,
        arrival: flight.arrival_datetime,
        duration: flight.estimated_duration_minutes
      },
      pricing: {
        originalPrice: parseFloat(flight.original_price),
        emptyLegPrice: parseFloat(flight.empty_leg_price),
        currency: flight.currency,
        savings: parseFloat(flight.original_price) - parseFloat(flight.empty_leg_price),
        savingsPercent: Math.round(((parseFloat(flight.original_price) - parseFloat(flight.empty_leg_price)) / parseFloat(flight.original_price)) * 100)
      },
      capacity: {
        totalSeats: flight.total_seats,
        availableSeats: flight.available_seats
      },
      aircraft: {
        name: flight.aircraft_name || 'Private Jet',
        type: flight.aircraft_name || 'Private Jet',
        manufacturer: flight.aircraft_name ? flight.aircraft_name.split(' ')[0] : 'Unknown',
        model: flight.aircraft_name ? flight.aircraft_name.split(' ').slice(1).join(' ') : 'Private Jet',
        image: flight.aircraft_image_url
      },
      services: {
        catering: flight.catering_available,
        groundTransport: flight.ground_transport_available,
        wifi: flight.wifi_available,
        petsAllowed: flight.pets_allowed,
        flexibleDeparture: flight.flexible_departure
      },
      operator: {
        name: flight.operator_name,
        rating: parseFloat(flight.operator_rating) || 0,
        logo: flight.operator_logo
      },
      description: flight.description
    }));

    res.json({
      flights,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalFlights,
        hasMore: parseInt(page) < totalPages
      },
      filters: {
        origin,
        destination,
        departure_date,
        passengers: parseInt(passengers),
        max_price: max_price ? parseFloat(max_price) : null,
        aircraft_type
      }
    });

  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      error: 'Failed to fetch flights',
      message: 'Unable to search flights. Please try again.'
    });
  }
});

// @route   GET /api/flights/:id
// @desc    Get single flight details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting flight by ID:', id);

    const result = await db.query(`
      SELECT 
        f.*,
        o.company_name as operator_name,
        o.rating as operator_rating,
        o.total_flights as operator_total_flights,
        o.description as operator_description,
        o.logo_url as operator_logo,
        o.website_url as operator_website
      FROM flights f
      LEFT JOIN operators o ON f.operator_id = o.id
      WHERE f.id = ?
    `, [id]);

    console.log('📝 Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('❌ Flight not found');
      return res.status(404).json({
        error: 'Flight not found',
        message: 'The requested flight could not be found or is no longer available'
      });
    }

    const flight = result.rows[0];
    console.log('✅ Found flight:', flight);

    // Calculate actual duration from departure and arrival times
    let calculatedDuration = null;
    if (flight.departure_datetime && flight.arrival_datetime) {
      try {
        const departureTime = new Date(flight.departure_datetime);
        const arrivalTime = new Date(flight.arrival_datetime);
        
        console.log('📅 Calculating duration:');
        console.log('  Departure:', flight.departure_datetime, '→', departureTime);
        console.log('  Arrival:', flight.arrival_datetime, '→', arrivalTime);
        
        // Check if dates are valid
        if (!isNaN(departureTime.getTime()) && !isNaN(arrivalTime.getTime())) {
          const durationMs = arrivalTime - departureTime;
          console.log('  Duration MS:', durationMs);
          
          if (durationMs > 0) {
            const durationMinutes = Math.round(durationMs / (1000 * 60));
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            
            console.log('  Duration minutes:', durationMinutes, 'Hours:', hours, 'Minutes:', minutes);
            
            if (hours > 0) {
              calculatedDuration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
            } else {
              calculatedDuration = `${minutes}m`;
            }
          } else {
            calculatedDuration = 'Invalid: Arrival before departure';
          }
        } else {
          console.log('  ❌ Invalid date format');
          calculatedDuration = null;
        }
      } catch (error) {
        console.error('❌ Duration calculation error:', error);
        calculatedDuration = null;
      }
    }
    
    console.log('✅ Final calculated duration:', calculatedDuration);

    res.json({
      id: flight.id,
      flightNumber: flight.flight_number,
      origin: flight.origin_city,
      destination: flight.destination_city,
      origin_code: flight.origin_code,
      destination_code: flight.destination_code,
      departure_time: flight.departure_datetime,
      arrival_time: flight.arrival_datetime,
      duration: calculatedDuration,
      price: flight.price || flight.empty_leg_price,
      empty_leg_price: flight.empty_leg_price,
      original_price: flight.original_price,
      aircraft_type: flight.aircraft_type,
      aircraft_name: flight.aircraft_name,
      seats_available: flight.available_seats,
      status: flight.status,
      operator: flight.operator_name || 'Private Operator',
      operator_rating: flight.operator_rating,
      operator_total_flights: flight.operator_total_flights,
      description: flight.description,
      amenities: flight.amenities,
      aircraft_image_url: flight.aircraft_image_url,
      images: flight.aircraft_image_url ? [flight.aircraft_image_url] : []
    });

  } catch (error) {
    console.error('❌ Error fetching flight:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching the flight details'
    });
  }
});

// @route   POST /api/flights
// @desc    Create a new flight (operators only)
// @access  Private (Operator)
router.post('/', authenticate, authorize(['operator', 'admin', 'super-admin']), [
  body('aircraftId').optional().matches(/^[A-Z]{2,3}\d{3}$/),
  body('aircraftType').optional().trim(),
  body('originCode').isLength({ min: 3, max: 4 }),
  body('destinationCode').isLength({ min: 3, max: 4 }),
  body('departureDateTime').isISO8601(),
  body('originalPrice').isFloat({ min: 0 }),
  body('emptyLegPrice').isFloat({ min: 0 }),
  body('totalSeats').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Get operator ID
    const operatorResult = await db.query(
      'SELECT id FROM operators WHERE user_id = $1 AND status = $2',
      [req.user.id, 'approved']
    );

    if (operatorResult.rows.length === 0) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be an approved operator to create flights'
      });
    }

    const operatorId = operatorResult.rows[0].id;

    const {
      aircraftId,
      aircraftType = 'Private Jet',
      flightNumber,
      originCode,
      originName,
      originCity,
      originCountry,
      destinationCode,
      destinationName,
      destinationCity,
      destinationCountry,
      departureDateTime,
      arrivalDateTime,
      estimatedDuration,
      originalPrice,
      emptyLegPrice,
      totalSeats,
      minPassengers = 1,
      cateringAvailable = false,
      groundTransportAvailable = false,
      wifiAvailable = false,
      petsAllowed = false,
      smokingAllowed = false,
      flexibleDeparture = false,
      flexibleDestination = false,
      maxDelayMinutes = 30,
      description,
      specialRequirements,
      cancellationPolicy,
      aircraft_image // Image URL from frontend
    } = req.body;

    // Get operator ID for this user
    const userOperatorResult = await db.query(
      'SELECT id, company_name FROM operators WHERE user_id = $1',
      [req.user.id]
    );
    
    if (!userOperatorResult.rows.length) {
      return res.status(400).json({ error: 'No operator profile found for this user' });
    }
    
    const userOperatorId = userOperatorResult.rows[0].id;
    const operatorName = userOperatorResult.rows[0].company_name;

    // Use aircraft name directly from user input, no aircraft table dependency
    const aircraftName = aircraftType || 'Private Jet';
    
    // For backwards compatibility, we still need an aircraft_id in the database
    // But we'll just use a default one since we're not using the aircraft table anymore
    const selectedAircraftId = 'AC001'; // Default aircraft ID for database constraint

    // Generate simple flight ID
    const flightId = SimpleIDGenerator.generateFlightId();

    const result = await db.query(`
      INSERT INTO flights (
        id, operator_id, aircraft_id, aircraft_name, aircraft_image_url, origin_code, origin_name, origin_city, origin_country,
        destination_code, destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime, estimated_duration_minutes,
        original_price, empty_leg_price, available_seats, max_passengers,
        status, description, currency
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
      RETURNING *
    `, [
      flightId,
      userOperatorId, // Use the actual operator ID, not user ID
      selectedAircraftId,
      aircraftName, // Store the aircraft name directly
      aircraft_image, // Store the uploaded image URL
      originCode,
      originName || originCode,
      originName || originCode,
      originCountry || 'US',
      destinationCode,
      destinationName || destinationCode,
      destinationName || destinationCode,
      destinationCountry || 'US',
      departureDateTime,
      arrivalDateTime,
      parseInt(estimatedDuration) || 120, // Duration in minutes
      originalPrice,
      emptyLegPrice,
      totalSeats,
      totalSeats,
      'pending',
      description || 'Private jet flight',
      'USD'
    ]);

    const newFlight = result.rows[0];

    res.status(201).json({
      message: 'Flight created successfully',
      flight: {
        id: newFlight.id,
        origin: `${newFlight.origin_city} (${newFlight.origin_code})`,
        destination: `${newFlight.destination_city} (${newFlight.destination_code})`,
        departure: newFlight.departure_datetime,
        arrival: newFlight.arrival_datetime,
        price: parseFloat(newFlight.empty_leg_price),
        originalPrice: parseFloat(newFlight.original_price),
        seatsAvailable: newFlight.available_seats,
        maxPassengers: newFlight.max_passengers,
        duration: newFlight.estimated_duration_minutes,
        status: newFlight.status,
        description: newFlight.description,
        aircraftName: newFlight.aircraft_name
      }
    });

  } catch (error) {
    console.error('Flight creation error:', error);
    res.status(500).json({
      error: 'Failed to create flight',
      message: 'Unable to create flight. Please try again.'
    });
  }
});

// @route   PUT /api/flights/:id
// @desc    Update flight details (operators only)
// @access  Private (Operator)
router.put('/:id', authenticate, authorize(['operator', 'admin', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get operator ID
    const operatorResult = await db.query(
      'SELECT id FROM operators WHERE user_id = $1',
      [req.user.id]
    );

    if (operatorResult.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Operator account required'
      });
    }

    const operatorId = operatorResult.rows[0]?.id;

    // Check flight ownership (unless admin)
    let flightCheck;
    if (req.user.role === 'admin') {
      flightCheck = await db.query('SELECT id FROM flights WHERE id = $1', [id]);
    } else {
      flightCheck = await db.query('SELECT id FROM flights WHERE id = $1 AND operator_id = $2', [id, operatorId]);
    }

    if (flightCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Flight not found',
        message: 'Flight not found or access denied'
      });
    }

    const updates = {};
    const allowedUpdates = [
      'emptyLegPrice', 'availableSeats', 'description', 'cateringAvailable',
      'groundTransportAvailable', 'wifiAvailable', 'flexibleDeparture',
      'specialRequirements', 'cancellationPolicy', 'status'
    ];

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        const dbField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updates[dbField] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No updates provided'
      });
    }

    updates.updated_at = "datetime('now')";

    const setClause = Object.entries(updates)
      .map(([key, value], index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(updates)];

    const result = await db.query(
      `UPDATE flights SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );

    res.json({
      message: 'Flight updated successfully',
      flight: result.rows[0]
    });

  } catch (error) {
    console.error('Flight update error:', error);
    res.status(500).json({
      error: 'Failed to update flight'
    });
  }
});

// @route   DELETE /api/flights/:id
// @desc    Delete/cancel flight (operators only)
// @access  Private (Operator)
router.delete('/:id', authenticate, authorize(['operator', 'admin', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get operator ID
    const operatorResult = await db.query(
      'SELECT id FROM operators WHERE user_id = $1',
      [req.user.id]
    );

    if (operatorResult.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const operatorId = operatorResult.rows[0]?.id;

    // Check for existing bookings
    const bookingCheck = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE flight_id = $1 AND status IN ($2, $3)',
      [id, 'confirmed', 'paid']
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      // Can't delete, but can cancel
      await db.query(
        "UPDATE flights SET status = $1, updated_at = datetime('now') WHERE id = $2",
        ['cancelled', id]
      );

      return res.json({
        message: 'Flight cancelled due to existing bookings'
      });
    }

    // Delete flight if no bookings
    let deleteResult;
    if (req.user.role === 'admin') {
      deleteResult = await db.query('DELETE FROM flights WHERE id = $1 RETURNING id', [id]);
    } else {
      deleteResult = await db.query(
        'DELETE FROM flights WHERE id = $1 AND operator_id = $2 RETURNING id',
        [id, operatorId]
      );
    }

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Flight not found'
      });
    }

    res.json({
      message: 'Flight deleted successfully'
    });

  } catch (error) {
    console.error('Flight deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete flight'
    });
  }
});

// @route   PUT /api/flights/:id/approve
// @desc    Approve or decline a pending flight (admin/super-admin only)
// @access  Admin/Super-Admin
router.put('/:id/approve', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    // Validate status
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be either "approved" or "declined"'
      });
    }

    const flightId = req.params.id;
    
    // Check if flight exists and is pending
    const flight = await db.query('SELECT * FROM flights WHERE id = ?', [flightId]);
    
    if (flight.rows.length === 0) {
      return res.status(404).json({
        error: 'Flight not found'
      });
    }

    if (flight.rows[0].status !== 'pending') {
      return res.status(400).json({
        error: 'Only pending flights can be approved or declined'
      });
    }

    // Update flight status
    const result = await db.query(`
      UPDATE flights 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
      RETURNING *
    `, [status, flightId]);

    console.log(`Flight ${flightId} ${status} by admin ${req.user.email}`);

    res.json({
      message: `Flight ${status} successfully`,
      flight: result.rows[0]
    });

  } catch (error) {
    console.error('Flight approval error:', error);
    res.status(500).json({
      error: 'Failed to update flight status'
    });
  }
});

module.exports = router;