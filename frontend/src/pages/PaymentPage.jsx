import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import StripePaymentForm from '../components/StripePaymentForm';
import { flightsAPI } from '../api/flightsAPI';

export default function PaymentPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get flight data from navigation state or fetch it
  const [flight, setFlight] = useState(location.state?.flight || null);
  const [selectedPassengers, setSelectedPassengers] = useState(location.state?.passengers || 1);
  const [price, setPrice] = useState(location.state?.price || 0);
  const [loading, setLoading] = useState(!flight);
  const [error, setError] = useState(null);

  // Fetch flight data if not passed via navigation
  useEffect(() => {
    if (!flight && flightId) {
      fetchFlight();
    }
  }, [flightId, flight]);

  const fetchFlight = async () => {
    try {
      setLoading(true);
      const response = await flightsAPI.getFlightById(flightId);
      if (response) {
        setFlight(response);
        setPrice(response.empty_leg_price || response.original_price || 0);
      } else {
        setError('Flight not found');
      }
    } catch (err) {
      console.error('Error fetching flight:', err);
      setError('Failed to load flight details');
    } finally {
      setLoading(false);
    }
  };

  // Format date helper function
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
      return 'Not specified';
    }
    
    try {
      // Handle different date formats
      let date;
      
      // Add more specific parsing for the format we expect from the database
      if (typeof dateTimeString === 'string') {
        // If it's in format "2025-09-20T14:12", add seconds for better parsing
        if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          date = new Date(dateTimeString + ':00');
        } else {
          date = new Date(dateTimeString);
        }
      } else {
        date = new Date(dateTimeString);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateTimeString);
        return 'Invalid date format';
      }
      
      const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    } catch (error) {
      console.error('Date formatting error:', error, 'for input:', dateTimeString);
      return 'Date unavailable';
    }
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment success result:', result);
    
    // Navigate to success page with booking details
    navigate('/booking-success', {
      state: {
        booking: result.booking,
        flight: flight,
        customerData: result.customerData,
        transactionId: result.transactionId,
        amount: result.amount
      }
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Could show error modal or toast notification
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Flight</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Flight not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Flight Details
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Booking Reference: Processing...
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Flight Summary - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Flight Summary</h2>
              
              {/* Route */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{flight.origin_code}</div>
                    <div className="text-sm text-gray-500">{flight.origin_city}</div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="border-t-2 border-dashed border-gray-300 relative">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-blue-600 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{flight.destination_code}</div>
                    <div className="text-sm text-gray-500">{flight.destination_city}</div>
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure:</span>
                  <span className="font-medium">
                    {formatDateTime(flight.departure_time || flight.departure_datetime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aircraft:</span>
                  <span className="font-medium">{flight.aircraft_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operator:</span>
                  <span className="font-medium">{flight.operator || flight.operator_name || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium">{selectedPassengers}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  {flight.original_price && flight.empty_leg_price < flight.original_price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Regular Price:</span>
                      <span className="text-gray-500 line-through">
                        ${flight.original_price.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Empty Leg Price:</span>
                    <span className="font-medium">${price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Passengers × {selectedPassengers}:</span>
                    <span className="font-medium">${(price * selectedPassengers).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${(price * selectedPassengers).toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* Savings Badge */}
                {flight.original_price && flight.empty_leg_price < flight.original_price && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          You're saving ${((flight.original_price - flight.empty_leg_price) * selectedPassengers).toLocaleString()}!
                        </div>
                        <div className="text-xs text-green-600">
                          {Math.round(((flight.original_price - flight.empty_leg_price) / flight.original_price) * 100)}% off regular price
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                    <p className="text-xs text-blue-600 mt-1">
                      Your payment is protected by 256-bit SSL encryption and processed securely by Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <StripePaymentForm
                  amount={price * selectedPassengers}
                  currency="USD"
                  flightId={flight.id}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  flightDetails={{
                    route: `${flight.origin_code} → ${flight.destination_code}`,
                    passengers: selectedPassengers,
                    date: flight.departure_time || flight.departure_datetime,
                    aircraft: flight.aircraft_name,
                    operator: flight.operator_name || flight.operator
                  }}
                />
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">Instant Confirmation</h3>
                    <p className="text-xs text-gray-600">Immediate booking confirmation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">Secure Payment</h3>
                    <p className="text-xs text-gray-600">PCI DSS compliant processing</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">24/7 Support</h3>
                    <p className="text-xs text-gray-600">Round-the-clock assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
