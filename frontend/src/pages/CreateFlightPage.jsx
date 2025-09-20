import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { searchCities, searchAirports, getCityAirports } from '../data/airportsAndCities';

// Function to get high-quality private jet images based on aircraft type
const getDefaultAircraftImage = (aircraftType) => {
  const imageMap = {
    // Gulfstream aircraft - verified private jet images
    'Gulfstream G650': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Gulfstream G550': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Gulfstream G280': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    
    // Citation aircraft - verified private jet images
    'Citation CJ4': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    'Citation X': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Citation X+': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Citation Sovereign': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    
    // Learjet aircraft - verified private jet images
    'Learjet 75': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Learjet 60': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    
    // Falcon aircraft - verified private jet images
    'Falcon 7X': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Falcon 900': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    
    // Hawker aircraft - verified private jet images
    'Hawker 900XP': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Hawker 4000': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    
    // King Air aircraft - verified private jet images
    'King Air 350': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'King Air 250': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    
    // Challenger aircraft - verified private jet images
    'Challenger 350': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Challenger 650': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    
    // Global aircraft - verified private jet images
    'Global 6000': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Global Express': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    
    // Default fallbacks for aircraft families - all verified private jets
    'Gulfstream': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Citation': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Learjet': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Falcon': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Hawker': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    'King Air': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Challenger': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Global': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center'
  };

  // Try exact match first
  if (imageMap[aircraftType]) {
    return imageMap[aircraftType];
  }

  // Try to match by aircraft family (e.g., "Gulfstream G650" matches "Gulfstream")
  for (const [family, image] of Object.entries(imageMap)) {
    if (aircraftType && aircraftType.toLowerCase().includes(family.toLowerCase())) {
      return image;
    }
  }

  // Default fallback - high-quality private jet image
  return 'https://images.unsplash.com/photo-1583094447810-64e19c025d70?w=400&h=200&fit=crop&crop=center';
};

