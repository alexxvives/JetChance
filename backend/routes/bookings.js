const express = require('express');
const { body, validationResult } = require('express-validator');
const { query: dbQuery, run, db } = require('../config/database-sqlite');
const { authenticate, authorize } = require('../middleware/auth');
const SimpleIDGenerator = require('../utils/idGenerator');
const { createNotification } = require('./notifications');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        b.*,
        f.origin_city,
        f.destination_city,
        f.origin_name,
        f.destination_name,
        f.departure_datetime,
        f.arrival_datetime,
        f.aircraft_model as aircraft_name,
        'COP' as currency,
        o.company_name as operator_name
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN operators o ON f.operator_id = o.id
      JOIN customers c ON b.customer_id = c.id
      WHERE c.user_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    const bookings = result.rows.map(booking => {
      // Extract airport codes from names (format: "Airport Name (CODE)")
      const originCodeMatch = booking.origin_name?.match(/\(([^)]+)\)$/);
      const destinationCodeMatch = booking.destination_name?.match(/\(([^)]+)\)$/);
      const originCode = originCodeMatch ? originCodeMatch[1] : booking.origin_city;
      const destinationCode = destinationCodeMatch ? destinationCodeMatch[1] : booking.destination_city;

      return {
        id: booking.id,
        bookingReference: booking.id, // Use ID as booking reference
        status: booking.status,
        passengerCount: booking.total_passengers,
        totalAmount: parseFloat(booking.total_amount),
        currency: booking.currency, // Get currency from flights table
        flight: {
          origin: `${booking.origin_city} (${originCode})`,
          destination: `${booking.destination_city} (${destinationCode})`,
          departure: booking.departure_datetime,
          arrival: booking.arrival_datetime,
          aircraftName: booking.aircraft_name,
          operator: booking.operator_name
        },
        specialRequests: booking.special_requests,
        bookingDate: booking.created_at
      };
    });

    res.json({ bookings });

  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings'
    });
  }
});

