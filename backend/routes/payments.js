const express = require('express');
const Database = require('better-sqlite3');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// Initialize database
const db = new Database(path.join(__dirname, '..', 'flights.db'));

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

// @route   POST /api/payments/create-intent
// @desc    Create payment intent for booking
// @access  Private
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get booking details
    const bookingResult = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3',
      [bookingId, req.user.id, 'pending']
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'Booking not found or not eligible for payment'
      });
    }

    const booking = bookingResult.rows[0];

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total_amount * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        userId: req.user.id
      }
    });

    // Update booking with payment intent ID
    await db.query(
      'UPDATE bookings SET payment_intent_id = $1, payment_status = $2 WHERE id = $3',
      [paymentIntent.id, 'processing', booking.id]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: 'Unable to process payment. Please try again.'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook events
// @access  Public (but verified)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update booking status
        await db.query(
          'UPDATE bookings SET payment_status = $1, payment_date = NOW(), status = $2 WHERE payment_intent_id = $3',
          ['paid', 'confirmed', paymentIntent.id]
        );
        
        console.log('Payment succeeded for:', paymentIntent.metadata.bookingReference);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        await db.query(
          'UPDATE bookings SET payment_status = $1 WHERE payment_intent_id = $2',
          ['failed', failedPayment.id]
        );
        
        console.log('Payment failed for:', failedPayment.metadata.bookingReference);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: 'Webhook processing failed'
    });
  }
});

module.exports = router;