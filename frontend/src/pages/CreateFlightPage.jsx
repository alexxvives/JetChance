import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon, CameraIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import LocationAutocomplete from '../components/LocationAutocomplete';
import AirportAutocomplete from '../components/AirportAutocomplete';
import CurrencyInput from '../components/CurrencyInput';
import CustomDateTimePicker from '../components/CustomDateTimePicker';
import AirportService from '../services/AirportService';
import { getCountryByAirportCode } from '../utils/airportCountries';
import API_BASE_URL from '../config/api';

const API_URL = API_BASE_URL;

// Helper function to format Colombian Peso currency with COP label
const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `COP ${formatted}`;
};

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams(); // Get flight ID from URL for edit mode
  const isEditMode = !!id; // Determine if we're in edit or create mode

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

  const [formData, setFormData] = useState({
    departureTime: '',
    arrivalTime: '',
    aircraftType: '',
    price: '',
    originalPrice: '',
    seatsAvailable: '',
    aircraftImages: [],
    description: '',
    flightNumber: '', // Will be preserved in edit mode
    // Store selected airport objects - these contain all info we need
    originAirport: null,
    destinationAirport: null
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode); // Loading state for edit mode

  // Load flight data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadFlightData(id);
    }
  }, [id, isEditMode]);

  const loadFlightData = async (flightId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/flights/${flightId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load flight data');
      }

      const flight = await response.json();
      
      // Construct proper airport objects for the autocomplete components
      const originAirport = flight.origin_code ? {
        code: flight.origin_code,
        name: flight.origin_name,
        city: flight.origin_city,
        country: flight.origin_country
      } : null;

      const destinationAirport = flight.destination_code ? {
        code: flight.destination_code,
        name: flight.destination_name,
        city: flight.destination_city,
        country: flight.destination_country
      } : null;
      
      // Populate form with existing flight data
      setFormData({
        departureTime: flight.departure_time || flight.departure_datetime || '',
        arrivalTime: flight.arrival_time || flight.arrival_datetime || '',
        aircraftType: flight.aircraft_model || '',
        price: flight.empty_leg_price ? String(flight.empty_leg_price) : '',
        originalPrice: flight.market_price ? String(flight.market_price) : '',
        seatsAvailable: String(flight.available_seats || ''),
        aircraftImages: [],
        description: flight.description || '',
        flightNumber: flight.flight_number || flight.id || '', // Preserve existing flight number
        originAirport: originAirport,
        destinationAirport: destinationAirport
      });

      // Load existing images as previews
      if (flight.images && Array.isArray(flight.images) && flight.images.length > 0) {
        // Images are already full URLs from the API
        const previews = flight.images.map(imgUrl => {
          // Extract just the filename from the URL for storage
          const filename = imgUrl.split('/').pop();
          return {
            preview: imgUrl,
            name: filename,
            isExisting: true
          };
        });
        setImagePreviews(previews);
        console.log('✅ Loaded existing images:', previews);
      }

    } catch (error) {
      console.error('Error loading flight:', error);
      alert('Failed to load flight data');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      const newImages = [...formData.aircraftImages, ...validFiles];
      setFormData({...formData, aircraftImages: newImages});
      
      // Create previews for new files
      const newPreviews = [...imagePreviews];
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            file: file,
            preview: e.target.result,
            name: file.name
          });
          setImagePreviews([...newPreviews]);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (index) => {
    const newImages = formData.aircraftImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({...formData, aircraftImages: newImages});
    setImagePreviews(newPreviews);
  };

  // Validation function to check if dates/times are valid
  const isFormValid = () => {
    if (!formData.departureTime || !formData.arrivalTime) return true; // Let normal required field validation handle this
    
    const departure = new Date(formData.departureTime);
    const arrival = new Date(formData.arrivalTime);
    
    return arrival > departure; // Arrival must be after departure (not equal)
  };

  // Simple airport change handlers
  const handleOriginAirportChange = (airport) => {
    setFormData({
      ...formData,
      originAirport: airport
    });
  };

  const handleDestinationAirportChange = (airport) => {
    setFormData({
      ...formData,
      destinationAirport: airport
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate that arrival time is after departure time
    if (!isFormValid()) {
      alert('Error: Arrival time cannot be before or equal to departure time. Please ensure there is at least some flight duration.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      let uploadedImageUrls = [];
      
      // In edit mode, preserve existing images
      if (isEditMode) {
        const existingImages = imagePreviews
          .filter(img => img.isExisting)
          .map(img => img.name); // Just the filename, not full URL
        uploadedImageUrls.push(...existingImages);
      }
      
      // Upload new images (those without isExisting flag or from aircraftImages array)
      if (formData.aircraftImages.length > 0) {
        for (const image of formData.aircraftImages) {
          try {
            const formDataForUpload = new FormData();
            formDataForUpload.append('image', image); // Backend expects 'image', not 'aircraftImage'
            
            const uploadResponse = await fetch(`${API_URL}/upload/aircraft-image`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              },
              body: formDataForUpload
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              // Handle both relative and absolute URLs
              const imageUrl = uploadResult.imageUrl.startsWith('http') 
                ? uploadResult.imageUrl 
                : `${API_BASE_URL.replace('/api', '')}${uploadResult.imageUrl}`;
              uploadedImageUrls.push(imageUrl);
              console.log('✅ Image uploaded successfully:', imageUrl);
            } else {
              const errorText = await uploadResponse.text();
              console.error('❌ Image upload failed:', uploadResponse.status, errorText);
              // Continue with other images even if one fails
            }
          } catch (imageError) {
            console.error('❌ Error uploading image:', image.name, imageError);
            // Continue with other images even if one fails
          }
        }
      }
      
      // Handle custom airports - create them in database before flight submission
      const customAirports = [];
      
      // Check if origin airport is a pending custom airport
      if (formData.originAirport?.isPending) {
        console.log('Creating custom origin airport:', formData.originAirport);
        try {
          const response = await fetch(`${API_URL}/airports`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
              code: formData.originAirport.code,
              name: formData.originAirport.name,
              city: formData.originAirport.city,
              country: formData.originAirport.country
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409) {
              throw new Error(`Airport code '${formData.originAirport.code}' already exists. Please use a different code.`);
            }
            throw new Error(errorData.error || 'Failed to create origin airport');
          }
          
          const createdAirport = await response.json();
          customAirports.push(createdAirport);
          console.log('✅ Origin airport created successfully:', createdAirport);
        } catch (error) {
          console.error('❌ Error creating origin airport:', error);
          throw new Error(`Failed to create origin airport: ${error.message}`);
        }
      }
      
      // Check if destination airport is a pending custom airport
      if (formData.destinationAirport?.isPending) {
        console.log('Creating custom destination airport:', formData.destinationAirport);
        try {
          const response = await fetch(`${API_URL}/airports`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
              code: formData.destinationAirport.code,
              name: formData.destinationAirport.name,
              city: formData.destinationAirport.city,
              country: formData.destinationAirport.country
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409) {
              throw new Error(`Airport code '${formData.destinationAirport.code}' already exists. Please use a different code.`);
            }
            throw new Error(errorData.error || 'Failed to create destination airport');
          }
          
          const createdAirport = await response.json();
          customAirports.push(createdAirport);
          console.log('✅ Destination airport created successfully:', createdAirport);
        } catch (error) {
          console.error('❌ Error creating destination airport:', error);
          throw new Error(`Failed to create destination airport: ${error.message}`);
        }
      }
      
      // Prepare flight data
      const flightData = {
        // Backend required fields (snake_case matching database schema)
        aircraft_model: formData.aircraftType,
        origin_name: formData.originAirport ? `${formData.originAirport.name} (${formData.originAirport.code})` : '',
        origin_city: formData.originAirport?.city || '',
        origin_country: formData.originAirport?.country || getCountryByAirportCode(formData.originAirport?.code),
        destination_name: formData.destinationAirport ? `${formData.destinationAirport.name} (${formData.destinationAirport.code})` : '',
        destination_city: formData.destinationAirport?.city || '',
        destination_country: formData.destinationAirport?.country || getCountryByAirportCode(formData.destinationAirport?.code),
        departure_datetime: formData.departureTime,
        arrival_datetime: formData.arrivalTime || null,
        market_price: parseFloat(formData.originalPrice || formData.price) * 1.3, // Original price or calculated
        empty_leg_price: parseFloat(formData.price), // Actual empty leg price
        available_seats: parseInt(formData.seatsAvailable),
        total_seats: parseInt(formData.seatsAvailable),
        status: 'pending', // New flights start as pending
        description: formData.description || null,
        images: JSON.stringify(uploadedImageUrls.length > 0 ? uploadedImageUrls : [])
      };
      
      // Use real API to save to database, fallback to mock API if needed
      if (shouldUseRealAPI()) {
        if (isEditMode) {
          // Update existing flight
          await flightsAPI.updateFlight(id, flightData);
          console.log('Flight updated successfully:', flightData);
        } else {
          // Create new flight
          await flightsAPI.createFlight(flightData);
          console.log('Flight created successfully:', flightData);
        }
       } else {
        throw new Error(`No API available for flight ${isEditMode ? 'update' : 'creation'}`);
      }
      
      // Navigate back to dashboard with appropriate message
      navigate('/dashboard', { 
        state: { 
          message: isEditMode 
            ? 'Flight updated successfully!' 
            : 'Flight submitted for review successfully! You will be notified once it is approved.' 
        } 
      });
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} flight:`, error);
      
      // Show more specific error message
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error ${isEditMode ? 'updating' : 'creating'} flight: ${errorMessage}`);
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
            {t('createFlight.backToDashboard')}
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? t('editFlight.title') : t('createFlight.title')}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? t('editFlight.subtitle') : t('createFlight.subtitle')}
        </p>
      </div>        <form onSubmit={handleSubmit} className="space-y-8">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imagePreviews.map((imageData, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageData.preview}
                        alt={`Aircraft preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs max-w-[calc(100%-1rem)] truncate">
                        {imageData.name}
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          Main
                        </div>
                      )}
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
              <AirportAutocomplete
                label={t('createFlight.sections.routeInformation.fields.originAirport')}
                placeholder={t('createFlight.sections.routeInformation.placeholders.originPlaceholder')}
                value={formData.originAirport}
                onChange={handleOriginAirportChange}
                disabledAirport={formData.destinationAirport?.code}
                required
              />

              <AirportAutocomplete
                label="Destination Airport"
                placeholder={t('createFlight.sections.routeInformation.placeholders.destinationPlaceholder')}
                value={formData.destinationAirport}
                onChange={handleDestinationAirportChange}
                disabledAirport={formData.originAirport?.code}
                required
              />
            </div>
            
            {/* Help text for custom airports */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">{t('createFlight.sections.routeInformation.help.notInDatabase')}</p>
                  <p className="text-blue-700">
                    {t('createFlight.sections.routeInformation.help.noProblem')}
                  </p>
                </div>
              </div>
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
                {/* Departure Date & Time */}
                <CustomDateTimePicker
                  value={formData.departureTime}
                  onChange={(datetime) => setFormData({...formData, departureTime: datetime})}
                  minDate={new Date()}
                  placeholder={t('createFlight.sections.flightSchedule.placeholders.selectDate')}
                  label={t('createFlight.sections.flightSchedule.departureDateTimeTitle')}
                  required
                />
              </div>

              {/* Arrival Section */}
              <div className="space-y-4">
                <CustomDateTimePicker
                  value={formData.arrivalTime}
                  onChange={(datetime) => setFormData({...formData, arrivalTime: datetime})}
                  minDate={formData.departureTime ? new Date(new Date(formData.departureTime).toDateString()) : new Date()}
                  placeholder={t('createFlight.sections.flightSchedule.placeholders.selectArrivalDate')}
                  label={t('createFlight.sections.flightSchedule.arrivalDateTimeTitle')}
                  required
                />
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
                  placeholder={t('createFlight.sections.aircraftDetails.placeholders.aircraftType')}
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
                  placeholder={t('createFlight.sections.aircraftDetails.placeholders.availableSeats')}
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
                  placeholder={t('createFlight.sections.aircraftDetails.placeholders.description')}
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
                <CurrencyInput
                  label={t('createFlight.sections.pricing.fields.pricePerSeat')}
                  value={formData.price}
                  onChange={(value) => setFormData({...formData, price: value})}
                  currency="COP"
                  placeholder=""
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t('createFlight.sections.pricing.fields.pricePerSeatHelp')}</p>
              </div>

              <div className="group">
                <CurrencyInput
                  label={t('createFlight.sections.pricing.fields.marketPricePerSeat')}
                  value={formData.originalPrice}
                  onChange={(value) => setFormData({...formData, originalPrice: value})}
                  currency="COP"
                  placeholder=""
                />
                <p className="text-xs text-gray-500 mt-1">{t('createFlight.sections.pricing.fields.marketPricePerSeatHelp')}</p>
              </div>
            </div>

            {/* Commission note - Full width below both price inputs */}
            {formData.price && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{t('createFlight.sections.pricing.commission.customerPrice')}</strong> {formatCOP(parseFloat(formData.price) * 1.3)} {t('createFlight.sections.pricing.commission.perSeat')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {t('createFlight.sections.pricing.commission.commissionNote')}
                </p>
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
              {t('createFlight.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className={`px-8 py-3 font-semibold rounded-xl focus:ring-2 focus:ring-offset-2 transition-colors ${
                !isFormValid() 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              } ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isEditMode 
                ? (isSubmitting ? t('editFlight.buttons.updatingFlight') : t('editFlight.buttons.updateFlight'))
                : (isSubmitting ? t('createFlight.buttons.creatingFlight') : t('createFlight.buttons.createFlight'))
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