// @route   GET /api/bookings/operator
// @desc    Get operator's flight bookings
// @access  Private (Operators only)
router.get('/operator', authenticate, async (req, res) => {
  try {
    // First, get the operator record for this user
    const operatorResult = await db.query('SELECT * FROM operators WHERE user_id = ?', [req.user.id]);
    
    if (!operatorResult.rows.length) {
      return res.status(403).json({
        error: 'Access denied. Operator account required.'
      });
    }

    const operator = operatorResult.rows[0];

    // Get all bookings for flights operated by this operator
    const result = await db.query(`
      SELECT 
        b.*,
        f.origin_city,
        f.destination_city,
        f.origin_name,
        f.destination_name,
        f.departure_datetime,
        f.arrival_datetime,
        f.aircraft_model as aircraft_name,
        f.available_seats,
        f.total_seats,
        'COP' as currency,
        c.first_name || ' ' || c.last_name as customer_name,
        c.phone as customer_phone
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN customers c ON b.customer_id = c.id
      WHERE f.operator_id = ?
      ORDER BY b.created_at DESC
    `, [operator.id]);

    // Get passengers for each booking
    const bookingsWithPassengers = await Promise.all(result.rows.map(async (booking) => {
      const passengersResult = await db.query(
        'SELECT first_name, last_name, date_of_birth, document_type, document_number FROM passengers WHERE booking_id = ? ORDER BY created_at',
        [booking.id]
      );

      // Extract airport codes from names (format: "Airport Name (CODE)")
      const originCodeMatch = booking.origin_name?.match(/\(([^)]+)\)$/);
      const destinationCodeMatch = booking.destination_name?.match(/\(([^)]+)\)$/);
      const originCode = originCodeMatch ? originCodeMatch[1] : booking.origin_city;
      const destinationCode = destinationCodeMatch ? destinationCodeMatch[1] : booking.destination_city;

      return {
        id: booking.id,
        bookingReference: booking.id, // Use ID as booking reference
        status: booking.status,
        passengerCount: booking.total_passengers,
        totalAmount: parseFloat(booking.total_amount),
        currency: booking.currency,
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
        contact_email: booking.contact_email,
        flight_id: booking.flight_id,
        flight: {
          origin: `${booking.origin_city} (${originCode})`,
          destination: `${booking.destination_city} (${destinationCode})`,
          departure: booking.departure_datetime,
          arrival: booking.arrival_datetime,
          aircraftName: booking.aircraft_name,
          operator: operator.company_name,
          availableSeats: booking.available_seats,
          totalSeats: booking.total_seats
        },
        specialRequests: booking.special_requests,
        bookingDate: booking.created_at,
        paymentMethod: booking.payment_method,
        passengers: passengersResult.rows.map(p => ({
          firstName: p.first_name,
          lastName: p.last_name,
          dateOfBirth: p.date_of_birth,
          documentType: p.document_type,
          documentNumber: p.document_number
        }))
      };
    }));

    const bookings = bookingsWithPassengers;

    // Get flight count for this operator
    const flightCountResult = await db.query(`
      SELECT COUNT(*) as total_flights
      FROM flights
      WHERE operator_id = ?
    `, [operator.id]);

    const totalFlights = flightCountResult.rows[0]?.total_flights || 0;

    res.json({ 
      bookings,
      totalFlights
    });

  } catch (error) {
    console.error('Operator bookings fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch operator bookings'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authenticate, [
  body('flightId').isLength({ min: 1 }).withMessage('Flight ID is required'),
  body('passengers').isArray({ min: 1 }),
  body('passengers.*.firstName').trim().isLength({ min: 2 }),
  body('passengers.*.lastName').trim().isLength({ min: 2 }),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('contact_email').isEmail().withMessage('Valid contact email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { flightId, passengers, specialRequests, totalAmount, paymentMethod, contact_email } = req.body;

    // First, find or create customer record for this user
    let customerStmt = db.prepare('SELECT * FROM customers WHERE user_id = ?');
    let customer = customerStmt.get(req.user.id);

    if (!customer) {
      // Create a customer record for this user
      const customerId = SimpleIDGenerator.generateCustomerId();
      const insertCustomerStmt = db.prepare(`
        INSERT INTO customers (id, user_id, first_name, last_name)
        VALUES (?, ?, ?, ?)
      `);
      insertCustomerStmt.run(customerId, req.user.id, req.user.firstName || '', req.user.lastName || '');
      
      // Fetch the created customer
      customer = customerStmt.get(req.user.id);
    }

    // Check flight availability
    const flightStmt = db.prepare(
      'SELECT * FROM flights WHERE id = ? AND status = ? AND available_seats >= ?'
    );
    const flightResult = flightStmt.get(flightId, 'available', passengers.length);

    if (!flightResult) {
      return res.status(400).json({
        error: 'Flight not available',
        message: 'Flight not found or insufficient seats available'
      });
    }

    const flight = flightResult;

    // Generate booking ID using the new sequential pattern
    const bookingId = SimpleIDGenerator.generateBookingId();

    try {
      // Create booking with simplified structure
      const bookingStmt = db.prepare(`
        INSERT INTO bookings (
          id, customer_id, flight_id, total_passengers,
          total_amount, payment_method, special_requests, status, contact_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const bookingResult = bookingStmt.run(
        bookingId, customer.id, flightId, passengers.length,
        totalAmount, paymentMethod || 'CREDIT_CARD', specialRequests, 'confirmed', contact_email
      );

      // Get the created booking
      const getBookingStmt = db.prepare('SELECT * FROM bookings WHERE id = ?');
      const booking = getBookingStmt.get(bookingId);

      // Add passengers to passengers table
      const passengerStmt = db.prepare(`
        INSERT INTO passengers (
          id, booking_id, first_name, last_name, date_of_birth,
          document_type, document_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const passenger of passengers) {
        const passengerId = SimpleIDGenerator.generatePassengerId();
        passengerStmt.run(
          passengerId, booking.id, passenger.firstName, passenger.lastName, 
          passenger.dateOfBirth || null,
          passenger.documentType || 'CC', passenger.documentNumber || null
        );
      }

      // Update flight availability
      const updateFlightStmt = db.prepare(
        'UPDATE flights SET available_seats = available_seats - ? WHERE id = ?'
      );
      updateFlightStmt.run(passengers.length, flightId);

      // Notify operator about new booking
      try {
        const operatorUserId = flight.user_id;
        if (operatorUserId) {
          await createNotification(
            db,
            operatorUserId,
            'New Booking Received! 🎉',
            `You have a new booking for your flight ${flight.origin_code} → ${flight.destination_code}. Booking ID: ${bookingId}. Passengers: ${passengers.length}`
          );
          console.log(`✅ Created booking notification for operator ${operatorUserId}`);
        }
      } catch (notificationError) {
        console.error('❌ Failed to create booking notification:', notificationError);
        // Don't fail the booking if notification fails
      }

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          booking_reference: booking.id, // Use ID as reference
          totalAmount: parseFloat(booking.total_amount),
          currency: 'COP', // Default currency
          status: booking.status,
          passengerCount: passengers.length,
          passengers: passengers.length,
          paymentMethod: booking.payment_method,
          specialRequests: booking.special_requests
        }
      });

    } catch (error) {
      console.error('Booking creation error:', error);
      res.status(500).json({
        error: 'Failed to create booking',
        message: 'Unable to process booking. Please try again.'
      });
    }
  } catch (error) {
    console.error('Outer booking error:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: 'Unable to process booking. Please try again.'
    });
  }
});

