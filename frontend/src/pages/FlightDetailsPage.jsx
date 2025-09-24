import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, UsersIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import FreeFlightMap from '../components/FreeFlightMap';

export default function FlightDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPassengers, setSelectedPassengers] = useState(1);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Flight not found</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Add safety checks for calculations
  console.log('🛩️ Flight object:', flight);
  console.log('🖼️ Flight images:', flight.images);
  console.log('🖼️ Aircraft image URL:', flight.aircraft_image_url);
  console.log('⏰ Departure time:', flight.departure_time);
  console.log('⏰ Arrival time:', flight.arrival_time);
  console.log('⏱️ Duration:', flight.duration);
  const price = flight.price || flight.empty_leg_price || 0;
  const originalPrice = flight.original_price || price;
  const savings = originalPrice - price;
  const savingsPercentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;
  console.log('💰 Price calculations:', { price, originalPrice, savings, savingsPercentage });

  const startBookingProcess = () => {
    // Navigate to dedicated payment page with flight data
    navigate(`/payment/${flight.id}`, {
      state: {
        flight: flight,
        passengers: selectedPassengers,
        price: flight.empty_leg_price || flight.original_price || 0
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Flights
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
                    {flight.aircraft_name || 'Private Jet'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    }) : 'TBD'}
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
                  {flight.origin || flight.origin_city || 'Origin'}
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
                  {flight.destination || flight.destination_city || 'Destination'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {flight.seats_available || flight.capacity?.availableSeats || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Available Seats</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {flight.operator || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Operator</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {flight.duration || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Flight Time</div>
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
                <h2 className="text-xl font-bold text-gray-900">Flight Route</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {flight.origin || flight.origin_city || 'TBD'} to {flight.destination || flight.destination_city || 'TBD'} • {flight.duration || 'TBD'}
                </p>
              </div>
              <div className="relative">
                <FreeFlightMap flight={flight} />
              </div>
            </div>
          </div>

          {/* Right Panel - Pricing */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Pricing</h2>
              </div>

              {/* Price Comparison Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Market Price Card - Now on the LEFT */}
                {originalPrice > price ? (
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs text-red-600 font-medium mb-1">MARKET RATE</div>
                    <div className="text-2xl font-bold text-red-400 line-through">${originalPrice.toLocaleString()}</div>
                    <div className="text-xs text-red-600 mt-1">Standard Pricing</div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-xs text-gray-600 font-medium mb-1">GREAT VALUE</div>
                    <div className="text-2xl font-bold text-gray-700">${price.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">Competitive Rate</div>
                  </div>
                )}

                {/* Charter Price Card - Now on the RIGHT */}
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg relative">
                  <div className="text-xs text-blue-600 font-medium mb-1">CHARTER PRICE</div>
                  <div className="text-2xl font-bold text-blue-700">${price.toLocaleString()}</div>
                  <div className="text-xs text-blue-600 mt-1">Empty Leg Deal</div>
                  {originalPrice > price && savingsPercentage > 0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full rotate-12">
                      -{savingsPercentage}%
                    </div>
                  )}
                </div>
              </div>

              {/* Passenger Selection */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">Passengers</h3>
                    <p className="text-sm text-gray-600">{flight.seats_available || 8} seats available</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedPassengers(Math.max(1, selectedPassengers - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg">−</span>
                    </button>
                    <span className="font-semibold text-lg w-8 text-center">{selectedPassengers}</span>
                    <button
                      onClick={() => setSelectedPassengers(Math.min(flight.seats_available || 8, selectedPassengers + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Simple Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-900">Total per person</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${Math.round(price / selectedPassengers).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 text-right">
                  {selectedPassengers} passenger{selectedPassengers !== 1 ? 's' : ''} • ${price.toLocaleString()} total charter
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={startBookingProcess}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Book Charter - ${Math.round(price / selectedPassengers).toLocaleString()} per person
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Final price confirmed before payment
              </p>
            </div>
          </div>
        </div>

        {/* Aircraft Images Gallery */}
        {flight.images && flight.images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Aircraft Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flight.images.map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]">
                  <img
                    src={
                      (image.url || image).startsWith('http') 
                        ? (image.url || image) 
                        : `http://localhost:4000${image.url || image}`
                    }
                    alt={`Aircraft ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Images Button if more than 6 images */}
            {flight.images.length > 6 && (
              <div className="text-center mt-6">
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View All Images ({flight.images ? flight.images.length : 0})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


