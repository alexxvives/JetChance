import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, UsersIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import FreeFlightMap from '../components/FreeFlightMap';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';

// Helper function to format Colombian Peso currency
const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `COP ${formatted}`;
};

export default function FlightDetailsPage() {
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPassengers, setSelectedPassengers] = useState(1);
  const [coordinateStatus, setCoordinateStatus] = useState(null);

  useEffect(() => {
    // Find flight by ID using appropriate API
    const loadFlight = async () => {
      try {
        console.log('🔍 Loading flight with ID:', id);
        if (shouldUseRealAPI()) {
          const foundFlight = await flightsAPI.getFlightById(id);
          console.log('✅ Real API flight data:', foundFlight);
          setFlight(foundFlight);
         } else {
          console.log('❌ No API configured');
          setFlight(null);
        }
      } catch (error) {
        console.error('❌ Error loading flight:', error);
        setFlight(null);
      } finally {
        setLoading(false);
      }
    };

    loadFlight();
  }, [id]);

  // Set selectedPassengers to available seats when flight data loads
  useEffect(() => {
    if (!flight) {
      return;
    }

    const fallbackMaxPassengers = flight.max_passengers ?? flight.capacity?.maxPassengers ?? 8;
    const initialSeats = flight.available_seats ?? flight.seats_available ?? flight.capacity?.availableSeats ?? fallbackMaxPassengers;

    if (initialSeats !== undefined && initialSeats !== null) {
      setSelectedPassengers(initialSeats > 0 ? initialSeats : 0);
    }
  }, [flight]);

  if (loading) {
    return (
      <DashboardLayout user={user} activeTab="flights">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('flightDetails.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!flight) {
    return (
      <DashboardLayout user={user} activeTab="flights">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">{t('flightDetails.notFound')}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('flightDetails.backToDashboard')}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Add safety checks for calculations
  console.log('🛩️ Flight object:', flight);
  console.log('🖼️ Flight images:', flight.images);
  console.log('🖼️ Aircraft image URL:', flight.aircraft_image_url);
  console.log('🌐 API Base URL:', import.meta.env.VITE_API_URL);
  console.log('⏰ Departure time:', flight.departure_time);
  console.log('⏰ Arrival time:', flight.arrival_time);
  console.log('⏱️ Duration:', flight.duration);
  // Since operators now input per-seat prices, we need to calculate total charter prices for display
  const pricePerSeat = flight.price || flight.seat_leg_price || flight.empty_leg_price || 0; // Empty leg price per seat
  const originalPricePerSeat = flight.original_price || flight.seat_market_price || pricePerSeat; // Market price per seat
  const maxPassengers = flight.max_passengers || flight.capacity?.maxPassengers || 8;
  const availableSeats = flight.available_seats ?? flight.seats_available ?? flight.capacity?.availableSeats ?? maxPassengers;
  const hasExistingBookings = availableSeats < maxPassengers;
  const remainingSeatsForPrivacy = Math.max(availableSeats - selectedPassengers, 0);
  const bookedSeats = maxPassengers - availableSeats;
  const showPrivacyWarning = !hasExistingBookings && selectedPassengers < maxPassengers;
  const showSharedFlightWarning = hasExistingBookings;
  
  // Calculate total charter prices (full charter regardless of passenger count)
  const charterPrice = pricePerSeat * maxPassengers; // Charter Price = empty leg price * max passengers
  const marketPrice = originalPricePerSeat * maxPassengers; // Market Price = market price * max passengers
  
  // For booking calculations (what user actually pays based on selected passengers)
  const price = pricePerSeat * selectedPassengers;
  const originalPrice = originalPricePerSeat * selectedPassengers;
  
  const savings = marketPrice - charterPrice;
  const savingsPercentage = marketPrice > 0 ? Math.round((savings / marketPrice) * 100) : 0;
  console.log('💰 Price calculations:', { 
    pricePerSeat,
    originalPricePerSeat,
    maxPassengers, 
    selectedPassengers,
    charterPrice,
    marketPrice,
    price, 
    originalPrice, 
    savings, 
    savingsPercentage 
  });

  const startBookingProcess = () => {
    // Operators and admins cannot book flights
    if (user?.role === 'operator' || user?.role === 'admin' || user?.role === 'super-admin') {
      return; // Do nothing - just decorative for operators and admins
    }
    
    // Navigate to dedicated payment page with flight data
    navigate(`/payment/${flight.id}`, {
      state: {
        flight: flight,
        passengers: selectedPassengers,
        price: price // This is now pricePerSeat * selectedPassengers
      }
    });
  };

  // Check if user is an operator or admin (cannot book flights)
  const isOperator = user?.role === 'operator' || user?.role === 'admin' || user?.role === 'super-admin';

  return (
    <DashboardLayout user={user} activeTab="flights">
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {t('flightDetails.backToFlights')}
          </button>

        {/* Flight Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          {/* Aircraft Header */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {flight.aircraft_model || flight.aircraft_name || 'Private Jet'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {flight.departure_time ? (() => {
                      const dateStr = new Date(flight.departure_time).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      });
                      // Capitalize the first letter
                      return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                    })() : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {flight.originCode || flight.origin_code || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('flightDetails.origin')}
                </div>
              </div>
              
              <div className="flex-1 px-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                  </div>
                  <div className="relative flex items-center">
                    <div style={{marginLeft: '10%'}}>
                      <svg className="w-10 h-10 text-blue-500 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {flight.destinationCode || flight.destination_code || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('flightDetails.destination')}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {flight.available_seats ?? flight.capacity?.availableSeats ?? flight.seats_available ?? 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('flightDetails.availableSeats')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {maxPassengers}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('flightDetails.totalSeats')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {flight.operator || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('flightDetails.operator')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {flight.flight_time || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{t('flightDetails.flightTime')}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Flight Route */}
          <div className="space-y-6">
            {/* Flight Route */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">{t('flightDetails.flightRoute')}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {flight.originCode || flight.origin_code || 'TBD'} {t('flightDetails.routeTo')} {flight.destinationCode || flight.destination_code || 'TBD'} • {flight.flight_time || 'TBD'}
                </p>
              </div>
              <div className="relative">
                <FreeFlightMap flight={flight} onCoordinateStatus={setCoordinateStatus} />
              </div>
            </div>
          </div>

          {/* Right Panel - Pricing */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 h-full relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{t('flightDetails.pricing')}</h2>
              </div>

              {/* Price Comparison Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Market Price Card - Now on the LEFT */}
                {marketPrice > charterPrice ? (
                  <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs text-red-600 font-medium mb-1">{t('flightDetails.marketPrice')}</div>
                    <div className="text-xl font-bold text-red-400 line-through">{formatCOP(marketPrice)}</div>
                    <div className="text-xs text-red-600 mt-1">{formatCOP(originalPricePerSeat)} {t('flightDetails.perSeat')}</div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-xs text-gray-600 font-medium mb-1">{t('flightDetails.marketPrice')}</div>
                    <div className="text-xl font-bold text-gray-700">{formatCOP(marketPrice)}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatCOP(originalPricePerSeat)} {t('flightDetails.perSeat')}</div>
                  </div>
                )}

                {/* Charter Price Card - Now on the RIGHT */}
                <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg relative">
                  <div className="text-xs text-blue-600 font-medium mb-1">{t('flightDetails.charterPrice')}</div>
                  <div className="text-xl font-bold text-blue-700">{formatCOP(charterPrice)}</div>
                  <div className="text-xs text-blue-600 mt-1">{formatCOP(pricePerSeat)} {t('flightDetails.perSeat')}</div>
                </div>
              </div>

              {/* Passenger Selection - Positioned above button, shifts up when warning appears */}
              <div className={`absolute left-6 right-6 p-4 bg-gray-50 rounded-xl transition-all duration-200 ${
                (showPrivacyWarning || showSharedFlightWarning) ? 'bottom-40' : 'bottom-28'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('flightDetails.passengers')}</h3>
                    <p className="text-sm text-gray-600">{availableSeats} {t('flightDetails.seatsAvailable')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedPassengers(Math.max(availableSeats > 0 ? 1 : 0, selectedPassengers - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg">−</span>
                    </button>
                    <span className="font-semibold text-lg w-8 text-center">{selectedPassengers}</span>
                    <button
                      onClick={() => setSelectedPassengers(Math.min(availableSeats, selectedPassengers + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Warning - Appears between passenger selector and button when needed */}
              {showPrivacyWarning && (
                <div className="absolute left-6 right-6 bottom-28">
                  <p className="text-xs text-gray-500 flex items-center justify-center transition-all duration-200">
                    <span className="mr-1">⚠</span>
                    {t('flightDetails.privateFlightWarning').replace('{remainingSeats}', remainingSeatsForPrivacy)}
                  </p>
                </div>
              )}

              {/* Shared Flight Warning - Appears when flight already has bookings */}
              {showSharedFlightWarning && (
                <div className="absolute left-6 right-6 bottom-28">
                  <p className="text-xs text-gray-500 flex items-center justify-center transition-all duration-200">
                    <span className="mr-1">⚠</span>
                    {t('flightDetails.sharedFlightWarning').replace('{bookedSeats}', bookedSeats)}
                  </p>
                </div>
              )}

              {/* Action Button - Fixed position at bottom */}
              <div className="absolute bottom-6 left-6 right-6">
                <button 
                  onClick={startBookingProcess}
                  disabled={isOperator}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                    isOperator 
                      ? 'bg-blue-600 text-white cursor-not-allowed opacity-60' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {t('flightDetails.bookCharter')} - {formatCOP(price)} {t('flightDetails.total')}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  {isOperator 
                    ? (user?.role === 'operator' 
                        ? t('flightDetails.operatorCannotBook')
                        : t('flightDetails.adminCannotBook'))
                    : t('flightDetails.finalPriceConfirmed')
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft Images Gallery */}
        {flight.images && flight.images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('flightDetails.aircraftImages')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flight.images.map((image, index) => {
                // Extract the URL from the image object or use the string directly
                const imageUrl = image.url || image;
                
                // If it's already a full URL (starts with http), use it as-is
                // Otherwise, it's a relative path that needs to be constructed
                const fullImageUrl = imageUrl.startsWith('http') 
                  ? imageUrl 
                  : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
                
                return (
                  <div key={index} className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]">
                    <img
                      src={fullImageUrl}
                      alt={`Aircraft ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Only handle error once to prevent infinite loop
                        if (!e.target.dataset.errorHandled) {
                          console.error('Failed to load image:', fullImageUrl);
                          e.target.dataset.errorHandled = 'true';
                          // Hide the broken image by making it invisible
                          e.target.style.display = 'none';
                          // Show a placeholder icon in the parent div
                          const parent = e.target.parentElement;
                          if (parent && !parent.querySelector('.image-error-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'image-error-placeholder absolute inset-0 flex items-center justify-center bg-gray-100';
                            placeholder.innerHTML = `
                              <div class="text-center text-gray-400">
                                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-xs">Image unavailable</p>
                              </div>
                            `;
                            parent.appendChild(placeholder);
                          }
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* View All Images Button if more than 6 images */}
            {flight.images.length > 6 && (
              <div className="text-center mt-6">
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('flightDetails.viewAllImages')} ({flight.images ? flight.images.length : 0})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}




