import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon, CameraIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import LocationAutocomplete from '../components/LocationAutocomplete';
import CustomCalendar from '../components/CustomCalendar';
import CustomTimePicker from '../components/CustomTimePicker';
import AirportService from '../services/AirportService';

// Compatibility wrapper functions for legacy hardcoded airport functions
let airportsCache = null;

const getAirportsSync = () => {
  if (!airportsCache) {
    // Try to get from cache or use fallback
    const cached = AirportService.cache.get('approved_airports');
    if (cached && Date.now() - cached.timestamp < AirportService.cacheTimeout) {
      airportsCache = cached.data;
    } else {
      // Use fallback airports if no cache
      airportsCache = AirportService.getFallbackAirports();
    }
  }
  return airportsCache;
};

const searchAirports = (query, limit = 10) => {
  const airports = getAirportsSync();
  if (!query || query.length < 1) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return airports
    .filter(airport => 
      airport.code.toLowerCase().includes(lowercaseQuery) ||
      airport.name.toLowerCase().includes(lowercaseQuery) ||
      airport.city.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, limit);
};

const searchCities = (query, limit = 10) => {
  const airports = getAirportsSync();
  const cities = [...new Set(airports.map(a => a.city))].sort();
  
  if (!query || query.length < 1) return cities.slice(0, limit);
  
  const lowercaseQuery = query.toLowerCase();
  return cities
    .filter(city => city.toLowerCase().includes(lowercaseQuery))
    .slice(0, limit);
};

const getCityAirports = (cityName) => {
  const airports = getAirportsSync();
  return airports.filter(airport => airport.city === cityName);
};

// Initialize cache on component load
AirportService.getApprovedAirports().then(airports => {
  airportsCache = airports;
}).catch(error => {
  console.warn('Failed to load airports from database, using fallback');
  airportsCache = AirportService.getFallbackAirports();
});

// Function to get high-quality private jet images based on aircraft type
const getDefaultAircraftImage = (aircraftType) => {
  const imageMap = {
    // Gulfstream aircraft
    'Gulfstream G650': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Gulfstream G550': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Gulfstream G280': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    
    // Default fallbacks
    'Gulfstream': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Citation': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Learjet': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
  };

  if (imageMap[aircraftType]) {
    return imageMap[aircraftType];
  }

  for (const [family, image] of Object.entries(imageMap)) {
    if (aircraftType && aircraftType.toLowerCase().includes(family.toLowerCase())) {
      return image;
    }
  }

  return 'https://images.unsplash.com/photo-1583094447810-64e19c025d70?w=400&h=200&fit=crop&crop=center';
};

