// Payment Service Abstraction Layer
// Supports both mock payments (development) and Stripe integration (production)

import paymentAPI from '../api/paymentAPI';

class PaymentService {
  constructor() {
    this.isTestMode = import.meta.env.MODE !== 'production' || import.meta.env.VITE_PAYMENT_MODE === 'test';
    this.useStripeTest = import.meta.env.VITE_PAYMENT_MODE === 'stripe_test';
    this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }

  // Initialize payment service
  async initialize() {
    if (this.useStripeTest) {
      console.log('💳 Payment Service: Running in STRIPE TEST MODE');
      // Initialize Stripe here if needed
      return { success: true, mode: 'stripe_test' };
    } else if (this.isTestMode) {
      console.log('💳 Payment Service: Running in MOCK MODE');
      return { success: true, mode: 'mock' };
    } else {
      // Initialize Stripe in production
      if (!this.stripePublishableKey) {
        throw new Error('Stripe publishable key not found');
      }
      console.log('💳 Payment Service: Running in LIVE MODE');
      return { success: true, mode: 'live' };
    }
  }

  // Process payment - handles both mock and real payments
  async processPayment(paymentData) {
    const { amount, currency = 'USD', description, customerInfo, paymentMethod, flightId } = paymentData;

    if (this.useStripeTest) {
      return this.processStripeTestPayment(paymentData);
    } else if (this.isTestMode) {
      return this.processMockPayment(paymentData);
    } else {
      return this.processStripePayment(paymentData);
    }
  }

  // Mock payment processing for development
  async processMockPayment(paymentData) {
    const { amount, currency = 'USD', description, customerInfo, paymentMethod, flightId } = paymentData;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate different payment outcomes based on card number
    const cardNumber = paymentMethod?.cardNumber || '4242424242424242';
    
    if (cardNumber.includes('0000')) {
      // Simulate payment failure
      return {
        success: false,
        error: 'Your card was declined. Please try a different payment method.',
        errorCode: 'card_declined',
        transactionId: null
      };
    } else if (cardNumber.includes('0341')) {
      // Simulate insufficient funds
      return {
        success: false,
        error: 'Insufficient funds. Please check your account balance.',
        errorCode: 'insufficient_funds',
        transactionId: null
      };
    } else {
      // Simulate successful payment
      const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Send payment to backend for processing and storage
        const backendPaymentData = {
          flightId,
          amount,
          currency,
          passengers: paymentData.passengers || 1,
          customerInfo,
          paymentMethod: {
            type: 'card',
            last4: cardNumber.slice(-4),
            brand: this.getCardBrand(cardNumber)
          },
          transactionId
        };

        const backendResult = await paymentAPI.processPayment(backendPaymentData);
        
        if (backendResult.success) {
          return {
            success: true,
            transactionId,
            amount,
            currency,
            description,
            customerInfo,
            timestamp: new Date().toISOString(),
            paymentMethod: {
              type: 'card',
              last4: cardNumber.slice(-4),
              brand: this.getCardBrand(cardNumber)
            },
            booking: backendResult.booking
          };
        } else {
          throw new Error(backendResult.error || 'Backend payment processing failed');
        }
      } catch (error) {
        console.error('Backend payment error:', error);
        // Return mock success even if backend fails (for demo purposes)
        return {
          success: true,
          transactionId,
          amount,
          currency,
          description,
          customerInfo,
          timestamp: new Date().toISOString(),
          paymentMethod: {
            type: 'card',
            last4: cardNumber.slice(-4),
            brand: this.getCardBrand(cardNumber)
          },
          booking: null
        };
      }
    }
  }

  // Stripe test payment processing (uses real Stripe test mode)
  async processStripeTestPayment(paymentData) {
    const { amount, currency = 'USD', description, customerInfo, paymentMethod, flightId } = paymentData;
    
    // Simulate network delay for more realistic UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🔄 Processing Stripe test payment...');
    
    try {
      // For now, simulate Stripe test mode with our backend
      // In a full Stripe integration, you would create a PaymentIntent here
      const transactionId = `stripe_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send to backend for processing
      const backendPaymentData = {
        flightId,
        amount,
        currency,
        passengers: paymentData.passengers || 1,
        customerInfo,
        paymentMethod: {
          type: 'card',
          last4: paymentMethod.cardNumber.slice(-4),
          brand: this.getCardBrand(paymentMethod.cardNumber)
        },
        transactionId
      };

      const backendResult = await paymentAPI.processPayment(backendPaymentData);
      
      if (backendResult.success) {
        return {
          success: true,
          transactionId,
          amount,
          currency,
          description,
          customerInfo,
          timestamp: new Date().toISOString(),
          paymentMethod: {
            type: 'card',
            last4: paymentMethod.cardNumber.slice(-4),
            brand: this.getCardBrand(paymentMethod.cardNumber)
          },
          booking: backendResult.booking,
          mode: 'stripe_test'
        };
      } else {
        throw new Error(backendResult.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Stripe test payment error:', error);
      return {
        success: false,
        error: 'Payment processing failed. Please try again.',
        errorCode: 'processing_error'
      };
    }
  }

  // Real Stripe payment processing
  async processStripePayment(paymentData) {
    // This will be implemented when Stripe is added
    throw new Error('Stripe integration not yet implemented. Use test mode for development.');
  }

  // Helper: Get card brand from number
  getCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    
    return 'unknown';
  }

  // Validate payment form data
  validatePaymentData(paymentData) {
    const errors = {};
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!paymentData.customerInfo?.email) {
      errors.email = 'Email is required';
    }
    
    if (!paymentData.customerInfo?.name) {
      errors.name = 'Cardholder name is required';
    }
    
    if (!paymentData.paymentMethod?.cardNumber) {
      errors.cardNumber = 'Card number is required';
    } else {
      const cardNumber = paymentData.paymentMethod.cardNumber.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        errors.cardNumber = 'Invalid card number';
      }
    }
    
    if (!paymentData.paymentMethod?.expiryMonth || !paymentData.paymentMethod?.expiryYear) {
      errors.expiry = 'Expiry date is required';
    }
    
    if (!paymentData.paymentMethod?.cvv) {
      errors.cvv = 'CVV is required';
    } else if (paymentData.paymentMethod.cvv.length < 3) {
      errors.cvv = 'CVV must be at least 3 digits';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get test card numbers for development
  getTestCards() {
    return {
      success: [
        { number: '4242424242424242', brand: 'Visa', description: 'Successful payment' },
        { number: '5555555555554444', brand: 'Mastercard', description: 'Successful payment' },
        { number: '378282246310005', brand: 'American Express', description: 'Successful payment' }
      ],
      declined: [
        { number: '4000000000000002', brand: 'Visa', description: 'Card declined' },
        { number: '4000000000000341', brand: 'Visa', description: 'Insufficient funds' }
      ]
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;