// @route   GET /api/bookings/crm
// @desc    Get all bookings for CRM (Super Admin only)
// @access  Super Admin
router.get('/crm', authenticate, authorize(['super-admin']), async (req, res) => {
  try {
    console.log('🏢 CRM: Fetching all bookings for super admin');

    // Get all bookings with detailed information
    console.log('🔍 CRM: Preparing bookings query...');
    const bookingsStmt = db.prepare(`
      SELECT 
        b.*,
        f.origin_city,
        f.destination_city,
        f.origin_name,
        f.destination_name,
        f.departure_datetime,
        f.arrival_datetime,
        f.aircraft_model as aircraft_name,
        f.available_seats,
        f.total_seats,
        o.company_name as operator_name,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        u.email as customer_email,
        b.contact_email
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN operators o ON f.operator_id = o.id
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    
    console.log('🔍 CRM: Executing bookings query...');
    const bookingsResult = bookingsStmt.all();
    console.log(`🔍 CRM: Found ${bookingsResult.length} raw bookings`);

    // Get passengers for each booking
    console.log('🔍 CRM: Preparing passengers query...');
    const passengersStmt = db.prepare(`
      SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.date_of_birth,
        p.document_type,
        p.document_number
      FROM passengers p
      WHERE p.booking_id = ?
      ORDER BY p.first_name, p.last_name
    `);

    const bookingsWithPassengers = [];
    console.log('🔍 CRM: Processing bookings...');
    for (const booking of bookingsResult) {
      console.log(`🔍 CRM: Processing booking ${booking.id}...`);
      const passengersResult = passengersStmt.all(booking.id);

      // Extract airport codes
      const originCodeMatch = booking.origin_name?.match(/\(([^)]+)\)$/);
      const destinationCodeMatch = booking.destination_name?.match(/\(([^)]+)\)$/);
      const originCode = originCodeMatch ? originCodeMatch[1] : booking.origin_city;
      const destinationCode = destinationCodeMatch ? destinationCodeMatch[1] : booking.destination_city;

      bookingsWithPassengers.push({
        id: booking.id,
        status: booking.status,
        totalPrice: parseFloat(booking.total_amount),
        createdAt: booking.created_at,
        customer: {
          firstName: booking.customer_first_name,
          lastName: booking.customer_last_name,
          email: booking.customer_email
        },
        contact_email: booking.contact_email,
        operator: booking.operator_name,
        flight: {
          origin: {
            code: originCode
          },
          destination: {
            code: destinationCode
          },
          schedule: {
            departure: booking.departure_datetime
          },
          availableSeats: booking.available_seats,
          totalSeats: booking.total_seats
        },
        passengers: passengersResult.map(p => ({
          firstName: p.first_name,
          lastName: p.last_name,
          email: '', // Passengers don't have email in this table
          phone: '' // Passengers don't have phone in this table
        }))
      });
    }

    // Calculate revenue summary
    const totalRevenue = bookingsWithPassengers.reduce((sum, booking) => {
      return sum + (booking.status === 'confirmed' ? booking.totalPrice : 0);
    }, 0);

    const platformCommission = totalRevenue * 0.10; // 10% commission
    const operatorRevenue = totalRevenue - platformCommission;

    console.log(`✅ CRM: Found ${bookingsWithPassengers.length} bookings`);

    const response = {
      bookings: bookingsWithPassengers,
      revenue: {
        total: totalRevenue,
        commission: platformCommission,
        operator: operatorRevenue
      }
    };

    console.log('✅ CRM: Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('❌ CRM bookings fetch error:', error.message);
    console.error('❌ CRM error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch CRM data',
      details: error.message
    });
  }
});

// @route   GET /api/bookings/:id/flight
// @desc    Get flight details for a specific booking
// @access  Private (Operators only)
router.get('/:id/flight', authenticate, async (req, res) => {
  try {
    const { id: bookingId } = req.params;

    // Get the booking and flight details
    const result = await db.query(`
      SELECT 
        b.id as booking_id,
        f.id as flight_id,
        f.origin_city,
        f.destination_city,
        f.origin_name,
        f.destination_name,
        f.departure_datetime,
        f.arrival_datetime,
        f.aircraft_model,
        f.operator_id,
        o.company_name as operator_name,
        o.user_id as operator_user_id
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN operators o ON f.operator_id = o.id
      WHERE b.id = ?
    `, [bookingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found or flight not available'
      });
    }

    const booking = result.rows[0];

    // Check if the current user is the operator for this flight
    if (booking.operator_user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied. You can only view flights for your own bookings.'
      });
    }

    res.json({
      bookingId: booking.booking_id,
      flightId: booking.flight_id,
      flight: {
        id: booking.flight_id,
        origin: booking.origin_name,
        destination: booking.destination_name,
        departure: booking.departure_datetime,
        arrival: booking.arrival_datetime,
        aircraft: booking.aircraft_model,
        operator: booking.operator_name
      }
    });

  } catch (error) {
    console.error('Booking flight details error:', error);
    res.status(500).json({
      error: 'Failed to fetch flight details for booking'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        b.*,
        f.origin_city, f.destination_city, f.origin_code, f.destination_code,
        f.departure_datetime, f.arrival_datetime, f.flight_number, f.currency,
        f.aircraft_name, f.aircraft_image_url,
        o.company_name as operator_name
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN operators o ON f.operator_id = o.id
      WHERE b.id = ? AND b.user_id = ?
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    const booking = result.rows[0];

    // Get passengers
    const passengersResult = await db.query(
      'SELECT * FROM passengers WHERE booking_id = ? ORDER BY created_at',
      [booking.id]
    );

    res.json({
      id: booking.id,
      bookingReference: booking.id, // Use ID as reference
      status: booking.status,
      passengerCount: booking.total_passengers,
      totalAmount: parseFloat(booking.total_amount),
      currency: booking.currency, // Get from flight
      flight: {
        flightNumber: booking.flight_number,
        origin: `${booking.origin_city} (${booking.origin_code})`,
        destination: `${booking.destination_city} (${booking.destination_code})`,
        departure: booking.departure_datetime,
        arrival: booking.arrival_datetime,
        aircraft: booking.aircraft_name,
        operator: booking.operator_name
      },
      passengers: passengersResult.rows.map(p => ({
        firstName: p.first_name,
        lastName: p.last_name,
        dateOfBirth: p.date_of_birth,
        nationality: p.nationality,
        passportNumber: p.passport_number
      })),
      specialRequests: booking.special_requests,
      bookingDate: booking.created_at
    });

  } catch (error) {
    console.error('Booking details error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking details'
    });
  }
});

module.exports = router;