export default function EditFlightPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Helper function to render flight duration warning
  const renderDurationWarning = () => {
    if (!formData.departureTime || !formData.arrivalTime) return null;
    
    const departure = new Date(formData.departureTime);
    const arrival = new Date(formData.arrivalTime);
    const durationMs = arrival - departure;
    
    // Check if arrival is before or equal to departure
    if (durationMs <= 0) {
      const errorMessage = durationMs === 0 
        ? "Arrival time cannot be the same as departure time. Please ensure there is at least some flight duration."
        : "Arrival time cannot be before departure time. Please check your flight schedule.";
      
      return (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Invalid Flight Times</p>
              <p className="text-red-700 text-sm">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    const hours = Math.floor(durationMinutes / 60);
    
    if (durationMs > 0 && hours >= 24) {
      return (
        <p className="text-xs text-gray-500 mt-4 flex items-center justify-center">
          <span className="mr-1">⚠</span>
          {t('createFlight.sections.flightSchedule.warning').replace('{hours}', hours)}
        </p>
      );
    }
    return null;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

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
    aircraftImages: [],
    description: '',
    originAirport: null,
    destinationAirport: null
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);

  // Load existing flight data
  useEffect(() => {
    const loadFlight = async () => {
      try {
        setIsLoading(true);
        if (shouldUseRealAPI()) {
          const flight = await flightsAPI.getFlightById(id);
          console.log('Loaded flight for editing:', flight);
          
          // Populate form with existing flight data
          setFormData({
            origin: flight.origin_city || flight.origin || '',
            destination: flight.destination_city || flight.destination || '',
            originCode: flight.origin_code || flight.originCode || '',
            destinationCode: flight.destination_code || flight.destinationCode || '',
            departureTime: flight.departure_time || '',
            arrivalTime: flight.arrival_time || '',
            aircraftType: flight.aircraft_model || flight.aircraft_name || flight.aircraft_type || '',
            price: flight.empty_leg_price || flight.price || '',
            originalPrice: flight.original_price || '',
            seatsAvailable: flight.seats_available || '',
            description: flight.description || '',
            aircraftImages: [],
            originAirport: null,
            destinationAirport: null
          });

          // Handle existing images
          if (flight.images && flight.images.length > 0) {
            const existingPreviews = flight.images.map((image, index) => ({
              preview: image.url || image,
              name: `existing-image-${index}`,
              isExisting: true
            }));
            setImagePreviews(existingPreviews);
          }
        }
      } catch (error) {
        console.error('Error loading flight:', error);
        setError('Failed to load flight data');
      } finally {
        setIsLoading(false);
      }
    };

    loadFlight();
  }, [id]);

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      const newImages = [...formData.aircraftImages, ...validFiles];
      setFormData({...formData, aircraftImages: newImages});
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, {
            file: file,
            preview: e.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const removeImage = (index) => {
    const newImages = formData.aircraftImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({...formData, aircraftImages: newImages});
    setImagePreviews(newPreviews);
  };

  const renderCityOption = (city, isSelected) => {
    if (isSelected) return city.city;
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
    if (isSelected) return `${airport.code} - ${airport.name}`;
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
    // If origin city is selected, show airports in that city
    if (formData.origin && formData.origin.trim() !== '') {
      const cityAirports = getCityAirports(formData.origin);
      
      // If no query (empty string), return all airports in the city
      if (!query || query.length === 0) {
        return cityAirports.slice(0, limit);
      }
      
      // If query exists, filter the city airports
      const lowercaseQuery = query.toLowerCase();
      return cityAirports
        .filter(airport => 
          airport.code.toLowerCase().includes(lowercaseQuery) ||
          airport.name.toLowerCase().includes(lowercaseQuery)
        )
        .slice(0, limit);
    }
    
    // If no city selected, search all airports only if query exists
    if (!query || query.length < 1) return [];
    return searchAirports(query, limit);
  };

  const searchDestinationAirports = (query, limit = 10) => {
    // If destination city is selected, show airports in that city
    if (formData.destination && formData.destination.trim() !== '') {
      const cityAirports = getCityAirports(formData.destination);
      
      // If no query (empty string), return all airports in the city
      if (!query || query.length === 0) {
        return cityAirports.slice(0, limit);
      }
      
      // If query exists, filter the city airports
      const lowercaseQuery = query.toLowerCase();
      return cityAirports
        .filter(airport => 
          airport.code.toLowerCase().includes(lowercaseQuery) ||
          airport.name.toLowerCase().includes(lowercaseQuery)
        )
        .slice(0, limit);
    }
    
    // If no city selected, search all airports only if query exists
    if (!query || query.length < 1) return [];
    return searchAirports(query, limit);
  };

  // Handlers for autocomplete selections
  const handleOriginCityChange = (value) => {
    if (typeof value === 'object' && value.city) {
      const cityAirports = getCityAirports(value.city);
      const newFormData = {
        ...formData, 
        origin: value.city,
        // Clear airport selection if city changes to a different city
        ...(formData.origin !== value.city && {
          originCode: '',
          originAirport: null
        })
      };

      // Auto-fill airport if city has only one airport
      if (cityAirports.length === 1) {
        newFormData.originCode = cityAirports[0].code;
        newFormData.originAirport = cityAirports[0];
      }

      setFormData(newFormData);
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
      const cityAirports = getCityAirports(value.city);
      const newFormData = {
        ...formData, 
        destination: value.city,
        // Clear airport selection if city changes to a different city
        ...(formData.destination !== value.city && {
          destinationCode: '',
          destinationAirport: null
        })
      };

      // Auto-fill airport if city has only one airport
      if (cityAirports.length === 1) {
        newFormData.destinationCode = cityAirports[0].code;
        newFormData.destinationAirport = cityAirports[0];
      }

      setFormData(newFormData);
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

  // Validation function to check if dates/times are valid
  const isFormValid = () => {
    if (!formData.departureTime || !formData.arrivalTime) return true; // Let normal required field validation handle this
    
    const departure = new Date(formData.departureTime);
    const arrival = new Date(formData.arrivalTime);
    
    return arrival > departure; // Arrival must be after departure (not equal)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate that arrival time is after departure time
    if (!isFormValid()) {
      alert('Error: Arrival time cannot be before or equal to departure time. Please ensure there is at least some flight duration.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!shouldUseRealAPI()) {
        setError('API not configured');
        return;
      }

      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'aircraftImages' && value) {
          submitData.append(key, value);
        }
      });

      // Add images
      formData.aircraftImages.forEach(image => {
        submitData.append('aircraftImages', image);
      });

      await flightsAPI.updateFlight(id, submitData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating flight:', error);
      setError(error.message || 'Failed to update flight');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flight data...</p>
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
            {t('editFlight.backToDashboard')}
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">{t('editFlight.title')}</h1>
          <p className="text-gray-600 mt-1">{t('editFlight.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Aircraft Images Upload */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CameraIcon className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('createFlight.sections.aircraftImages.title')}</h2>
            </div>
            
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {t('createFlight.sections.aircraftImages.uploadArea.title')}
                  </p>
                  <p className="text-gray-600">
                    {t('createFlight.sections.aircraftImages.uploadArea.subtitle')}{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                      {t('createFlight.sections.aircraftImages.uploadArea.browse')}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="sr-only"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">{t('createFlight.sections.aircraftImages.uploadArea.formats')}</p>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Flight Route Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <PaperAirplaneIcon className="w-5 h-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('createFlight.sections.routeInformation.title')}</h2>
            </div>
            
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
                showAllOnFocus={formData.origin && formData.origin.trim() !== ''}
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
                showAllOnFocus={formData.destination && formData.destination.trim() !== ''}
                required
              />
            </div>
          </div>

          {/* Flight Schedule */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('createFlight.sections.flightSchedule.title')}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Departure Section */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{t('createFlight.sections.flightSchedule.departure')}</h3>
                </div>
                
                {/* Departure Date & Time */}
                <div className="flex space-x-4">
                  {/* Departure Date - 75% width */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <CustomCalendar
                      value={formData.departureTime ? formData.departureTime.split('T')[0] : ''}
                      onChange={(date) => {
                        const time = formData.departureTime ? formData.departureTime.split('T')[1] || '' : '';
                        if (time) {
                          setFormData({...formData, departureTime: `${date}T${time}`});
                        } else {
                          setFormData({...formData, departureTime: date});
                        }
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                      placeholder="Select departure date"
                      theme="departure"
                    />
                  </div>

                  {/* Departure Time - 25% width */}
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <CustomTimePicker
                      value={formData.departureTime ? formData.departureTime.split('T')[1]?.substring(0, 5) || '' : ''}
                      onChange={(time) => {
                        const date = formData.departureTime ? 
                          (formData.departureTime.includes('T') ? formData.departureTime.split('T')[0] : formData.departureTime) : 
                          new Date().toISOString().split('T')[0];
                        setFormData({...formData, departureTime: `${date}T${time}`});
                      }}
                      placeholder="Time"
                    />
                  </div>
                </div>
                
                {/* Departure Preview */}
                {formData.departureTime && formData.departureTime.includes('T') && formData.departureTime.split('T')[1] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-800 font-medium">
                      {new Date(formData.departureTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {new Date(formData.departureTime).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Arrival Section */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    {t('createFlight.sections.flightSchedule.arrival')}
                  </h3>
                </div>
                
                {/* Arrival Date & Time */}
                <div className="flex space-x-4">
                  {/* Arrival Date - 75% width */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <CustomCalendar
                      value={formData.arrivalTime ? formData.arrivalTime.split('T')[0] : ''}
                      onChange={(date) => {
                        const time = formData.arrivalTime ? formData.arrivalTime.split('T')[1] || '' : '';
                        if (time) {
                          setFormData({...formData, arrivalTime: `${date}T${time}`});
                        } else {
                          setFormData({...formData, arrivalTime: date});
                        }
                      }}
                      minDate={formData.departureTime ? formData.departureTime.split('T')[0] : new Date().toISOString().split('T')[0]}
                      placeholder="Select arrival date"
                      theme="arrival"
                    />
                  </div>

                  {/* Arrival Time - 25% width */}
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <CustomTimePicker
                      value={formData.arrivalTime ? formData.arrivalTime.split('T')[1]?.substring(0, 5) || '' : ''}
                      onChange={(time) => {
                        const date = formData.arrivalTime ? 
                          (formData.arrivalTime.includes('T') ? formData.arrivalTime.split('T')[0] : formData.arrivalTime) : 
                          (formData.departureTime ? 
                            (formData.departureTime.includes('T') ? formData.departureTime.split('T')[0] : formData.departureTime) : 
                            new Date().toISOString().split('T')[0]);
                        setFormData({...formData, arrivalTime: `${date}T${time}`});
                      }}
                      placeholder="Time"
                    />
                  </div>
                </div>
                
                {/* Arrival Preview */}
                {formData.arrivalTime && formData.arrivalTime.includes('T') && formData.arrivalTime.split('T')[1] && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-sm text-purple-800 font-medium">
                      {new Date(formData.arrivalTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {new Date(formData.arrivalTime).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warning at bottom of Schedule card */}
            {renderDurationWarning()}
          </div>

          {/* Aircraft Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {t('createFlight.sections.aircraftDetails.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createFlight.sections.aircraftDetails.fields.aircraftType')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.aircraftType}
                  onChange={(e) => setFormData({...formData, aircraftType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Gulfstream G650"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createFlight.sections.aircraftDetails.fields.availableSeats')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.seatsAvailable}
                  onChange={(e) => setFormData({...formData, seatsAvailable: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="12"
                  min="1"
                  max="50"
                />
              </div>

              <div className="md:col-span-2 group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createFlight.sections.aircraftDetails.fields.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 hover:border-gray-400"
                  placeholder="Luxury international flight from Colombia to Mexico with premium amenities, Wi-Fi, and catering service..."
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('createFlight.sections.pricing.title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charter Price (COP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="15000"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (COP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="45000"
                    min="0"
                    step="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t('editFlight.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? t('editFlight.buttons.updatingFlight') : t('editFlight.buttons.updateFlight')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}