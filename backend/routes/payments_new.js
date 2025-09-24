const express = require('express');
const Database = require('better-sqlite3');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Initialize database
const db = new Database(path.join(__dirname, '..', 'chancefly.db'));

// Create payments table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    flight_id TEXT NOT NULL,
    user_id TEXT,
    transaction_id TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'completed',
    payment_method TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    passengers INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights (id)
  )
`);

// Create bookings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    flight_id TEXT NOT NULL,
    user_id TEXT,
    payment_id TEXT,
    status TEXT DEFAULT 'confirmed',
    passengers INTEGER DEFAULT 1,
    total_amount REAL NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    booking_reference TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights (id),
    FOREIGN KEY (payment_id) REFERENCES payments (id)
  )
`);

// Helper function to generate booking reference
function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CF'; // ChanceFly prefix
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
      description: `ChanceFly Flight Booking - ${flight.origin_code} to ${flight.destination_code}`
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
      currency = 'USD',
      passengers = 1,
      customerInfo,
      paymentMethod,
      transactionId
    } = req.body;

    // Validate required fields
    if (!flightId || !amount || !customerInfo || !transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment information'
      });
    }

    // Check if transaction already exists
    const existingPayment = db.prepare('SELECT id FROM payments WHERE transaction_id = ?').get(transactionId);
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Transaction already processed'
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

    // Generate IDs
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bookingReference = generateBookingReference();

    // Get user ID if authenticated
    const userId = req.user?.id || null;

    // Start transaction
    const insertPayment = db.prepare(`
      INSERT INTO payments (
        id, flight_id, user_id, transaction_id, amount, currency, 
        payment_method, customer_name, customer_email, customer_phone, 
        passengers, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `);

    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        id, flight_id, user_id, payment_id, passengers, total_amount,
        customer_name, customer_email, customer_phone, booking_reference, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `);

    const transaction = db.transaction(() => {
      // Insert payment record
      insertPayment.run(
        paymentId,
        flightId,
        userId,
        transactionId,
        amount,
        currency,
        JSON.stringify(paymentMethod),
        customerInfo.name,
        customerInfo.email,
        customerInfo.phone || null,
        passengers
      );

      // Insert booking record
      insertBooking.run(
        bookingId,
        flightId,
        userId,
        paymentId,
        passengers,
        amount,
        customerInfo.name,
        customerInfo.email,
        customerInfo.phone || null,
        bookingReference
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
        transactionId,
        amount,
        currency,
        status: 'completed'
      },
      booking: {
        id: bookingId,
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
      // Get bookings for authenticated user
      bookings = db.prepare(`
        SELECT 
          b.*,
          f.origin,
          f.destination,
          f.departure_time,
          f.aircraft_name,
          f.operator_name,
          p.transaction_id,
          p.amount as payment_amount,
          p.currency
        FROM bookings b
        JOIN flights f ON f.id = b.flight_id
        JOIN payments p ON p.id = b.payment_id
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