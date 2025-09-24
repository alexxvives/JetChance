import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, DocumentTextIcon, EnvelopeIcon, CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    booking,
    flight,
    customerData,
    transactionId,
    amount
  } = location.state || {};

  console.log('BookingSuccessPage received state:', { booking, flight, customerData, transactionId, amount });

  useEffect(() => {
    // If no booking data, redirect to home
    if (!booking || !flight) {
      console.log('Missing booking or flight data, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [booking, flight, navigate]);

  if (!booking || !flight) {
    return null;
  }

  const handleViewBookings = () => {
    navigate('/my-bookings');
  };

  const handleBookAnother = () => {
    navigate('/flights');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your private jet flight has been successfully booked
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Booking Reference</h2>
                <p className="text-green-100 text-sm">Keep this reference for your records</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-white font-mono text-lg font-bold">
                  {booking.booking_reference || booking.id}
                </span>
              </div>
            </div>
          </div>

          {/* Flight Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Flight Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Flight Details
                </h3>
                
                {/* Route */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{flight.origin_code}</div>
                      <div className="text-sm text-gray-500">{flight.origin_city}</div>
                      <div className="text-sm text-gray-500">{flight.origin_country}</div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="border-t-2 border-dashed border-gray-300 relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-green-600 rounded-full p-1">
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
                      <div className="text-sm text-gray-500">{flight.destination_country}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure:</span>
                    <span className="font-medium">
                      {new Date(flight.departure_datetime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {new Date(flight.departure_datetime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aircraft:</span>
                    <span className="font-medium">{flight.aircraft_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operator:</span>
                    <span className="font-medium">{flight.operator_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-medium">{booking.passengers}</span>
                  </div>
                </div>
              </div>

              {/* Passenger & Payment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Passenger Information
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lead Passenger:</span>
                    <span className="font-medium">{customerData?.firstName} {customerData?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{customerData?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{customerData?.phone}</span>
                  </div>
                  {customerData?.companyName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{customerData.companyName}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-md font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">${amount?.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="text-green-600 font-medium">✓ Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {customerData?.specialRequests && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
            <p className="text-gray-700">{customerData.specialRequests}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Confirmation Email</h4>
                <p className="text-sm text-gray-600">Check your email for detailed booking confirmation and flight information.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Flight Preparation</h4>
                <p className="text-sm text-gray-600">Arrive at the airport 30 minutes before departure. Bring valid ID.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Customer Support</h4>
                <p className="text-sm text-gray-600">Our team is available 24/7 for any questions or changes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleViewBookings}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            View My Bookings
          </button>
          
          <button
            onClick={handleBookAnother}
            className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center"
          >
            <MapPinIcon className="h-5 w-5 mr-2" />
            Book Another Flight
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">Our customer support team is here to assist you</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center text-gray-700">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                support@chancefly.com
              </div>
              <div className="text-gray-700">
                📞 +1 (555) 123-4567
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
