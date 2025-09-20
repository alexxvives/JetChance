import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, UsersIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';
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
        if (shouldUseRealAPI()) {
          const foundFlight = await flightsAPI.getFlightById(id);
          setFlight(foundFlight);
        } else if (shouldUseMockFlightAPI()) {
          const response = await mockFlightAPI.getFlights();
          const foundFlight = response.flights.find(f => f.id === parseInt(id) || f.id === id);
          setFlight(foundFlight);
        } else {
          setFlight(null);
        }
      } catch (error) {
        console.error('Error loading flight:', error);
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
  const price = flight.price || flight.empty_leg_price || 0;
  const originalPrice = flight.original_price || price;
  const savings = originalPrice - price;
  const savingsPercentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Flight Details</h1>
          
          {/* Flight Path Visualization */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              {/* Departure */}
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                </div>
                <div className="text-sm text-gray-600 font-medium">{flight.originCode || flight.origin_code || 'TBD'}</div>
                <div className="text-xs text-gray-500">{flight.origin || flight.origin_city || 'TBD'}</div>
              </div>

              {/* Flight Path */}
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="text-blue-600 text-lg">✈️</div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                </div>
                <div className="text-xs text-gray-500 absolute mt-8">{flight.duration || 'TBD'}</div>
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {flight.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                </div>
                <div className="text-sm text-gray-600 font-medium">{flight.destinationCode || flight.destination_code || 'TBD'}</div>
                <div className="text-xs text-gray-500">{flight.destination || flight.destination_city || 'TBD'}</div>
              </div>
            </div>
            
            {/* Date */}
            <div className="text-center mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Date TBD'}
              </div>
            </div>
          </div>
          
          {/* Additional Flight Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Distance</div>
              <div className="font-semibold text-gray-900">~2,400 mi</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Flight Time</div>
              <div className="font-semibold text-gray-900">{flight.duration}</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Aircraft</div>
              <div className="font-semibold text-gray-900">{flight.aircraft_type}</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Operator</div>
              <div className="font-semibold text-gray-900">{flight.operator}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Flight Route */}
          <div className="space-y-6">
            {/* Flight Route */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Flight Route</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {flight.origin} to {flight.destination} • {flight.duration}
                </p>
              </div>
              <div className="relative">
                <FreeFlightMap flight={flight} />
              </div>
            </div>
          </div>

          {/* Right Panel - Pricing */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
              
              {/* Passenger Selection */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">Passengers</h3>
                    <p className="text-sm text-gray-600">Select number of passengers</p>
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
                      onClick={() => setSelectedPassengers(Math.min(flight.seats_available, selectedPassengers + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Available seats: {flight.seats_available}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Charter price (total)</span>
                  <span className="text-gray-900 font-semibold">${price.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per passenger</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${Math.round(price / selectedPassengers).toLocaleString()}
                  </span>
                </div>
                
                {originalPrice > price && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Original charter price</span>
                      <span className="text-gray-400 line-through">${originalPrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">You Save (total)</span>
                      <span className="text-green-600 font-semibold">${savings.toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Charter Price
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                    <span>Split between {selectedPassengers} passenger{selectedPassengers !== 1 ? 's' : ''}</span>
                    <span className="font-semibold">
                      ${Math.round(flight.price / selectedPassengers).toLocaleString()} each
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Book Charter - ${Math.round(flight.price / selectedPassengers).toLocaleString()} per person
              </button>
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
                    src={image.url || image}
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