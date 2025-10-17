import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FreeFlightMap from './FreeFlightMap';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, TrendingDown, Shield, Award } from 'lucide-react';

// Helper function to format Colombian Peso currency
const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `COP ${formatted}`;
};

export default function FlightDetailsLuxury({ flight, onBack, selectedPassengers, setSelectedPassengers }) {
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!flight) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-xl text-gray-600">{t('flightDetails.notFound')}</p>
          <button 
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('flightDetails.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const pricePerSeat = flight.price || flight.seat_leg_price || flight.empty_leg_price || 0;
  const originalPricePerSeat = flight.original_price || flight.seat_market_price || pricePerSeat;
  const maxPassengers = flight.max_passengers || flight.capacity?.maxPassengers || 8;
  const availableSeats = flight.available_seats ?? flight.seats_available ?? flight.capacity?.availableSeats ?? maxPassengers;
  
  const charterPrice = pricePerSeat * maxPassengers;
  const marketPrice = originalPricePerSeat * maxPassengers;
  const price = pricePerSeat * selectedPassengers;
  const hasExistingBookings = availableSeats < maxPassengers;
  const remainingSeatsForPrivacy = Math.max(availableSeats - selectedPassengers, 0);
  const bookedSeats = maxPassengers - availableSeats;
  const showPrivacyWarning = !hasExistingBookings && selectedPassengers < maxPassengers;
  const showSharedFlightWarning = hasExistingBookings;
  const savingsAmount = marketPrice > charterPrice ? marketPrice - charterPrice : 0;
  const savingsPercent = marketPrice > charterPrice ? Math.round(((marketPrice - charterPrice) / marketPrice) * 100) : 0;

  const startBookingProcess = () => {
    if (user?.role === 'operator' || user?.role === 'admin' || user?.role === 'super-admin') {
      return;
    }
    
    navigate(`/payment/${flight.id}`, {
      state: {
        flight: flight,
        passengers: selectedPassengers,
        price: price
      }
    });
  };

  const isOperator = user?.role === 'operator' || user?.role === 'admin' || user?.role === 'super-admin';

  // Parse images field (it's a JSON string in the database or already an array)
  let images = [];
  if (flight.images) {
    try {
      // If it's already an array, use it directly
      if (Array.isArray(flight.images)) {
        images = flight.images;
      } else if (typeof flight.images === 'string') {
        images = flight.images ? JSON.parse(flight.images) : [];
      }
      console.log('📸 FlightDetailsLuxury - Images:', images);
    } catch (e) {
      console.error('❌ Error parsing flight images:', e, flight.images);
      images = [];
    }
  }
  const hasImages = images.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Elegant Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-gray-400 hover:text-gray-900 mb-8 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-gray-900 flex items-center justify-center mr-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="text-sm font-medium">Back to Flights</span>
      </button>

      {/* Premium Header with Blue Accents */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl overflow-hidden mb-8 shadow-2xl">
        {/* Animated Blue Shimmer Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
        </div>
        
        {/* Blue Border Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>

        <div className="relative p-10">
          {/* Premium Badge */}
          <div className="flex items-center justify-between mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              EMPTY LEG EXCLUSIVE
            </div>
            {savingsPercent > 0 && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-2 rounded-full font-bold text-sm">
                <TrendingDown className="w-4 h-4 inline mr-2" />
                Save {savingsPercent}% • {formatCOP(savingsAmount)}
              </div>
            )}
          </div>

          {/* Aircraft Name */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              {flight.aircraft_model || flight.aircraft_name || 'Private Jet Charter'}
            </h1>
            <p className="text-blue-300 text-lg font-medium">
              {flight.operator || user?.companyName || user?.company_name || 'Premium Operator'}
            </p>
          </div>

          {/* Luxury Route Display */}
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Origin */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-xl">
                <span className="text-3xl font-black text-white">
                  {flight.originCode || flight.origin_code || 'N/A'}
                </span>
              </div>
              <div className="text-white/90 font-medium text-lg">
                {flight.origin_city || flight.origin_name || 'Origin'}
              </div>
              <div className="text-white/50 text-sm mt-1">
                {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', { 
                  month: 'short', 
                  day: 'numeric'
                }) : 'TBD'}
              </div>
            </div>

            {/* Flight Path */}
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                <div className="mx-4">
                  <svg className="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 via-blue-400 to-transparent"></div>
              </div>
              <div className="text-center mt-3">
                <span className="text-white/70 text-sm">{flight.flight_time || 'Flight time TBD'}</span>
              </div>
            </div>

            {/* Destination */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-xl">
                <span className="text-3xl font-black text-white">
                  {flight.destinationCode || flight.destination_code || 'N/A'}
                </span>
              </div>
              <div className="text-white/90 font-medium text-lg">
                {flight.destination_city || flight.destination_name || 'Destination'}
              </div>
              <div className="text-white/50 text-sm mt-1">
                Arrival
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Shield className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-white/90 font-medium text-sm">Fully Insured</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Award className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-white/90 font-medium text-sm">Premium Service</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Sparkles className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-white/90 font-medium text-sm">Luxury Interior</div>
            </div>
          </div>
        </div>

        {/* Blue Border Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left - Gallery & Map */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image Gallery */}
          {hasImages && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-100">
                <img
                  src={images[activeImageIndex].startsWith('http') ? images[activeImageIndex] : `${import.meta.env.VITE_API_URL}${images[activeImageIndex]}`}
                  alt={`Aircraft view ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/aircraft/default-aircraft.jpg';
                  }}
                />
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-50">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === activeImageIndex ? 'border-blue-500 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL}${image}`}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/aircraft/default-aircraft.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Flight Route</h2>
            </div>
            <div className="h-96">
              <FreeFlightMap flight={flight} onCoordinateStatus={() => {}} />
            </div>
          </div>

          {/* Aircraft Specs */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Aircraft Specifications</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-1">Total Capacity</div>
                <div className="text-2xl font-bold text-blue-900">{maxPassengers} Passengers</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-sm text-green-700 font-medium mb-1">Available Seats</div>
                <div className="text-2xl font-bold text-green-900">{availableSeats} Seats</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Booking Card (Sticky) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden sticky top-6">
            {/* Blue Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white">Reserve Your Seat</h2>
              <p className="text-blue-100 text-sm mt-1">Exclusive empty leg pricing</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Pricing Display */}
              <div className="space-y-4">
                {marketPrice > charterPrice && (
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-500 text-sm">Standard Charter</span>
                    <span className="text-lg text-gray-400 line-through">{formatCOP(marketPrice)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Empty Leg Price</div>
                    <div className="text-xs text-gray-400">{formatCOP(pricePerSeat)} per seat</div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {formatCOP(charterPrice)}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              {/* Passenger Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Select Passengers
                </label>
                <div className="flex items-center justify-between bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200">
                  <button
                    onClick={() => setSelectedPassengers(Math.max(availableSeats > 0 ? 1 : 0, selectedPassengers - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-blue-200 hover:border-blue-400"
                    disabled={selectedPassengers <= 1}
                  >
                    <span className="text-xl font-bold text-blue-700">−</span>
                  </button>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-900">{selectedPassengers}</div>
                    <div className="text-xs text-blue-700 mt-1">
                      {selectedPassengers === 1 ? 'passenger' : 'passengers'}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPassengers(Math.min(availableSeats, selectedPassengers + 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-blue-200 hover:border-blue-400"
                    disabled={selectedPassengers >= availableSeats}
                  >
                    <span className="text-xl font-bold text-blue-700">+</span>
                  </button>
                </div>
              </div>

              {/* Warnings */}
              {showPrivacyWarning && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-lg">ℹ️</span>
                    <span>{t('flightDetails.privateFlightWarning')?.replace('{remainingSeats}', remainingSeatsForPrivacy) || `${remainingSeatsForPrivacy} seats will remain empty for your privacy`}</span>
                  </p>
                </div>
              )}

              {showSharedFlightWarning && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-lg">👥</span>
                    <span>{t('flightDetails.sharedFlightWarning')?.replace('{bookedSeats}', bookedSeats) || `This flight already has ${bookedSeats} booked seats`}</span>
                  </p>
                </div>
              )}

              {/* Total Price */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">Your Total</span>
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{formatCOP(price)}</div>
                <div className="text-blue-300 text-sm">for {selectedPassengers} passenger{selectedPassengers !== 1 ? 's' : ''}</div>
              </div>

              {/* Book Button */}
              {isOperator ? (
                <>
                  <button 
                    disabled={true}
                    className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gray-200 text-gray-400 cursor-not-allowed"
                  >
                    Book Now
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    {t('flightDetails.operatorCannotBook') || 'Operators cannot book their own flights'}
                  </p>
                </>
              ) : (
                <button 
                  onClick={startBookingProcess}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white hover:shadow-xl transition-all hover:scale-105"
                >
                  Book This Flight →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
