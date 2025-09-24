const express = require('express');
const { body, query, validationResult } = require('express-validator');
const SimpleIDGenerator = require('../utils/idGenerator');
const db = require('../config/database-sqlite');
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
  query('user_id').optional().matches(/^[A-Z]{2,3}\d{3}$/),
  query('status').optional().isIn(['pending', 'approved', 'denied']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort_by').optional().isIn(['price', 'departure', 'duration']),
  query('sort_order').optional().isIn(['asc', 'desc']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
      const userResult = await db.query('SELECT role FROM auth_users WHERE id = ?', [user_id]);
      if (userResult.rows.length > 0) {
        const userRole = userResult.rows[0].role;
        if (userRole === 'operator') {
          // Operator viewing their own flights - show ALL statuses (pending, approved, declined)
          isOperatorOwned = true;
          statusFilter = req.query.status || null; // Allow all statuses if no specific status requested
          const operatorResult = await db.query('SELECT id FROM operators WHERE auth_user_id = ?', [user_id]);
          if (operatorResult.rows.length > 0) {
            operatorId = operatorResult.rows[0].id;
          }
        } else if (userRole === 'super-admin') {
          // Super-admin viewing their operator flights - show ALL statuses
          isOperatorOwned = true;
          isSuperAdmin = true;
          statusFilter = req.query.status || null; // Allow all statuses if no specific status requested
          const operatorResult = await db.query('SELECT id FROM operators WHERE auth_user_id = ?', [user_id]);
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

    // Only show future flights for customers and public catalog (always exclude past flights for non-operators)
    if (!isOperatorOwned && !isSuperAdmin) {
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
        f.images,
        o.company_name as operator_name,
        o.id as operator_id,
        o.company_name as operator_company_name
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
      status: flight.status,
      aircraft: {
        name: flight.aircraft_name || 'Private Jet',
        type: flight.aircraft_name || 'Private Jet',
        manufacturer: flight.aircraft_name ? flight.aircraft_name.split(' ')[0] : 'Unknown',
        model: flight.aircraft_name ? flight.aircraft_name.split(' ').slice(1).join(' ') : 'Private Jet',
        image: flight.aircraft_image_url,
        images: flight.images ? JSON.parse(flight.images) : (flight.aircraft_image_url ? [flight.aircraft_image_url] : [])
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
        companyName: flight.operator_company_name,
        operatorId: flight.operator_id,
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
        o.total_flights as operator_total_flights,
        o.logo_url as operator_logo
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

    // Format duration from database value
    let formattedDuration = null;
    if (flight.estimated_duration_minutes) {
      const totalMinutes = flight.estimated_duration_minutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      if (hours > 0) {
        formattedDuration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      } else {
        formattedDuration = `${minutes}m`;
      }
    }
    
    console.log('✅ Database duration:', flight.estimated_duration_minutes, '→', formattedDuration);

    res.json({
      id: flight.id,
      flightNumber: flight.flight_number,
      origin: flight.origin_city,
      destination: flight.destination_city,
      origin_code: flight.origin_code,
      destination_code: flight.destination_code,
      departure_time: flight.departure_datetime,
      arrival_time: flight.arrival_datetime,
      duration: formattedDuration,
      price: flight.price || flight.empty_leg_price,
      empty_leg_price: flight.empty_leg_price,
      original_price: flight.original_price,
      aircraft_type: flight.aircraft_type,
      aircraft_name: flight.aircraft_name,
      seats_available: flight.available_seats,
      status: flight.status,
      operator: flight.operator_name || 'Private Operator',
      operator_total_flights: flight.operator_total_flights,
      description: flight.description,
      amenities: flight.amenities,
      aircraft_image_url: flight.aircraft_image_url,
      images: flight.images ? JSON.parse(flight.images) : (flight.aircraft_image_url ? [flight.aircraft_image_url] : [])
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
      'SELECT id FROM operators WHERE auth_user_id = ? AND status = ?',
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
      aircraft_image, // Single image URL for backwards compatibility
      images = [] // Array of image URLs from frontend
    } = req.body;

    // Get operator ID for this user
    const userOperatorResult = await db.query(
      'SELECT id, company_name FROM operators WHERE auth_user_id = ?',
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

    // Prepare images array - use provided images or fallback to single aircraft_image
    let imageUrls = [];
    if (images && Array.isArray(images) && images.length > 0) {
      imageUrls = images;
    } else if (aircraft_image) {
      imageUrls = [aircraft_image];
    }
    
    const result = await db.query(`
      INSERT INTO flights (
        id, operator_id, aircraft_id, aircraft_name, aircraft_image_url, images, origin_code, origin_name, origin_city, origin_country,
        destination_code, destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime, estimated_duration_minutes,
        original_price, empty_leg_price, available_seats, max_passengers,
        status, description, currency
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      RETURNING *
    `, [
      flightId,
      userOperatorId, // Use the actual operator ID, not user ID
      selectedAircraftId,
      aircraftName, // Store the aircraft name directly
      imageUrls.length > 0 ? imageUrls[0] : null, // Keep first image for backwards compatibility
      JSON.stringify(imageUrls), // Store all images as JSON array
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
      parseInt(estimatedDuration), // Duration in minutes - calculated from departure/arrival times
      originalPrice,
      emptyLegPrice,
      totalSeats,
      totalSeats,
      'pending',
      description || 'Private jet flight',
      'USD'
    ]);

    const newFlight = result.rows[0];

    // Create notification for the operator about successful flight submission
    try {
      await createNotification(
        db,
        req.user.id, // The operator's user ID
        'flight_submitted',
        'Flight Submitted for Review',
        `Your flight ${newFlight.origin_code} → ${newFlight.destination_code} has been successfully submitted for admin review.`,
        newFlight.id
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
      flightNumber: 'flight_number',
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
      originalPrice: 'original_price',
      emptyLegPrice: 'empty_leg_price',
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

    // Get operator details to send notification
    const operatorSql = `
      SELECT au.id as user_id, au.email, o.company_name
      FROM flights f
      JOIN operators o ON f.operator_id = o.id
      JOIN auth_users au ON o.auth_user_id = au.id
      WHERE f.id = ?
    `;
    
    const operatorResult = await db.query(operatorSql, [flightId]);
    
    if (operatorResult.rows.length > 0) {
      const operator = operatorResult.rows[0];
      const flightInfo = result.rows[0];
      
      // Create notification for the operator
      try {
        const notificationType = status === 'approved' ? 'flight_approved' : 'flight_declined';
        const notificationTitle = status === 'approved' ? 'Flight Approved! ✅' : 'Flight Declined ❌';
        const notificationMessage = status === 'approved' 
          ? `Great news! Your flight ${flightInfo.origin_code} → ${flightInfo.destination_code} has been approved and is now live for customers to book.`
          : `Your flight ${flightInfo.origin_code} → ${flightInfo.destination_code} was declined. ${reason ? `Reason: ${reason}` : 'Please contact admin for details.'}`;
        
        await createNotification(
          db,
          operator.user_id,
          notificationType,
          notificationTitle,
          notificationMessage,
          flightId
        );
        
        console.log(`✅ Created ${status} notification for operator ${operator.email}`);
      } catch (notificationError) {
        console.error('❌ Failed to create approval notification:', notificationError);
        // Don't fail the approval if notification fails
      }
    }

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
      JOIN auth_users au ON o.auth_user_id = au.id
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
          'flight_deleted',
          'Flight Deleted by Administration',
          `Your flight ${flight.origin_code} → ${flight.destination_code} (${flight.id}) has been deleted by administration.`,
          flight.id
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
