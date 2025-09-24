import React, { useState, useEffect } from 'react';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import paymentService from '../services/paymentService';

export default function PaymentForm({ amount, currency = 'USD', onPaymentSuccess, onPaymentError, flightDetails, flightId }) {
  const [paymentData, setPaymentData] = useState({
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    paymentMethod: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    }
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTestCards, setShowTestCards] = useState(false);

  // Initialize payment service
  useEffect(() => {
    const initPayment = async () => {
      try {
        const result = await paymentService.initialize();
        console.log('Payment service initialized:', result.mode);
      } catch (error) {
        console.error('Payment initialization error:', error);
      }
    };
    initPayment();
  }, []);

  const handleInputChange = (category, field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Max length with spaces
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    handleInputChange('paymentMethod', 'cardNumber', formatted);
  };

  const generateExpiryYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  const handleTestCardSelect = (testCard) => {
    handleInputChange('paymentMethod', 'cardNumber', formatCardNumber(testCard.number));
    handleInputChange('paymentMethod', 'expiryMonth', '12');
    handleInputChange('paymentMethod', 'expiryYear', '2028');
    handleInputChange('paymentMethod', 'cvv', '123');
    setShowTestCards(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrors({});

    const paymentRequest = {
      flightId,
      amount,
      currency,
      passengers: flightDetails?.passengers || 1,
      description: `Flight booking: ${flightDetails?.route || 'Charter Flight'}`,
      customerInfo: paymentData.customerInfo,
      paymentMethod: {
        ...paymentData.paymentMethod,
        cardNumber: paymentData.paymentMethod.cardNumber.replace(/\s/g, '') // Remove spaces
      }
    };

    // Validate payment data
    const validation = paymentService.validatePaymentData(paymentRequest);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsProcessing(false);
      return;
    }

    try {
      const result = await paymentService.processPayment(paymentRequest);
      
      if (result.success) {
        onPaymentSuccess(result);
      } else {
        setErrors({ payment: result.error });
        onPaymentError(result);
      }
    } catch (error) {
      setErrors({ payment: 'Payment processing failed. Please try again.' });
      onPaymentError({ error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const testCards = paymentService.getTestCards();

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <CreditCardIcon className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
        </div>
        <p className="text-gray-600">Secure payment processing</p>
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💳 <strong>STRIPE TEST MODE</strong> - Using real Stripe test environment
          </p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            ${amount?.toLocaleString()} {currency}
          </span>
        </div>
        {flightDetails && (
          <p className="text-sm text-gray-500 mt-1">{flightDetails.route}</p>
        )}
      </div>

      {/* Test Cards Helper */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowTestCards(!showTestCards)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showTestCards ? 'Hide' : 'Show'} test card numbers
        </button>
        
        {showTestCards && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800 mb-2">🔥 Official Stripe Test Cards (click to use):</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleTestCardSelect({ number: '4242424242424242', brand: 'Visa', description: 'Successful payment' })}
                className="block w-full text-left text-xs p-2 hover:bg-green-100 rounded"
              >
                <strong>4242 4242 4242 4242</strong> - Visa (Success)
              </button>
              <button
                type="button"
                onClick={() => handleTestCardSelect({ number: '5555555555554444', brand: 'Mastercard', description: 'Successful payment' })}
                className="block w-full text-left text-xs p-2 hover:bg-green-100 rounded"
              >
                <strong>5555 5555 5555 4444</strong> - Mastercard (Success)
              </button>
              <button
                type="button"
                onClick={() => handleTestCardSelect({ number: '4000000000000002', brand: 'Visa', description: 'Card declined' })}
                className="block w-full text-left text-xs p-2 hover:bg-green-100 rounded"
              >
                <strong>4000 0000 0000 0002</strong> - Visa (Declined)
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={paymentData.customerInfo.name}
                onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={paymentData.customerInfo.email}
                onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={paymentData.customerInfo.phone}
                onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                required
                value={paymentData.paymentMethod.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  required
                  value={paymentData.paymentMethod.expiryMonth}
                  onChange={(e) => handleInputChange('paymentMethod', 'expiryMonth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  required
                  value={paymentData.paymentMethod.expiryYear}
                  onChange={(e) => handleInputChange('paymentMethod', 'expiryYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">YYYY</option>
                  {generateExpiryYears().map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  required
                  value={paymentData.paymentMethod.cvv}
                  onChange={(e) => handleInputChange('paymentMethod', 'cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>
            {(errors.expiry || errors.cvv) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.expiry || errors.cvv}
              </p>
            )}
          </div>
        </div>

        {/* Payment Error */}
        {errors.payment && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.payment}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <LockClosedIcon className="h-4 w-4 mr-2" />
              Pay ${amount?.toLocaleString()} {currency}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          🔒 Your payment information is secure and encrypted
        </p>
      </form>
    </div>
  );
}
