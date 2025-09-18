const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

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
        f.origin_code,
        f.destination_code,
        f.departure_datetime,
        f.arrival_datetime,
        a.aircraft_type,
        o.company_name as operator_name
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN aircraft a ON f.aircraft_id = a.id
      JOIN operators o ON f.operator_id = o.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    const bookings = result.rows.map(booking => ({
      id: booking.id,
      bookingReference: booking.booking_reference,
      status: booking.status,
      paymentStatus: booking.payment_status,
      passengerCount: booking.passenger_count,
      totalAmount: parseFloat(booking.total_amount),
      currency: booking.currency,
      flight: {
        origin: `${booking.origin_city} (${booking.origin_code})`,
        destination: `${booking.destination_city} (${booking.destination_code})`,
        departure: booking.departure_datetime,
        arrival: booking.arrival_datetime,
        aircraftType: booking.aircraft_type,
        operator: booking.operator_name
      },
      bookingDate: booking.booking_date,
      paymentDate: booking.payment_date,
      confirmationDate: booking.confirmation_date
    }));

    res.json({ bookings });

  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authenticate, [
  body('flightId').isUUID(),
  body('passengers').isArray({ min: 1 }),
  body('passengers.*.firstName').trim().isLength({ min: 2 }),
  body('passengers.*.lastName').trim().isLength({ min: 2 }),
  body('passengers.*.email').isEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { flightId, passengers, specialRequests, cateringRequests, groundTransportRequired } = req.body;

    // Check flight availability
    const flightResult = await db.query(
      'SELECT * FROM flights WHERE id = $1 AND status = $2 AND available_seats >= $3',
      [flightId, 'available', passengers.length]
    );

    if (flightResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Flight not available',
        message: 'Flight not found or insufficient seats available'
      });
    }

    const flight = flightResult.rows[0];
    const totalAmount = flight.empty_leg_price * passengers.length;

    // Generate booking reference
    const bookingReference = `CF${Date.now().toString().slice(-8)}`;

    // Begin transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create booking
      const bookingResult = await client.query(`
        INSERT INTO bookings (
          booking_reference, user_id, flight_id, passenger_count,
          total_amount, currency, special_requests, catering_requests,
          ground_transport_required
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        bookingReference, req.user.id, flightId, passengers.length,
        totalAmount, flight.currency, specialRequests, cateringRequests,
        groundTransportRequired
      ]);

      const booking = bookingResult.rows[0];

      // Add passengers
      for (const passenger of passengers) {
        await client.query(`
          INSERT INTO passengers (
            booking_id, first_name, last_name, email, phone,
            date_of_birth, nationality, passport_number, passport_expiry,
            dietary_requirements, mobility_assistance, seat_preference
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          booking.id, passenger.firstName, passenger.lastName, passenger.email,
          passenger.phone, passenger.dateOfBirth, passenger.nationality,
          passenger.passportNumber, passenger.passportExpiry,
          passenger.dietaryRequirements, passenger.mobilityAssistance,
          passenger.seatPreference
        ]);
      }

      // Update flight availability
      await client.query(
        'UPDATE flights SET available_seats = available_seats - $1 WHERE id = $2',
        [passengers.length, flightId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          bookingReference: booking.booking_reference,
          totalAmount: parseFloat(booking.total_amount),
          currency: booking.currency,
          status: booking.status,
          paymentStatus: booking.payment_status
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: 'Unable to process booking. Please try again.'
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
        f.departure_datetime, f.arrival_datetime, f.flight_number,
        a.aircraft_type, a.manufacturer, a.model,
        o.company_name as operator_name, o.phone as operator_phone
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN aircraft a ON f.aircraft_id = a.id
      JOIN operators o ON f.operator_id = o.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    const booking = result.rows[0];

    // Get passengers
    const passengersResult = await db.query(
      'SELECT * FROM passengers WHERE booking_id = $1 ORDER BY created_at',
      [booking.id]
    );

    res.json({
      id: booking.id,
      bookingReference: booking.booking_reference,
      status: booking.status,
      paymentStatus: booking.payment_status,
      passengerCount: booking.passenger_count,
      totalAmount: parseFloat(booking.total_amount),
      currency: booking.currency,
      flight: {
        flightNumber: booking.flight_number,
        origin: `${booking.origin_city} (${booking.origin_code})`,
        destination: `${booking.destination_city} (${booking.destination_code})`,
        departure: booking.departure_datetime,
        arrival: booking.arrival_datetime,
        aircraft: `${booking.manufacturer} ${booking.model} (${booking.aircraft_type})`,
        operator: booking.operator_name,
        operatorPhone: booking.operator_phone
      },
      passengers: passengersResult.rows.map(p => ({
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        phone: p.phone
      })),
      specialRequests: booking.special_requests,
      cateringRequests: booking.catering_requests,
      groundTransportRequired: booking.ground_transport_required,
      dates: {
        booking: booking.booking_date,
        payment: booking.payment_date,
        confirmation: booking.confirmation_date,
        cancellation: booking.cancellation_date
      }
    });

  } catch (error) {
    console.error('Booking details error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking details'
    });
  }
});

module.exports = router;