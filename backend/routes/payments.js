const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

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