const express = require('express');
const Database = require('better-sqlite3');
const { authenticateToken } = require('../middleware/auth');
const SimpleIDGenerator = require('../utils/idGenerator');
const path = require('path');

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Initialize database
const db = new Database(path.join(__dirname, '..', 'jetchance.db'));

// Create payments table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    flight_id TEXT NOT NULL,
    user_id TEXT,
    amount REAL NOT NULL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

// Create bookings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    booking_reference TEXT UNIQUE,
    flight_id TEXT NOT NULL,
    user_id TEXT,
    total_passengers INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

// Helper function to generate booking reference
function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'JC'; // JetChance prefix
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create PaymentIntent for Stripe Elements
router.post('/create-intent', async (req, res) => {
  try {
    const {
      amount, // Amount in cents
      currency = 'usd',
      flightId,
      customerInfo,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!amount || !flightId || !customerInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, flightId, customerInfo'
      });
    }

    // Verify flight exists
    const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount), // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        flightId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        flightRoute: `${flight.origin_code} → ${flight.destination_code}`,
        ...metadata // Include all the valuable business data
      },
      receipt_email: customerInfo.email,
      description: `JetChance Flight Booking - ${flight.origin_code} to ${flight.destination_code}`
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ PaymentIntent creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent'
    });
  }
});

// Process payment (mock)
router.post('/process', async (req, res) => {
  try {
    const {
      flightId,
      amount,
      passengers = 1,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!flightId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment information'
      });
    }

    // Verify flight exists
    const flight = db.prepare('SELECT * FROM flights WHERE id = ?').get(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    // Generate IDs using the new sequential pattern
    const paymentId = SimpleIDGenerator.generatePaymentId();
    const bookingId = SimpleIDGenerator.generateBookingId();
    const bookingReference = generateBookingReference();

    // Get user ID if authenticated
    const userId = req.user?.id || null;

    // Start transaction
    const insertPayment = db.prepare(`
      INSERT INTO payments (
        id, flight_id, user_id, amount, payment_method
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        id, booking_reference, flight_id, user_id, total_passengers, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
    `);

    const transaction = db.transaction(() => {
      // Insert payment record
      insertPayment.run(
        paymentId,
        flightId,
        userId,
        amount,
        JSON.stringify(paymentMethod)
      );

      // Insert booking record
      insertBooking.run(
        bookingId,
        bookingReference,
        flightId,
        userId,
        passengers,
        amount
      );

      // Update flight available seats (optional)
      if (flight.seats_available && flight.seats_available > 0) {
        const updateSeats = db.prepare('UPDATE flights SET seats_available = seats_available - ? WHERE id = ?');
        updateSeats.run(passengers, flightId);
      }
    });

    transaction();

    res.json({
      success: true,
      payment: {
        id: paymentId,
        transactionId: paymentId, // Use payment ID as transaction ID
        amount,
        currency: 'COL', // Always Colombian Pesos
        status: 'completed'
      },
      booking: {
        id: bookingId,
        booking_reference: bookingReference,
        reference: bookingReference,
        status: 'confirmed',
        flightId,
        passengers,
        totalAmount: amount
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
});

// Get user's bookings (requires authentication)
router.get('/bookings', (req, res) => {
  try {
    const userId = req.user?.id;
    
    let bookings;
    if (userId) {
      // Get bookings for authenticated user (no need for payment join since booking has all needed info)
      bookings = db.prepare(`
        SELECT 
          b.*,
          f.origin_code,
          f.destination_code,
          f.departure_time,
          f.aircraft_name,
          f.operator_name
        FROM bookings b
        JOIN flights f ON f.id = b.flight_id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `).all(userId);
    } else {
      // Return empty array for non-authenticated users
      bookings = [];
    }

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

module.exports = router;