export default function CreateFlightPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    originCode: '',
    destinationCode: '',
    departureTime: '',
    arrivalTime: '',
    aircraftType: '',
    price: '',
    originalPrice: '',
    seatsAvailable: '',
    duration: '',
    aircraftImage: null,
    description: '',
    // Store selected airport objects
    originAirport: null,
    destinationAirport: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData({...formData, aircraftImage: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    setFormData({...formData, aircraftImage: null});
    setImagePreview(null);
  };

  // Render functions for autocomplete options
  const renderCityOption = (city, isSelected) => {
    if (isSelected) {
      return city.city;
    }
    return (
      <div>
        <div className="font-medium">{city.city}</div>
        <div className="text-sm text-gray-500">
          {city.state ? `${city.state}, ` : ''}{city.country}
        </div>
      </div>
    );
  };

  const renderAirportOption = (airport, isSelected) => {
    if (isSelected) {
      return `${airport.code} - ${airport.name}`;
    }
    return (
      <div>
        <div className="font-medium">{airport.code} - {airport.name}</div>
        <div className="text-sm text-gray-500">
          {airport.city}, {airport.state ? `${airport.state}, ` : ''}{airport.country}
        </div>
      </div>
    );
  };

  // Smart airport search functions - filter by city if city is selected
  const searchOriginAirports = (query, limit = 10) => {
    if (!query || query.length < 1) return [];
    
    // If origin city is selected, only show airports in that city
    if (formData.origin && formData.origin.trim() !== '') {
      const cityAirports = getCityAirports(formData.origin);
      const lowercaseQuery = query.toLowerCase();
      
      return cityAirports
        .filter(airport => 
          airport.code.toLowerCase().includes(lowercaseQuery) ||
          airport.name.toLowerCase().includes(lowercaseQuery)
        )
        .slice(0, limit);
    }
    
    // If no city selected, search all airports
    return searchAirports(query, limit);
  };

  const searchDestinationAirports = (query, limit = 10) => {
    if (!query || query.length < 1) return [];
    
    // If destination city is selected, only show airports in that city
    if (formData.destination && formData.destination.trim() !== '') {
      const cityAirports = getCityAirports(formData.destination);
      const lowercaseQuery = query.toLowerCase();
      
      return cityAirports
        .filter(airport => 
          airport.code.toLowerCase().includes(lowercaseQuery) ||
          airport.name.toLowerCase().includes(lowercaseQuery)
        )
        .slice(0, limit);
    }
    
    // If no city selected, search all airports
    return searchAirports(query, limit);
  };

  // Handlers for autocomplete selections
  const handleOriginCityChange = (value) => {
    if (typeof value === 'object' && value.city) {
      setFormData({
        ...formData, 
        origin: value.city,
        // Clear airport selection if city changes to a different city
        ...(formData.origin !== value.city && {
          originCode: '',
          originAirport: null
        })
      });
    } else {
      setFormData({
        ...formData, 
        origin: value,
        // Clear airport if city is being typed (not from dropdown)
        ...(value !== formData.origin && {
          originCode: '',
          originAirport: null
        })
      });
    }
  };

  const handleDestinationCityChange = (value) => {
    if (typeof value === 'object' && value.city) {
      setFormData({
        ...formData, 
        destination: value.city,
        // Clear airport selection if city changes to a different city
        ...(formData.destination !== value.city && {
          destinationCode: '',
          destinationAirport: null
        })
      });
    } else {
      setFormData({
        ...formData, 
        destination: value,
        // Clear airport if city is being typed (not from dropdown)
        ...(value !== formData.destination && {
          destinationCode: '',
          destinationAirport: null
        })
      });
    }
  };

  const handleOriginAirportChange = (value) => {
    if (typeof value === 'object' && value.code) {
      setFormData({
        ...formData,
        originCode: value.code,
        origin: value.city, // Auto-fill city based on airport
        originAirport: value
      });
    } else {
      setFormData({...formData, originCode: value, originAirport: null});
    }
  };

  const handleDestinationAirportChange = (value) => {
    if (typeof value === 'object' && value.code) {
      setFormData({
        ...formData,
        destinationCode: value.code,
        destination: value.city, // Auto-fill city based on airport
        destinationAirport: value
      });
    } else {
      setFormData({...formData, destinationCode: value, destinationAirport: null});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare flight data
      const flightData = {
        // Required backend fields
        // aircraftId: not needed - backend will create default aircraft
        aircraftType: formData.aircraftType,
        originCode: formData.originCode,
        destinationCode: formData.destinationCode,
        departureDateTime: formData.departureTime,
        originalPrice: parseFloat(formData.originalPrice),
        emptyLegPrice: parseFloat(formData.price),
        totalSeats: parseInt(formData.seatsAvailable),
        
        // Optional fields
        flightNumber: `CF${Date.now()}`, // Generate flight number
        originName: formData.origin,
        originCity: formData.origin,
        originCountry: 'US', // Default for now
        destinationName: formData.destination,
        destinationCity: formData.destination,
        destinationCountry: 'US', // Default for now
        arrivalDateTime: formData.arrivalTime,
        estimatedDuration: formData.duration,
        description: formData.description,
        
        // Additional frontend fields for display
        origin: formData.origin,
        destination: formData.destination,
        price: parseFloat(formData.price),
        seatsAvailable: parseInt(formData.seatsAvailable),
        duration: formData.duration,
        aircraft_image: formData.aircraftImage ? URL.createObjectURL(formData.aircraftImage) : getDefaultAircraftImage(formData.aircraftType),
        images: formData.aircraftImage ? [URL.createObjectURL(formData.aircraftImage)] : []
      };
      
      // Use real API to save to database, fallback to mock API if needed
      if (shouldUseRealAPI()) {
        await flightsAPI.createFlight(flightData);
      } else if (shouldUseMockFlightAPI()) {
        await mockFlightAPI.createFlight(flightData, user.id);
      } else {
        throw new Error('No API available for flight creation');
      }
      
      console.log('Flight created successfully:', flightData);
      
      // Navigate back to dashboard
      navigate('/dashboard', { 
        state: { message: 'Flight created successfully!' } 
      });
    } catch (error) {
      console.error('Error creating flight:', error);
      console.error('Flight data sent:', flightData);
      
      // Show more specific error message
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error creating flight: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Create New Flight</h1>
          <p className="text-gray-600 mt-1">Add a new flight listing to your inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Aircraft Image Upload */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aircraft Image</h2>
            
            <div className="space-y-4">
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                      Drop your aircraft image here
                    </p>
                    <p className="text-gray-600">
                      or{' '}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                        browse files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Aircraft preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                    {formData.aircraftImage?.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flight Route Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Route Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocationAutocomplete
                label="Origin City"
                placeholder="Los Angeles"
                value={formData.origin}
                onChange={handleOriginCityChange}
                searchFunction={searchCities}
                renderOption={renderCityOption}
                required
              />

              <LocationAutocomplete
                label="Origin Airport"
                placeholder={formData.origin ? `Airports in ${formData.origin}` : "LAX - Los Angeles International"}
                value={formData.originAirport ? `${formData.originAirport.code} - ${formData.originAirport.name}` : formData.originCode}
                onChange={handleOriginAirportChange}
                searchFunction={searchOriginAirports}
                renderOption={renderAirportOption}
                required
              />

              <LocationAutocomplete
                label="Destination City"
                placeholder="New York"
                value={formData.destination}
                onChange={handleDestinationCityChange}
                searchFunction={searchCities}
                renderOption={renderCityOption}
                required
              />

              <LocationAutocomplete
                label="Destination Airport"
                placeholder={formData.destination ? `Airports in ${formData.destination}` : "JFK - John F. Kennedy International"}
                value={formData.destinationAirport ? `${formData.destinationAirport.code} - ${formData.destinationAirport.name}` : formData.destinationCode}
                onChange={handleDestinationAirportChange}
                searchFunction={searchDestinationAirports}
                renderOption={renderAirportOption}
                required
              />
            </div>
          </div>

          {/* Flight Schedule */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.departureTime}
                  onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flight Duration *
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5h 30m"
                />
              </div>
            </div>
          </div>

          {/* Aircraft Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Aircraft Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircraft Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.aircraftType}
                  onChange={(e) => setFormData({...formData, aircraftType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Gulfstream G650"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Seats *
                </label>
                <input
                  type="number"
                  required
                  value={formData.seatsAvailable}
                  onChange={(e) => setFormData({...formData, seatsAvailable: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                  min="1"
                  max="50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your aircraft amenities, special features, or any additional information..."
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charter Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8500"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="34000"
                    min="0"
                    step="100"
                  />
                </div>
              </div>
            </div>

            {formData.price && formData.originalPrice && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-green-700">
                  <strong>Savings:</strong> ${(parseFloat(formData.originalPrice) - parseFloat(formData.price)).toLocaleString()} 
                  ({Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}% off)
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating Flight...' : 'Create Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}