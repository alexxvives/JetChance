import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FreeFlightMap from './FreeFlightMap';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, Plane, MapPin, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom Flight Icon SVG (same as the one used in flight cards)
const FlightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

// Helper function to format Colombian Peso currency
const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `$${formatted}`;
};

export default function FlightDetailsOption1({ flight, onBack, selectedPassengers: propSelectedPassengers, setSelectedPassengers: propSetSelectedPassengers }) {
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use internal state if props are not provided
  const [internalSelectedPassengers, setInternalSelectedPassengers] = useState(1);
  const selectedPassengers = propSelectedPassengers !== undefined ? propSelectedPassengers : internalSelectedPassengers;
  const setSelectedPassengers = propSetSelectedPassengers || setInternalSelectedPassengers;
  
  // Update selectedPassengers when flight changes (only if using internal state)
  useEffect(() => {
    if (flight && propSelectedPassengers === undefined) {
      const maxPass = flight.max_passengers || flight.capacity?.maxPassengers || 8;
      const availSeats = flight.available_seats ?? flight.seats_available ?? flight.capacity?.availableSeats ?? maxPass;
      setInternalSelectedPassengers(Math.min(availSeats, maxPass) || 1);
    }
  }, [flight, propSelectedPassengers]);

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
  const hasExistingBookings = availableSeats < maxPassengers; // If available seats < max, there are existing bookings
  
  const totalPrice = pricePerSeat * selectedPassengers;
  const savingsPercent = originalPricePerSeat > pricePerSeat ? Math.round(((originalPricePerSeat - pricePerSeat) / originalPricePerSeat) * 100) : 0;

  const startBookingProcess = () => {
    if (user?.role === 'operator' || user?.role === 'admin' || user?.role === 'super-admin') {
      return;
    }
    
    navigate(`/payment/${flight.id}`, {
      state: {
        flight: flight,
        passengers: selectedPassengers,
        price: totalPrice
      }
    });
  };

  const isOperator = user?.role === 'operator' || user?.role === 'admin' || user?.role === 'super-admin';

  // Debug logging
  console.log('Edit button visibility check:', {
    isOperator,
    hasExistingBookings,
    availableSeats,
    maxPassengers,
    userRole: user?.role,
    showButton: isOperator && !hasExistingBookings
  });

  // Prepare images array - main image + additional images
  const mainImage = flight.aircraft_image || flight.aircraft_image_url || flight.aircraft?.image || '/images/aircraft/default-aircraft.jpg';
  
  // Parse images field (it's a JSON string in the database)
  let parsedImages = [];
  if (flight.images) {
    try {
      parsedImages = typeof flight.images === 'string' ? JSON.parse(flight.images) : flight.images;
    } catch (e) {
      console.error('Error parsing flight images:', e);
      parsedImages = [];
    }
  }
  
  // Only use additional images for gallery, not the main image
  const additionalImages = parsedImages.filter(img => img && img !== mainImage);
  const allImages = [mainImage, ...additionalImages].filter(img => img); // All images for lightbox

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Flights
        </button>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
        <img
          src={flight.aircraft_image || flight.aircraft_image_url || flight.aircraft?.image || '/images/aircraft/default-aircraft.jpg'}
          alt={flight.aircraft_model || 'Aircraft'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/aircraft/default-aircraft.jpg';
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Savings Badge */}
        {savingsPercent > 0 && (
          <div className="absolute top-6 left-6 bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
            Save {savingsPercent}% on this flight
          </div>
        )}
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">{flight.aircraft_model || flight.aircraft_name || 'Private Jet'}</h1>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'TBD'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '12:15 PM'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{availableSeats} seats available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Thumbnails - only show if there are additional images beyond the main one */}
      {additionalImages.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {additionalImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index + 1)} // +1 because main image is at index 0 in allImages
                className="relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer group"
              >
                <img
                  src={image}
                  alt={`Aircraft view ${index + 2}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/images/aircraft/default-aircraft.jpg';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flight Route Card - Horizontal Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Flight Route</h2>
        
        <div className="flex items-center justify-between gap-8">
          {/* Departure - Left */}
          <div className="flex items-start gap-3" style={{ maxWidth: '336px' }}>
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-600 rotate-45" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500">Departure</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {flight.origin_city || flight.origin_name?.split(' ')[0] || 'Acapulco'}, {flight.origin_country || 'Mexico'}
              </h3>
              <p className="text-sm text-gray-600 break-words">
                {(flight.origin_name || 'Acapulco International Airport').replace(/\s*\([^)]*\)\s*$/, '')} ({flight.originCode || flight.origin_code || 'ACA'})
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'TBD'}
              </p>
            </div>
          </div>

          {/* Flight Duration - Center with long dashed line and plane */}
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            {/* Duration badge */}
            <div className="flex items-center gap-2 text-blue-600 bg-white px-4 py-2 rounded-full whitespace-nowrap shadow-sm border border-blue-200 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{flight.flight_time || '336h 15m'} flight time</span>
            </div>
            {/* Long horizontal dashed line with plane icon positioned closer to departure */}
            <div className="relative w-full flex items-center">
              <div className="border-t-2 border-dashed border-gray-300" style={{ width: '10%' }}></div>
              <div className="mx-2">
                <FlightIcon className="w-10 h-10 text-blue-600 transform rotate-90" />
              </div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
            </div>
          </div>

          {/* Arrival - Right */}
          <div className="flex items-start gap-3" style={{ maxWidth: '336px' }}>
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500">Arrival</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {flight.destination_city || flight.destination_name?.split(' ')[0] || 'Aguascalientes'}, {flight.destination_country || 'Mexico'}
              </h3>
              <p className="text-sm text-gray-600 break-words">
                {(flight.destination_name || 'Aguascalientes International Airport').replace(/\s*\([^)]*\)\s*$/, '')} ({flight.destinationCode || flight.destination_code || 'AGU'})
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {flight.arrival_time ? new Date(flight.arrival_time).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : flight.departure_time ? new Date(new Date(flight.departure_time).getTime() + 336 * 60 * 60 * 1000).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'TBD'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
        {/* Left Column - Flight Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">

          {/* What's Included */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What's Included</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Spacious cabin with luxury seating</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">In-flight entertainment system</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Gourmet catering available</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">High-speed WiFi</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Private cabin attendant</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Complimentary beverages</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Secure Booking</h3>
              <p className="text-xs text-gray-600">SSL encrypted</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">Certified Operators</h3>
              <p className="text-xs text-gray-600">Fully licensed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">24/7 Support</h3>
              <p className="text-xs text-gray-600">Always available</p>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1">
            <FreeFlightMap flight={flight} onCoordinateStatus={() => {}} />
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Price per seat</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{formatCOP(pricePerSeat)}</span>
                <span className="text-lg text-gray-500">COP</span>
              </div>
              {savingsPercent > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  <span>💰 Save {savingsPercent}%</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Number of seats
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-2">
                <button
                  onClick={() => setSelectedPassengers(Math.max(1, selectedPassengers - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-300 hover:border-blue-500 transition-colors"
                  disabled={selectedPassengers <= 1}
                >
                  <span className="text-lg font-semibold text-gray-700">−</span>
                </button>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{selectedPassengers}</div>
                  <div className="text-xs text-gray-500">of {availableSeats} available</div>
                </div>
                <button
                  onClick={() => setSelectedPassengers(Math.min(availableSeats, selectedPassengers + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-300 hover:border-blue-500 transition-colors"
                  disabled={selectedPassengers >= availableSeats}
                >
                  <span className="text-lg font-semibold text-gray-700">+</span>
                </button>
              </div>
              
              {/* Info message when there are existing bookings */}
              {hasExistingBookings && (
                <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">Shared Flight:</span> This jet already has bookings. You'll likely be sharing the flight with other passengers.
                  </p>
                </div>
              )}
              
              {/* Warning when not booking all seats */}
              {selectedPassengers < availableSeats && !hasExistingBookings && (
                <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">Note:</span> You may share the jet with other passengers if you don't book all {availableSeats} seats.
                  </p>
                </div>
              )}
              
              {/* Positive message when booking all seats */}
              {selectedPassengers === availableSeats && !hasExistingBookings && (
                <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-green-800">
                    <span className="font-semibold">Fully Private:</span> By booking all {availableSeats} seats this jet will be exclusively yours!
                  </p>
                </div>
              )}
            </div>

            {/* Flight Information Summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Flight Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </span>
                  <span className="font-medium text-gray-900">
                    {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'TBD'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration
                  </span>
                  <span className="font-medium text-gray-900">{flight.flight_time || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Aircraft
                  </span>
                  <span className="font-medium text-gray-900">{flight.aircraft_model || flight.aircraft_name || 'Private Jet'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCOP(totalPrice)} COP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Service fee</span>
                <span className="font-semibold text-gray-900">Included</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatCOP(totalPrice)} COP</span>
              </div>
            </div>

            {isOperator ? (
              <>
                <button 
                  disabled={true}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gray-300 cursor-not-allowed"
                >
                  Book Now
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  {user?.role === 'operator' ? 'Operators cannot book their own flights' : 'Admins cannot book flights'}
                </p>
              </>
            ) : (
              <>
                <button 
                  onClick={startBookingProcess}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Book Now
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Free cancellation up to 24 hours before departure
                </p>
              </>
            )}
            
            {/* Extra padding to align with map bottom */}
            <div className="pb-2"></div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation buttons */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div 
            className="max-w-7xl max-h-[90vh] flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[currentImageIndex]}
              alt={`Aircraft view ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = '/images/aircraft/default-aircraft.jpg';
              }}
            />
          </div>

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
