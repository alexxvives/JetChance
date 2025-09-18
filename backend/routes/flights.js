const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database-sqlite');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/flights
// @desc    Get all available flights with search and filter options
// @access  Public
router.get('/', [
  query('origin').optional().trim(),
  query('destination').optional().trim(),
  query('departure_date').optional().isISO8601(),
  query('passengers').optional().isInt({ min: 1, max: 20 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('aircraft_type').optional().trim(),
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
      page = 1,
      limit = 20,
      sort_by = 'departure',
      sort_order = 'asc'
    } = req.query;

    // Build WHERE conditions
    let whereConditions = ['f.status = $1', 'f.departure_datetime > NOW()', 'f.available_seats >= $2'];
    let params = ['available', parseInt(passengers)];
    let paramIndex = 3;

    if (origin) {
      whereConditions.push(`(f.origin_code ILIKE $${paramIndex} OR f.origin_city ILIKE $${paramIndex})`);
      params.push(`%${origin}%`);
      paramIndex++;
    }

    if (destination) {
      whereConditions.push(`(f.destination_code ILIKE $${paramIndex} OR f.destination_city ILIKE $${paramIndex})`);
      params.push(`%${destination}%`);
      paramIndex++;
    }

    if (departure_date) {
      const startDate = new Date(departure_date);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      
      whereConditions.push(`f.departure_datetime BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    if (max_price) {
      whereConditions.push(`f.empty_leg_price <= $${paramIndex}`);
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    if (aircraft_type) {
      whereConditions.push(`a.aircraft_type ILIKE $${paramIndex}`);
      params.push(`%${aircraft_type}%`);
      paramIndex++;
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
        f.total_seats,
        f.available_seats,
        f.catering_available,
        f.ground_transport_available,
        f.wifi_available,
        f.pets_allowed,
        f.flexible_departure,
        f.description,
        a.aircraft_type,
        a.manufacturer,
        a.model,
        a.max_passengers,
        a.images,
        a.amenities,
        o.company_name as operator_name,
        o.rating as operator_rating,
        o.logo_url as operator_logo
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      JOIN operators o ON f.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      JOIN operators o ON f.operator_id = o.id
      WHERE ${whereConditions.slice(0, -2).join(' AND ')}
    `;

    const countResult = await db.query(countQuery, params.slice(0, -2));
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
        type: flight.aircraft_type,
        manufacturer: flight.manufacturer,
        model: flight.model,
        maxPassengers: flight.max_passengers,
        images: flight.images || [],
        amenities: flight.amenities || []
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

    const result = await db.query(`
      SELECT 
        f.*,
        a.aircraft_type,
        a.manufacturer,
        a.model,
        a.year_manufactured,
        a.max_passengers,
        a.max_range_nm,
        a.cruise_speed_kts,
        a.cabin_height_ft,
        a.cabin_width_ft,
        a.cabin_length_ft,
        a.baggage_capacity_cuft,
        a.images as aircraft_images,
        a.amenities as aircraft_amenities,
        a.description as aircraft_description,
        o.company_name as operator_name,
        o.rating as operator_rating,
        o.total_flights as operator_total_flights,
        o.description as operator_description,
        o.logo_url as operator_logo,
        o.website_url as operator_website
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      JOIN operators o ON f.operator_id = o.id
      WHERE f.id = $1 AND f.status = 'available'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Flight not found',
        message: 'The requested flight could not be found or is no longer available'
      });
    }

    const flight = result.rows[0];

    res.json({
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
        availableSeats: flight.available_seats,
        minPassengers: flight.min_passengers
      },
      aircraft: {
        type: flight.aircraft_type,
        manufacturer: flight.manufacturer,
        model: flight.model,
        yearManufactured: flight.year_manufactured,
        maxPassengers: flight.max_passengers,
        specifications: {
          maxRange: flight.max_range_nm,
          cruiseSpeed: flight.cruise_speed_kts,
          cabinHeight: parseFloat(flight.cabin_height_ft),
          cabinWidth: parseFloat(flight.cabin_width_ft),
          cabinLength: parseFloat(flight.cabin_length_ft),
          baggageCapacity: flight.baggage_capacity_cuft
        },
        images: flight.aircraft_images || [],
        amenities: flight.aircraft_amenities || [],
        description: flight.aircraft_description
      },
      services: {
        catering: flight.catering_available,
        groundTransport: flight.ground_transport_available,
        wifi: flight.wifi_available,
        petsAllowed: flight.pets_allowed,
        smokingAllowed: flight.smoking_allowed,
        flexibleDeparture: flight.flexible_departure,
        flexibleDestination: flight.flexible_destination,
        maxDelayMinutes: flight.max_delay_minutes
      },
      operator: {
        name: flight.operator_name,
        rating: parseFloat(flight.operator_rating) || 0,
        totalFlights: flight.operator_total_flights,
        description: flight.operator_description,
        logo: flight.operator_logo,
        website: flight.operator_website
      },
      policies: {
        cancellation: flight.cancellation_policy,
        specialRequirements: flight.special_requirements
      },
      description: flight.description,
      createdAt: flight.created_at,
      updatedAt: flight.updated_at
    });

  } catch (error) {
    console.error('Flight details error:', error);
    res.status(500).json({
      error: 'Failed to fetch flight details'
    });
  }
});

// @route   POST /api/flights
// @desc    Create a new flight (operators only)
// @access  Private (Operator)
router.post('/', authenticate, authorize(['operator', 'admin']), [
  body('aircraftId').isUUID(),
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
      cancellationPolicy
    } = req.body;

    // Verify aircraft belongs to operator
    const aircraftCheck = await db.query(
      'SELECT id FROM aircraft WHERE id = $1 AND operator_id = $2 AND is_active = true',
      [aircraftId, operatorId]
    );

    if (aircraftCheck.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid aircraft',
        message: 'Aircraft not found or not owned by your organization'
      });
    }

    const result = await db.query(`
      INSERT INTO flights (
        operator_id, aircraft_id, flight_number,
        origin_code, origin_name, origin_city, origin_country,
        destination_code, destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime, estimated_duration_minutes,
        original_price, empty_leg_price, total_seats, available_seats, min_passengers,
        catering_available, ground_transport_available, wifi_available,
        pets_allowed, smoking_allowed, flexible_departure, flexible_destination,
        max_delay_minutes, description, special_requirements, cancellation_policy
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
      )
      RETURNING *
    `, [
      operatorId, aircraftId, flightNumber,
      originCode, originName, originCity, originCountry,
      destinationCode, destinationName, destinationCity, destinationCountry,
      departureDateTime, arrivalDateTime, estimatedDuration,
      originalPrice, emptyLegPrice, totalSeats, minPassengers,
      cateringAvailable, groundTransportAvailable, wifiAvailable,
      petsAllowed, smokingAllowed, flexibleDeparture, flexibleDestination,
      maxDelayMinutes, description, specialRequirements, cancellationPolicy
    ]);

    const newFlight = result.rows[0];

    res.status(201).json({
      message: 'Flight created successfully',
      flight: {
        id: newFlight.id,
        flightNumber: newFlight.flight_number,
        origin: `${newFlight.origin_city} (${newFlight.origin_code})`,
        destination: `${newFlight.destination_city} (${newFlight.destination_code})`,
        departure: newFlight.departure_datetime,
        price: parseFloat(newFlight.empty_leg_price),
        status: newFlight.status
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
router.put('/:id', authenticate, authorize(['operator', 'admin']), async (req, res) => {
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

    updates.updated_at = 'NOW()';

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
router.delete('/:id', authenticate, authorize(['operator', 'admin']), async (req, res) => {
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
        'UPDATE flights SET status = $1, updated_at = NOW() WHERE id = $2',
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

module.exports = router;