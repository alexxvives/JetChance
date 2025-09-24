import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCardIcon, LockClosedIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import paymentAPI from '../api/paymentAPI';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
  disableLink: true, // Disable any Stripe Link autofill features
};

// Inner payment form component that uses Stripe hooks
function PaymentFormInner({ amount, currency = 'USD', onPaymentSuccess, onPaymentError, flightDetails, flightId }) {
  const stripe = useStripe();
  const elements = useElements();

  // Customer data state (your valuable data collection)
  const [customerData, setCustomerData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Billing Address
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
    
    // Business Intelligence Data
    hearAboutUs: '',
    specialRequests: '',
    dietaryRequirements: '',
    
    // Marketing Data
    newsletterSubscription: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [cardError, setCardError] = useState(null);

  const handleCustomerDataChange = (field, value) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateCustomerData = () => {
    const newErrors = {};
    
    if (!customerData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!customerData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!customerData.email.trim()) newErrors.email = 'Email is required';
    if (!customerData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Billing address validation
    if (!customerData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
    if (!customerData.billingCity.trim()) newErrors.billingCity = 'City is required';
    if (!customerData.billingState.trim()) newErrors.billingState = 'State/Province is required';
    if (!customerData.billingZip.trim()) newErrors.billingZip = 'ZIP/Postal code is required';
    if (!customerData.billingCountry.trim()) newErrors.billingCountry = 'Country is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerData.email && !emailRegex.test(customerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrors({});
    setCardError(null);

    // Validate customer data
    const validationErrors = validateCustomerData();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Step 1: Create PaymentIntent on backend
      const paymentIntentResponse = await paymentAPI.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        flightId,
        customerInfo: {
          name: `${customerData.firstName} ${customerData.lastName}`,
          email: customerData.email,
          phone: customerData.phone
        },
        metadata: {
          // Your valuable business intelligence data
          hearAboutUs: customerData.hearAboutUs,
          specialRequests: customerData.specialRequests,
          dietaryRequirements: customerData.dietaryRequirements,
          billingAddress: customerData.billingAddress,
          billingCity: customerData.billingCity,
          billingState: customerData.billingState,
          billingZip: customerData.billingZip,
          billingCountry: customerData.billingCountry,
          newsletterSubscription: customerData.newsletterSubscription,
          flightRoute: flightDetails?.route,
          passengers: flightDetails?.passengers
        }
      });

      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.error || 'Failed to create payment intent');
      }

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${customerData.firstName} ${customerData.lastName}`,
              email: customerData.email,
              phone: customerData.phone,
              address: {
                line1: customerData.billingAddress,
                city: customerData.billingCity,
                state: customerData.billingState,
                postal_code: customerData.billingZip,
                country: customerData.billingCountry,
              },
            },
          }
        }
      );

      if (error) {
        setCardError(error.message);
        onPaymentError({ error: error.message });
      } else {
        // Payment succeeded! Create booking record
        const booking = {
          id: paymentIntent.id, // Use payment intent ID as booking ID
          bookingReference: `CF${paymentIntent.id.substr(-8).toUpperCase()}`,
          flightId: flightId,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: new Date().toISOString(),
          passengers: parseInt(customerData.passengers) || 1,
          totalAmount: amount,
          currency: currency
        };

        onPaymentSuccess({
          success: true,
          paymentIntent,
          booking, // Include booking data
          customerData, // Your valuable data
          transactionId: paymentIntent.id,
          amount,
          currency
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ payment: error.message });
      onPaymentError({ error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const hearAboutUsOptions = [
    'Google Search',
    'Social Media',
    'Friend Referral',
    'Business Partner',
    'Advertisement',
    'Industry Event',
    'Other'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <CreditCardIcon className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
        </div>
        <p className="text-gray-600">Secure payment powered by Stripe</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Section - YOUR VALUABLE DATA */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Passenger Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={customerData.firstName}
                onChange={(e) => handleCustomerDataChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={customerData.lastName}
                onChange={(e) => handleCustomerDataChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Billing Address *
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={customerData.billingAddress}
                onChange={(e) => handleCustomerDataChange('billingAddress', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main Street"
              />
              {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={customerData.billingCity}
                onChange={(e) => handleCustomerDataChange('billingCity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.billingCity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Bogotá"
              />
              {errors.billingCity && <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province *
              </label>
              <input
                type="text"
                value={customerData.billingState}
                onChange={(e) => handleCustomerDataChange('billingState', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.billingState ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="NY"
              />
              {errors.billingState && <p className="text-red-500 text-xs mt-1">{errors.billingState}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code *
              </label>
              <input
                type="text"
                value={customerData.billingZip}
                onChange={(e) => handleCustomerDataChange('billingZip', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.billingZip ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="10001"
              />
              {errors.billingZip && <p className="text-red-500 text-xs mt-1">{errors.billingZip}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={customerData.billingCountry}
                onChange={(e) => handleCustomerDataChange('billingCountry', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.billingCountry ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="JP">Japan</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.billingCountry && <p className="text-red-500 text-xs mt-1">{errors.billingCountry}</p>}
            </div>
          </div>
        </div>

        {/* Business Intelligence Data Collection */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Travel Preferences & Business Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How did you hear about us?
              </label>
              <select
                value={customerData.hearAboutUs}
                onChange={(e) => handleCustomerDataChange('hearAboutUs', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an option</option>
                {hearAboutUsOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests / Dietary Requirements
              </label>
              <textarea
                value={customerData.specialRequests}
                onChange={(e) => handleCustomerDataChange('specialRequests', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special accommodations, accessibility needs, or dietary restrictions..."
              />
              
              {/* Newsletter Subscription - Closer to input */}
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customerData.newsletterSubscription}
                    onChange={(e) => handleCustomerDataChange('newsletterSubscription', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Subscribe to our newsletter for exclusive empty leg deals
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Card Element */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Payment Information
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-3 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
            {cardError && <p className="text-red-500 text-xs mt-2">{cardError}</p>}
          </div>

          <div className="text-xs text-gray-500 mb-4">
            <p className="flex items-center">
              <LockClosedIcon className="h-4 w-4 mr-1" />
              Your payment information is processed securely by Stripe. We never store your card details.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg ${
            !stripe || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
          } transition-colors`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Complete Payment - $${amount.toLocaleString()} ${currency}`
          )}
        </button>

        {/* Error Display */}
        {errors.payment && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.payment}</p>
          </div>
        )}
      </form>
    </div>
  );
}

// Main component wrapper with Elements provider
export default function StripePaymentForm({ amount, currency = 'USD', onPaymentSuccess, onPaymentError, flightDetails, flightId }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner
        amount={amount}
        currency={currency}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        flightDetails={flightDetails}
        flightId={flightId}
      />
    </Elements>
  );
}
