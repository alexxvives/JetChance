import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, DocumentTextIcon, EnvelopeIcon, CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../contexts/TranslationContext';

const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `COP ${formatted}`;
};

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  const {
    booking,
    flight,
    customerData,
    transactionId,
    amount,
    paymentMethod
  } = location.state || {};

  console.log('BookingSuccessPage received state:', { booking, flight, customerData, transactionId, amount, paymentMethod });

  useEffect(() => {
    console.log('BookingSuccessPage useEffect - checking data...');
    console.log('Booking:', booking);
    console.log('Flight:', flight);
    console.log('Payment Method:', paymentMethod);
    console.log('Full location.state:', location.state);
    
    // If no booking data, redirect to home
    if (!booking || !flight) {
      console.log('Missing booking or flight data, redirecting to home');
      console.log('Missing booking:', !booking);
      console.log('Missing flight:', !flight);
      navigate('/', { replace: true });
    }
  }, [booking, flight, navigate]);

  if (!booking || !flight) {
    return null;
  }

  const handleViewBookings = () => {
    navigate('/dashboard', { state: { activeTab: 'bookings' } });
  };

  const handleBookAnother = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('bookingSuccess.title')}</h1>
          <p className="text-lg text-gray-600">
            {t('bookingSuccess.subtitle')}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{t('bookingSuccess.bookingReference')}</h2>
                <p className="text-green-100 text-sm">{t('bookingSuccess.keepReference')}</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-white font-mono text-lg font-bold">
                  {booking?.booking_reference || booking?.id || 'N/A'}
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
                  {t('bookingSuccess.flightDetails')}
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
                    <span className="text-gray-600">{t('bookingSuccess.departure')}:</span>
                    <span className="font-medium">
                      {(() => {
                        const departureDate = flight.departure_time || flight.departure_datetime;
                        if (departureDate) {
                          const date = new Date(departureDate);
                          const dateStr = date.toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
                            day: '2-digit',
                            month: 'long'
                          });
                          const timeStr = date.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            timeZoneName: 'short'
                          });
                          return `${dateStr} at ${timeStr}`;
                        }
                        return 'Date unavailable';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('bookingSuccess.flightTime')}:</span>
                    <span className="font-medium">
                      {flight.flight_time || 'Duration unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('bookingSuccess.aircraft')}:</span>
                    <span className="font-medium">{flight.aircraft_model || flight.aircraft_name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('bookingSuccess.operator')}:</span>
                    <span className="font-medium">{flight.operator_name || flight.operator || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('bookingSuccess.passengers')}:</span>
                    <span className="font-medium">{booking?.passengers || booking?.passengerCount || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Passenger & Payment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  {t('bookingSuccess.passengerInfo')}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lead Passenger:</span>
                    <span className="font-medium">
                      {customerData?.firstName && customerData?.lastName 
                        ? `${customerData.firstName} ${customerData.lastName}`
                        : 'Not specified'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{customerData?.email || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{customerData?.phone || 'Not specified'}</span>
                  </div>
                  {customerData?.companyName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{customerData.companyName}</span>
                    </div>
                  )}
                </div>

                <h4 className="text-md font-semibold text-gray-900 mb-3">{t('bookingSuccess.paymentSummary')}</h4>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('bookingSuccess.paymentMethod')}:</span>
                    <span className="font-medium">
                      {(paymentMethod || booking?.payment_method) === 'CREDIT_CARD' ? t('bookingSuccess.creditCard') : 
                       (paymentMethod || booking?.payment_method) === 'PSE' ? t('bookingSuccess.pse') : 
                       (paymentMethod || booking?.payment_method) === 'CASH' ? t('bookingSuccess.cash') :
                       (paymentMethod || booking?.payment_method) || t('bookingSuccess.notSpecified')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('bookingSuccess.amountPaid')}:</span>
                    <span className="font-medium">{formatCOP(amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('bookingSuccess.paymentStatus')}:</span>
                    <span className="text-green-600 font-medium">{t('bookingSuccess.completed')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {customerData?.specialRequests && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('bookingSuccess.specialRequests')}</h3>
            <p className="text-gray-700">{customerData.specialRequests}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('bookingSuccess.whatNext')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{t('bookingSuccess.confirmationEmail')}</h4>
                <p className="text-sm text-gray-600">{t('bookingSuccess.confirmationEmailDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{t('bookingSuccess.flightPreparation')}</h4>
                <p className="text-sm text-gray-600">{t('bookingSuccess.flightPreparationDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{t('bookingSuccess.customerSupport')}</h4>
                <p className="text-sm text-gray-600">{t('bookingSuccess.customerSupportDesc')}</p>
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
            {t('bookingSuccess.viewBookings')}
          </button>
          
          <button
            onClick={handleBookAnother}
            className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center"
          >
            <MapPinIcon className="h-5 w-5 mr-2" />
            {t('bookingSuccess.bookAnother')}
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('bookingSuccess.needHelp')}</h3>
            <p className="text-gray-600 mb-4">{t('bookingSuccess.supportDesc')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center text-gray-700">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                support@jetchance.com
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
