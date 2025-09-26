const express = require('express');
const { body, query, validationResult } = require('express-validator');
const SimpleIDGenerator = require('../utils/idGenerator');
const OperatorFlightCounter = require('../utils/operatorFlightCounter');
const { query: dbQuery, run: dbRun, db } = require('../config/database-sqlite');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('./notifications');

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
  query('user_id').optional().matches(/^[A-Z]{2,3}\d{6}$/),
  query('status').optional().isIn(['pending', 'approved', 'declined', 'available', 'cancelled', 'booked']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort_by').optional().isIn(['price', 'departure', 'duration']),
  query('sort_order').optional().isIn(['asc', 'desc']),
], async (req, res) => {
  try {
    console.log('🔍 FLIGHTS: Starting flight fetch request');
    console.log('🔍 FLIGHTS: Query params:', req.query);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ FLIGHTS: Validation errors:', errors.array());
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

    // Simple status filtering - default to available flights for catalog
    let statusFilter = req.query.status || 'available';
    let isOperatorOwned = false;
    let isSuperAdmin = false;
    let operatorId = null;
    
    // If user_id is provided, check if it's for operator viewing their own flights
    if (user_id) {
      const userStmt = db.prepare('SELECT role FROM users WHERE id = ?');
      const userResult = userStmt.get(user_id);
      if (userResult) {
        const userRole = userResult.role;
        if (userRole === 'operator') {
          // Operator viewing their own flights - show ALL statuses (pending, approved, declined)
          isOperatorOwned = true;
          statusFilter = req.query.status || null; // Allow all statuses if no specific status requested
          const operatorStmt = db.prepare('SELECT id FROM operators WHERE user_id = ?');
          const operatorResult = operatorStmt.get(user_id);
          if (operatorResult) {
            operatorId = operatorResult.id;
          }
        } else if (userRole === 'super-admin') {
          // Super-admin viewing their operator flights - show ALL statuses
          isOperatorOwned = true;
          isSuperAdmin = true;
          statusFilter = req.query.status || null; // Allow all statuses if no specific status requested
          const operatorStmt = db.prepare('SELECT id FROM operators WHERE user_id = ?');
          const operatorResult = operatorStmt.get(user_id);
          if (operatorResult) {
            operatorId = operatorResult.id;
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

    // Only show future flights for customers and public catalog (always exclude past flights for non-operators)
    if (!isOperatorOwned && !isSuperAdmin) {
      whereConditions.push(`f.departure_datetime > datetime('now')`);
    }

    // Passenger capacity filter - only apply for public searches, not for operators viewing their own flights
    if (!isOperatorOwned && !isSuperAdmin) {
      whereConditions.push(`f.available_seats >= ?`);
      params.push(parseInt(passengers));
    }

    if (origin) {
      whereConditions.push(`(f.origin_city LIKE ? OR f.origin_name LIKE ?)`);
      params.push(`%${origin}%`, `%${origin}%`);
    }

    if (destination) {
      whereConditions.push(`(f.destination_city LIKE ? OR f.destination_name LIKE ?)`);
      params.push(`%${destination}%`, `%${destination}%`);
    }

    if (departure_date) {
      whereConditions.push(`DATE(f.departure_datetime) = ?`);
      params.push(departure_date);
    }

    if (max_price) {
      whereConditions.push(`f.seat_leg_price <= ?`);
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
      orderBy = `f.seat_leg_price ${sort_order.toUpperCase()}`;
    } else if (sort_by === 'departure') {
      orderBy = `f.departure_datetime ${sort_order.toUpperCase()}`;
    } else if (sort_by === 'duration') {
      // Calculate duration for sorting using SQLite julianday function
      orderBy = `(julianday(f.arrival_datetime) - julianday(f.departure_datetime)) * 24 * 60 ${sort_order.toUpperCase()}`;
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (whereConditions.length === 0) {
      whereConditions.push('1=1');
    }

    // Main query
    const query = `
      SELECT 
        f.id,
        f.operator_id,
        f.aircraft_model,
        f.origin_name,
        f.origin_city,
        f.origin_country,
        f.destination_name,
        f.destination_city,
        f.destination_country,
        f.departure_datetime,
        f.arrival_datetime,
        f.available_seats,
        f.total_seats,
        f.empty_leg_price,
        f.market_price,
        f.status,
        f.description,
        f.images,
        o.company_name as operator_name
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);

    const stmt = db.prepare(query);
    const result = stmt.all(...params);

    // Get total count for pagination (without LIMIT and OFFSET)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    // Use original params without the LIMIT and OFFSET values
    const countParams = params.slice(0, -2);
    const countStmt = db.prepare(countQuery);
    const countResult = countStmt.get(...countParams);
    const totalFlights = parseInt(countResult.total);
    const totalPages = Math.ceil(totalFlights / parseInt(limit));

    // Format response
    const flights = result.map(flight => {
      // Parse images from JSON and convert to full URLs
      let images = [];
      let imageUrls = [];
      try {
        images = flight.images ? JSON.parse(flight.images) : [];
        // Convert to full URLs, handling both relative paths and existing full URLs
        imageUrls = images.map(imagePath => {
          // If it's already a full URL, return as-is
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
          }
          // If it's a relative path, convert to full URL
          // Handle both "aircraft/..." and "uploads/aircraft/..." formats
          const cleanPath = imagePath.startsWith('uploads/') ? imagePath.substring(8) : imagePath;
          return `${req.protocol}://${req.get('host')}/uploads/${cleanPath}`;
        });
      } catch (e) {
        console.warn('Error parsing flight images:', flight.images);
        images = [];
        imageUrls = [];
      }

      // Calculate flight time/duration
      let flightTime = null;
      let flightTimeMinutes = null;
      if (flight.departure_datetime && flight.arrival_datetime) {
        const departure = new Date(flight.departure_datetime);
        const arrival = new Date(flight.arrival_datetime);
        const durationMs = arrival - departure;
        flightTimeMinutes = Math.round(durationMs / (1000 * 60));
        
        // Format flight time based on duration
        const hours = Math.floor(flightTimeMinutes / 60);
        const minutes = flightTimeMinutes % 60;
        
        if (flightTimeMinutes < 60) {
          // Less than 1 hour: show only minutes (e.g., "45 minutes")
          flightTime = `${flightTimeMinutes} minutes`;
        } else {
          // 1 hour or more: show hours and minutes (e.g., "2h 30m" or "3h")
          if (minutes > 0) {
            flightTime = `${hours}h ${minutes}m`;
          } else {
            flightTime = `${hours}h`;
          }
        }
      }

      // Extract airport codes from names (format: "Airport Name (CODE)")
      const originCodeMatch = flight.origin_name?.match(/\(([^)]+)\)$/);
      const destinationCodeMatch = flight.destination_name?.match(/\(([^)]+)\)$/);
      const originCode = originCodeMatch ? originCodeMatch[1] : flight.origin_city;
      const destinationCode = destinationCodeMatch ? destinationCodeMatch[1] : flight.destination_city;

      return {
        id: flight.id,
        operator_id: flight.operator_id,
        origin_name: flight.origin_name,
        origin_city: flight.origin_city,
        origin_country: flight.origin_country,
        origin_code: originCode, // Extracted from parentheses
        destination_name: flight.destination_name,
        destination_city: flight.destination_city,
        destination_country: flight.destination_country,
        destination_code: destinationCode, // Extracted from parentheses
        departure_time: flight.departure_datetime,
        arrival_time: flight.arrival_datetime,
        flight_time: flightTime,
        duration: flightTimeMinutes, // Duration in minutes for sorting/filtering
  empty_leg_price: parseFloat(flight.empty_leg_price),
  market_price: parseFloat(flight.market_price),
  available_seats: flight.available_seats,
  total_seats: flight.total_seats,
        status: flight.status,
        description: flight.description,
        images: imageUrls,
        operator_name: flight.operator_name,
        aircraft_model: flight.aircraft_model || null,
        aircraft_name: flight.aircraft_model || null, // Use aircraft_model for backward compatibility
        seat_leg_price: parseFloat(flight.empty_leg_price), // Legacy name
        seat_market_price: parseFloat(flight.market_price), // Legacy name
  seats_available: flight.available_seats,
  max_passengers: flight.total_seats,
        aircraft_image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        // Legacy format for backward compatibility
        aircraft: {
          name: 'Private Jet', // Generic since we removed aircraft table
          image: imageUrls.length > 0 ? imageUrls[0] : null,
          images: imageUrls
        },
        pricing: {
          emptyLegPrice: parseFloat(flight.empty_leg_price),
          originalPrice: parseFloat(flight.market_price),
          savings: parseFloat(flight.market_price) - parseFloat(flight.empty_leg_price)
        }
      };
    });

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

    const stmt = db.prepare(`
      SELECT 
        f.*,
        o.company_name as operator_name,
        o.total_flights as operator_total_flights
      FROM flights f
      LEFT JOIN operators o ON f.operator_id = o.id
      WHERE f.id = ?
    `);
    const result = stmt.get(id);

    console.log('📝 Query result:', result);

    if (!result) {
      console.log('❌ Flight not found');
      return res.status(404).json({
        error: 'Flight not found',
        message: 'The requested flight could not be found or is no longer available'
      });
    }

    const flight = result;
    console.log('✅ Found flight:', flight);

    // Note: Duration calculation removed as estimated_duration_minutes column was removed in optimization

    // Parse images from JSON and convert to full URLs
    let images = [];
    let imageUrls = [];
    try {
      images = flight.images ? JSON.parse(flight.images) : [];
      // Convert to full URLs, handling both relative paths and existing full URLs
      imageUrls = images.map(imagePath => {
        // If it's already a full URL, return as-is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }
        // If it's a relative path, convert to full URL
        // Handle both "aircraft/..." and "uploads/aircraft/..." formats
        const cleanPath = imagePath.startsWith('uploads/') ? imagePath.substring(8) : imagePath;
        return `${req.protocol}://${req.get('host')}/uploads/${cleanPath}`;
      });
    } catch (e) {
      console.warn('Error parsing flight images:', flight.images);
      images = [];
      imageUrls = [];
    }

    // Calculate flight time/duration
    let flightTime = null;
    let flightTimeMinutes = null;
    if (flight.departure_datetime && flight.arrival_datetime) {
      const departure = new Date(flight.departure_datetime);
      const arrival = new Date(flight.arrival_datetime);
      const durationMs = arrival - departure;
      flightTimeMinutes = Math.round(durationMs / (1000 * 60));
      
      // Format flight time based on duration
      const hours = Math.floor(flightTimeMinutes / 60);
      const minutes = flightTimeMinutes % 60;
      
      if (flightTimeMinutes < 60) {
        // Less than 1 hour: show only minutes (e.g., "45 minutes")
        flightTime = `${flightTimeMinutes} minutes`;
      } else {
        // 1 hour or more: show hours and minutes (e.g., "2h 30m" or "3h")
        if (minutes > 0) {
          flightTime = `${hours}h ${minutes}m`;
        } else {
          flightTime = `${hours}h`;
        }
      }
    }

    // Extract airport codes from names (format: "Airport Name (CODE)")
    const originCodeMatch = flight.origin_name?.match(/\(([^)]+)\)$/);
    const destinationCodeMatch = flight.destination_name?.match(/\(([^)]+)\)$/);
    const originCode = originCodeMatch ? originCodeMatch[1] : flight.origin_city;
    const destinationCode = destinationCodeMatch ? destinationCodeMatch[1] : flight.destination_city;

    res.json({
      id: flight.id,
      operator_id: flight.operator_id,
      aircraft_model: flight.aircraft_model,
      origin_name: flight.origin_name,
      origin_city: flight.origin_city,
      origin_country: flight.origin_country,
      origin_code: originCode,
      destination_name: flight.destination_name,
      destination_city: flight.destination_city,
      destination_country: flight.destination_country,
      destination_code: destinationCode,
      departure_time: flight.departure_datetime,
      arrival_time: flight.arrival_datetime,
      flight_time: flightTime,
      duration: flightTimeMinutes, // Duration in minutes
  empty_leg_price: parseFloat(flight.empty_leg_price),
  market_price: parseFloat(flight.market_price),
  available_seats: flight.available_seats,
  total_seats: flight.total_seats,
      status: flight.status,
      description: flight.description,
      operator_name: flight.operator_name,
      operator_total_flights: flight.operator_total_flights,
      images: imageUrls,
      aircraft_image_url: imageUrls.length > 0 ? imageUrls[0] : null,
      // Legacy compatibility fields
      price: parseFloat(flight.empty_leg_price),
      original_price: parseFloat(flight.market_price),
      aircraft_name: flight.aircraft_model,
  seats_available: flight.available_seats,
  max_passengers: flight.total_seats,
      operator: flight.operator_name
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
      'SELECT id FROM operators WHERE user_id = ?',
      [req.user.id]
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
      aircraftType,
      aircraft_model,
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
      aircraft_image, // Single image URL for backwards compatibility
      images = [] // Array of image URLs from frontend
    } = req.body;

    // Get operator ID for this user
    const userOperatorResult = await db.query(
      'SELECT id, company_name FROM operators WHERE user_id = ?',
      [req.user.id]
    );
    
    if (!userOperatorResult.rows.length) {
      return res.status(400).json({ error: 'No operator profile found for this user' });
    }
    
    const userOperatorId = userOperatorResult.rows[0].id;
    const operatorName = userOperatorResult.rows[0].company_name;

    // Use aircraft name directly from user input, no aircraft table dependency
    const aircraftName = aircraftType;
    
    // For backwards compatibility, we still need an aircraft_id in the database
    // But we'll just use a default one since we're not using the aircraft table anymore
    const selectedAircraftId = 'AC001'; // Default aircraft ID for database constraint

    // Generate simple flight ID
    const flightId = SimpleIDGenerator.generateFlightId();

    // Prepare images array - use provided images or fallback to single aircraft_image
    // Normalize to relative paths to ensure consistency
    let imageUrls = [];
    if (images && Array.isArray(images) && images.length > 0) {
      imageUrls = images.map(imagePath => {
        // If it's a full URL, extract just the relative path
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          const url = new URL(imagePath);
          // Extract path after /uploads/
          const pathMatch = url.pathname.match(/\/uploads\/(.+)$/);
          return pathMatch ? pathMatch[1] : imagePath;
        }
        // If it already starts with uploads/, remove it
        return imagePath.startsWith('uploads/') ? imagePath.substring(8) : imagePath;
      });
    } else if (aircraft_image) {
      // Normalize single image too
      let normalizedImage = aircraft_image;
      if (aircraft_image.startsWith('http://') || aircraft_image.startsWith('https://')) {
        const url = new URL(aircraft_image);
        const pathMatch = url.pathname.match(/\/uploads\/(.+)$/);
        normalizedImage = pathMatch ? pathMatch[1] : aircraft_image;
      } else if (aircraft_image.startsWith('uploads/')) {
        normalizedImage = aircraft_image.substring(8);
      }
      imageUrls = [normalizedImage];
    }
    
    const result = await db.query(`
      INSERT INTO flights (
        id, operator_id, aircraft_model, images,
        origin_name, origin_city, origin_country,
        destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime,
        market_price, empty_leg_price, available_seats, total_seats,
        status, description
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
      RETURNING *
    `, [
      flightId,
      userOperatorId,
      aircraftType || aircraft_model || null, // Use aircraftType from form or aircraft_model
      JSON.stringify(imageUrls), // Store all images as JSON array
      originName || originCode,
      originCity || originCode,
      originCountry,
      destinationName || destinationCode,
      destinationCity || destinationCode,
      destinationCountry,
      departureDateTime,
      arrivalDateTime,
      originalPrice, // market_price for comparison
      emptyLegPrice,  // actual selling price
      totalSeats, // available_seats
      totalSeats, // total_seats
      'pending',
      description
    ]);

    const newFlight = result.rows[0];

    // Update operator's flight count
    try {
      await OperatorFlightCounter.incrementFlightCount(userOperatorId);
    } catch (counterError) {
      console.error('❌ Failed to update operator flight count:', counterError);
      // Don't fail flight creation if counter update fails
    }

    // Create notification for the operator about successful flight submission
    try {
      await createNotification(
        db,
        req.user.id, // The operator's user ID
        'Flight Submitted for Review',
        `Your flight ${newFlight.origin_code} → ${newFlight.destination_code} has been successfully submitted for admin review.`
      );
      console.log(`✅ Created submission notification for user ${req.user.id} and flight ${newFlight.id}`);
    } catch (notificationError) {
      console.error('❌ Failed to create submission notification:', notificationError);
      // Don't fail the flight creation if notification fails
    }

    res.status(201).json({
      message: 'Flight created successfully',
      flight: {
        id: newFlight.id,
        origin: `${newFlight.origin_city} (${newFlight.origin_code})`,
        destination: `${newFlight.destination_city} (${newFlight.destination_code})`,
        departure: newFlight.departure_datetime,
        arrival: newFlight.arrival_datetime,
        price: parseFloat(newFlight.seat_leg_price),
        originalPrice: parseFloat(newFlight.seat_market_price),
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
    console.log('🔄 PUT Request - Flight ID:', id);
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

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

    // Complete field mapping from DATABASE_SCHEMA.md reference
    const fieldMapping = {
      // Basic Info
      aircraftName: 'aircraft_name',
      aircraftImage: 'aircraft_image_url',
      
      // Route Info (frontend sends these field names)
      origin: 'origin_code',
      originCode: 'origin_code', 
      originName: 'origin_name',
      originCity: 'origin_city',
      originCountry: 'origin_country',
      destination: 'destination_code',
      destinationCode: 'destination_code',
      destinationName: 'destination_name',
      destinationCity: 'destination_city',
      destinationCountry: 'destination_country',
      
      // Schedule (frontend sends these field names)
      departureTime: 'departure_datetime',
      departureDateTime: 'departure_datetime',
      arrivalTime: 'arrival_datetime',
      arrivalDateTime: 'arrival_datetime',
      duration: 'estimated_duration_minutes',
      bookingDeadline: 'booking_deadline',
      
      // Pricing
      originalPrice: 'seat_market_price',
      emptyLegPrice: 'seat_leg_price',
      currency: 'currency',
      
      // Capacity
      availableSeats: 'available_seats',
      maxPassengers: 'max_passengers',
      
      // Services & Policies
      cateringAvailable: 'catering_available',
      groundTransportAvailable: 'ground_transport_available',
      wifiAvailable: 'wifi_available',
      petsAllowed: 'pets_allowed',
      smokingAllowed: 'smoking_allowed',
      flexibleDeparture: 'flexible_departure',
      flexibleDestination: 'flexible_destination',
      
      // Additional
      maxDelayMinutes: 'max_delay_minutes',
      cancellationPolicy: 'cancellation_policy',
      description: 'description',
      specialRequirements: 'special_requirements',
      status: 'status'
    };

    const updates = {};
    
    // Process all fields from request body
    for (const [frontendField, value] of Object.entries(req.body)) {
      if (value !== undefined && fieldMapping[frontendField]) {
        const dbColumn = fieldMapping[frontendField];
        updates[dbColumn] = value;
      }
    }

    console.log('🗺️ Mapped updates:', JSON.stringify(updates, null, 2));

    if (Object.keys(updates).length === 0) {
      console.log('❌ No valid updates found');
      return res.status(400).json({
        error: 'No valid updates provided'
      });
    }

    // Add timestamp
    updates.updated_at = new Date().toISOString();

    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');

    const values = [...Object.values(updates), id];

    console.log('📋 SQL Query:', `UPDATE flights SET ${setClause} WHERE id = ?`);
    console.log('📋 SQL Values:', values);

    // For SQLite, we need to run the update and then fetch the updated row
    await db.run(
      `UPDATE flights SET ${setClause} WHERE id = ?`,
      values
    );

    // Fetch the updated row
    const result = await db.query(
      'SELECT * FROM flights WHERE id = ?',
      [id]
    );

    console.log('✅ Update result:', result.rows[0]);

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

// @route   PUT /api/flights/:id/approve
// @desc    Approve or decline a pending flight (admin/super-admin only)
// @access  Admin/Super-Admin
router.put('/:id/approve', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    const { status, reason } = req.body;

    // Validate incoming status (API contract remains approved/declined)
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be either "approved" or "declined"'
      });
    }

    const flightId = req.params.id;
    
    // Check if flight exists and is pending
    const flightStmt = db.prepare('SELECT * FROM flights WHERE id = ?');
    const flight = flightStmt.get(flightId);
    
    if (!flight) {
      return res.status(404).json({
        error: 'Flight not found'
      });
    }

    if (flight.status !== 'pending') {
      return res.status(400).json({
        error: 'Only pending flights can be approved or declined'
      });
    }

    // Map external status to database-safe value (schema allows available/pending/booked/cancelled)
    const databaseStatus = status === 'approved' ? 'available' : 'cancelled';

    // Update flight status
    const updateStmt = db.prepare(`
      UPDATE flights 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    const result = updateStmt.run(databaseStatus, flightId);

    // Get operator details to send notification
    const operatorStmt = db.prepare(`
      SELECT au.id as user_id, au.email, o.company_name
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      JOIN users au ON o.user_id = au.id
      WHERE f.id = ?
    `);
    const operator = operatorStmt.get(flightId);
    
    if (operator) {
      // Create notification for the operator
      try {
        const notificationType = status === 'approved' ? 'flight_approved' : 'flight_declined';
        const notificationTitle = status === 'approved' ? 'Flight Approved! ✅' : 'Flight Declined ❌';
        const notificationMessage = status === 'approved' 
          ? `Great news! Your flight ${flight.origin_name} → ${flight.destination_name} has been approved and is now live for customers to book.`
          : `Your flight ${flight.origin_name} → ${flight.destination_name} was declined. ${reason ? `Reason: ${reason}` : 'Please contact admin for details.'}`;
        
        await createNotification(
          operator.user_id,
          notificationTitle,
          notificationMessage
        );
        
        console.log(`✅ Created ${status} notification for operator ${operator.email}`);
      } catch (notificationError) {
        console.error('❌ Failed to create approval notification:', notificationError);
        // Don't fail the approval if notification fails
      }
    }

    console.log(`Flight ${flightId} ${status} by admin ${req.user.email}`);

    const flightResponse = {
      ...flight,
      status: databaseStatus
    };

    res.json({
      message: `Flight ${status} successfully`,
      flight: flightResponse
    });

  } catch (error) {
    console.error('Flight approval error:', error);
    res.status(500).json({
      error: 'Failed to update flight status'
    });
  }
});

// @route   DELETE /api/flights/:id
// @desc    Delete a flight (Super Admin can delete any, Operators can delete their own)
// @access  Private (Super Admin, Operator)
router.delete('/:id', authenticate, authorize(['operator', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Delete flight request for ID: ${id} by user: ${req.user.email}`);

    // First, get the flight details to notify the operator
    const getFlightSql = `
      SELECT f.*, o.id as operator_id, au.id as user_id, au.email as operator_email, o.company_name
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      JOIN users au ON o.user_id = au.id
      WHERE f.id = ?
    `;

    const flightResult = await db.query(getFlightSql, [id]);
    const flight = flightResult.rows[0];

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Authorization check: Operators can only delete their own flights
    if (req.user.role === 'operator') {
      if (flight.operator_email !== req.user.email) {
        return res.status(403).json({ error: 'You can only delete your own flights' });
      }
    }

    // Delete the flight
    const deleteSql = 'DELETE FROM flights WHERE id = ?';
    await db.query(deleteSql, [id]);

    // Update operator's flight count
    try {
      await OperatorFlightCounter.decrementFlightCount(flight.operator_id);
    } catch (counterError) {
      console.error('❌ Failed to update operator flight count:', counterError);
      // Don't fail deletion if counter update fails
    }

    // Create notification for the operator (but not if they're deleting their own flight)
    try {
      // Check if the flight owner is the same as the person deleting it
      const isOwnFlight = flight.operator_email === req.user.email;
      
      console.log('🔍 Notification debug:');
      console.log('   - Flight operator email:', flight.operator_email);
      console.log('   - Current user email:', req.user.email);
      console.log('   - Is own flight:', isOwnFlight);
      console.log('   - Flight operator_id:', flight.operator_id);
      console.log('   - Flight user_id:', flight.user_id);
      
      if (!isOwnFlight) {
        // Only super-admins can delete other people's flights, so this is admin deletion
        console.log('🔔 Creating admin deletion notification...');
        await createNotification(
          db,
          flight.user_id,  // Use user_id instead of operator_id
          'Flight Deleted by Administration',
          `Your flight ${flight.origin_code} → ${flight.destination_code} (${flight.id}) has been deleted by administration.`
        );
        console.log('✅ Admin deletion notification sent to operator:', flight.operator_email);
      } else {
        console.log('ℹ️ No notification sent - operator deleted their own flight');
      }
    } catch (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
      // Don't fail the delete operation if notification fails
    }

    console.log('✅ Flight deleted successfully:', id);
    res.json({ 
      success: true, 
      message: 'Flight deleted successfully',
      deletedFlightId: id
    });

  } catch (error) {
    console.error('Flight deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete flight'
    });
  }
});

