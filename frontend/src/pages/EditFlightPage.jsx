import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
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
    'Hawker': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'King Air': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Challenger': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Global': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
  };

  if (imageMap[aircraftType]) {
    return imageMap[aircraftType];
  }

  // Try to match partial aircraft names
  for (const [key, value] of Object.entries(imageMap)) {
    if (aircraftType.includes(key) || key.includes(aircraftType)) {
      return value;
    }
  }

  // Default fallback
  return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center';
};

export default function EditFlightPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    origin: '',
    originCode: '',
    originAirport: null,
    destination: '',
    destinationCode: '',
    destinationAirport: null,
    departureTime: '',
    arrivalTime: '',
    aircraftType: '',
    seatsAvailable: '',
    description: '',
    price: '',
    originalPrice: '',
    aircraftImage: null
  });

  // Load flight data on component mount
  useEffect(() => {
    fetchFlightDetails();
  }, [id]);

  // Function to convert API date format to datetime-local format
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      
      // Format as YYYY-MM-DDTHH:MM for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const fetchFlightDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 Fetching flight details for ID:', id);
      
      let flightData;

      if (shouldUseRealAPI()) {
        console.log('📡 Using real API');
        flightData = await flightsAPI.getFlightById(id);
       } else {
        throw new Error('No API configuration available');
      }

      console.log('✅ Flight data received:', flightData);

      if (flightData) {
        // Map API response to form fields
        setFormData({
          origin: flightData.origin || '',
          originCode: flightData.origin_code || '',
          originAirport: flightData.origin_code ? { 
            code: flightData.origin_code, 
            name: flightData.origin || ''
          } : null,
          destination: flightData.destination || '',
          destinationCode: flightData.destination_code || '',
          destinationAirport: flightData.destination_code ? { 
            code: flightData.destination_code, 
            name: flightData.destination || ''
          } : null,
          departureTime: formatDateTimeForInput(flightData.departure_time),
          arrivalTime: formatDateTimeForInput(flightData.arrival_time),
          aircraftType: flightData.aircraft_name || '',
          seatsAvailable: flightData.seats_available?.toString() || '',
          description: flightData.description || '',
          price: flightData.empty_leg_price?.toString() || flightData.price?.toString() || '',
          originalPrice: flightData.original_price?.toString() || '',
          aircraftImage: null
        });

        // Set image preview if available
        if (flightData.aircraft_image_url) {
          setImagePreview(flightData.aircraft_image_url);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching flight details:', error);
      setError('Failed to load flight details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Image handling functions (same as CreateFlightPage)
  const handleImageUpload = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData({...formData, aircraftImage: file});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
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
    setImagePreview('');
    setFormData({...formData, aircraftImage: null});
  };

  // Location handling functions (same as CreateFlightPage)
  const handleOriginCityChange = (value) => {
    setFormData({
      ...formData,
      origin: value,
      originCode: '',
      originAirport: null
    });
  };

  const handleOriginAirportChange = (value) => {
    const airport = value.code ? value : null;
    setFormData({
      ...formData,
      originAirport: airport,
      originCode: airport ? airport.code : value,
      // Auto-fill city when airport is selected
      origin: airport ? airport.city : formData.origin
    });
  };

  const handleDestinationCityChange = (value) => {
    setFormData({
      ...formData,
      destination: value,
      destinationCode: '',
      destinationAirport: null
    });
  };

  const handleDestinationAirportChange = (value) => {
    const airport = value.code ? value : null;
    setFormData({
      ...formData,
      destinationAirport: airport,
      destinationCode: airport ? airport.code : value,
      // Auto-fill city when airport is selected
      destination: airport ? airport.city : formData.destination
    });
  };

  const searchOriginAirports = (query) => {
    if (formData.origin) {
      return getCityAirports(formData.origin);
    }
    return searchAirports(query);
  };

  const searchDestinationAirports = (query) => {
    if (formData.destination) {
      return getCityAirports(formData.destination);
    }
    return searchAirports(query);
  };

  const renderCityOption = (city) => (
    <div className="py-2">
      <div className="font-medium text-gray-900">
        {city.city}
        {city.state && `, ${city.state}`}
      </div>
      <div className="text-sm text-gray-500">{city.country}</div>
    </div>
  );

  const renderAirportOption = (airport) => (
    <div className="py-2">
      <div className="font-medium text-gray-900">{airport.code} - {airport.name}</div>
      <div className="text-sm text-gray-500">{airport.city}, {airport.country}</div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted!');
    console.log('📝 Form data:', formData);
    
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare the update data
      const updateData = {
        emptyLegPrice: parseFloat(formData.price),
        availableSeats: parseInt(formData.seatsAvailable),
        description: formData.description,
        originalPrice: parseFloat(formData.originalPrice),
        aircraftName: formData.aircraftType,
        origin: formData.origin,
        destination: formData.destination,
        originCode: formData.originCode,
        destinationCode: formData.destinationCode,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime
      };

      console.log('🔄 Updating flight with data:', updateData);
      console.log('🌐 Using real API:', shouldUseRealAPI());

      let result;
      if (shouldUseRealAPI()) {
        result = await flightsAPI.updateFlight(id, updateData);
       } else {
        throw new Error('No API configuration available');
      }

      console.log('✅ Flight updated successfully:', result);
      
      // Navigate back to dashboard with success message
      navigate('/dashboard', { 
        state: { message: 'Flight updated successfully!' } 
      });
    } catch (error) {
      console.error('❌ Error updating flight:', error);
      setError(error.message || 'Failed to update flight. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.origin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Flight</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-3">
              <button
                onClick={fetchFlightDetails}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Flight</h1>
          <p className="text-gray-600 mt-1">Update your flight listing details</p>
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
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                          onChange={(e) => handleImageUpload(e.target.files[0])}
                          className="sr-only"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG, WebP, GIF, SVG up to 5MB</p>
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
                    {formData.aircraftImage?.name || 'Current Image'}
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
                placeholder="Bogotá"
                value={formData.origin}
                onChange={handleOriginCityChange}
                searchFunction={searchCities}
                renderOption={renderCityOption}
                required
              />

              <LocationAutocomplete
                label="Origin Airport"
                placeholder={formData.origin ? `Airports in ${formData.origin}` : "BOG - El Dorado International Airport"}
                value={formData.originAirport ? `${formData.originAirport.code} - ${formData.originAirport.name}` : formData.originCode}
                onChange={handleOriginAirportChange}
                searchFunction={searchOriginAirports}
                renderOption={renderAirportOption}
                required
              />

              <LocationAutocomplete
                label="Destination City"
                placeholder="Mexico City"
                value={formData.destination}
                onChange={handleDestinationCityChange}
                searchFunction={searchCities}
                renderOption={renderCityOption}
                required
              />

              <LocationAutocomplete
                label="Destination Airport"
                placeholder={formData.destination ? `Airports in ${formData.destination}` : "MEX - Mexico City International Airport"}
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
                  {formData.departureTime && formData.arrivalTime && (() => {
                    const departure = new Date(formData.departureTime);
                    const arrival = new Date(formData.arrivalTime);
                    const departureDate = departure.toDateString();
                    const arrivalDate = arrival.toDateString();
                    
                    if (departureDate !== arrivalDate) {
                      const timeDiff = arrival.getTime() - departure.getTime();
                      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                      
                      if (daysDiff === 1) {
                        return <sup className="text-xs text-red-500 font-bold">+1</sup>;
                      } else if (daysDiff > 1) {
                        return <sup className="text-xs text-red-500 font-bold">+{daysDiff}</sup>;
                      }
                    }
                    return null;
                  })()}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Duration will be calculated automatically from departure and arrival times */}
              {formData.departureTime && formData.arrivalTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculated Duration
                  </label>
                  <div className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${
                    (() => {
                      const departure = new Date(formData.departureTime);
                      const arrival = new Date(formData.arrivalTime);
                      const durationMs = arrival - departure;
                      
                      if (durationMs <= 0) {
                        return "bg-red-100 text-red-700";
                      } else {
                        return "bg-gray-100 text-gray-700";
                      }
                    })()
                  }`}>
                    {(() => {
                      const departure = new Date(formData.departureTime);
                      const arrival = new Date(formData.arrivalTime);
                      const durationMs = arrival - departure;
                      const durationMinutes = Math.round(durationMs / (1000 * 60));
                      const hours = Math.floor(durationMinutes / 60);
                      const minutes = durationMinutes % 60;
                      
                      if (durationMs <= 0) {
                        return "Invalid: Arrival must be after departure";
                      } else if (hours >= 24) {
                        const days = Math.floor(hours / 24);
                        const remainingHours = hours % 24;
                        return days > 0 
                          ? (remainingHours > 0 
                              ? `${days}d ${remainingHours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim()
                              : `${days}d ${minutes > 0 ? `${minutes}m` : ''}`.trim())
                          : (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`);
                      } else if (hours > 0) {
                        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                      } else {
                        return `${minutes}m`;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
            
            {/* Warning at bottom of Schedule card */}
            {formData.departureTime && formData.arrivalTime && (() => {
              const departure = new Date(formData.departureTime);
              const arrival = new Date(formData.arrivalTime);
              const durationMs = arrival - departure;
              const durationMinutes = Math.round(durationMs / (1000 * 60));
              const hours = Math.floor(durationMinutes / 60);
              
              if (durationMs > 0 && hours >= 24) {
                return (
                  <p className="text-xs text-gray-500 mt-4 flex items-center">
                    <span className="mr-1">⚠</span>
                    Unusually long flight duration. Please verify your dates.
                  </p>
                );
              }
              return null;
            })()}
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

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
              {isSubmitting ? 'Updating Flight...' : 'Update Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