// @route   PUT /api/flights/fix-durations
// @desc    Calculate and update durations for all flights based on departure/arrival times
// @access  Admin only
router.put('/fix-durations', authenticate, authorize(['admin', 'super-admin']), async (req, res) => {
  try {
    console.log('🔧 Starting duration fix for all flights...');
    
    // Get all flights with departure and arrival times
    const result = await db.query(`
      SELECT id, departure_datetime, arrival_datetime, estimated_duration_minutes
      FROM flights 
      WHERE departure_datetime IS NOT NULL AND arrival_datetime IS NOT NULL
    `);

    let updatedCount = 0;
    let errors = [];

    for (const flight of result.rows) {
      try {
        const departureTime = new Date(flight.departure_datetime);
        const arrivalTime = new Date(flight.arrival_datetime);
        
        // Validate dates
        if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
          errors.push(`Flight ${flight.id}: Invalid date format`);
          continue;
        }
        
        // Calculate duration in minutes
        const durationMs = arrivalTime - departureTime;
        if (durationMs <= 0) {
          errors.push(`Flight ${flight.id}: Arrival time before departure time`);
          continue;
        }
        
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        
        // Update the flight duration
        await db.query(`
          UPDATE flights 
          SET estimated_duration_minutes = ? 
          WHERE id = ?
        `, [durationMinutes, flight.id]);
        
        console.log(`✅ Updated flight ${flight.id}: ${durationMinutes} minutes`);
        updatedCount++;
        
      } catch (error) {
        errors.push(`Flight ${flight.id}: ${error.message}`);
      }
    }

    console.log(`🎉 Duration fix complete: ${updatedCount} flights updated`);
    
    res.json({
      success: true,
      message: `Successfully updated durations for ${updatedCount} flights`,
      updatedCount,
      totalFlights: result.rows.length,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error) {
    console.error('❌ Error fixing flight durations:', error);
    res.status(500).json({
      error: 'Failed to fix flight durations',
      message: error.message
    });
  }
});

module.exports = router;
