import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon, CameraIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import LocationAutocomplete from '../components/LocationAutocomplete';
import AirportAutocomplete from '../components/AirportAutocomplete';
import CurrencyInput from '../components/CurrencyInput';
import CustomCalendar from '../components/CustomCalendar';
import CustomTimePicker from '../components/CustomTimePicker';
import { searchAirports } from '../data/airportsAndCities';
import { getCountryByAirportCode } from '../utils/airportCountries';

// Helper function to format Colombian Peso currency
const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
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

  // Helper function to render flight duration warning
  const renderDurationWarning = () => {
    if (!formData.departureTime || !formData.arrivalTime) return null;
    
    const departure = new Date(formData.departureTime);
    const arrival = new Date(formData.arrivalTime);
    const durationMs = arrival - departure;
    
    // Check if arrival is before departure
    if (durationMs < 0) {
      return (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Invalid Flight Times</p>
              <p className="text-red-700 text-sm">
                Arrival time cannot be before departure time. Please check your flight schedule.
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
          {t('createFlight.sections.flightSchedule.warning')}
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
    // Store selected airport objects - these contain all info we need
    originAirport: null,
    destinationAirport: null
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    return arrival > departure; // Arrival must be after departure
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
      alert('Error: Arrival time cannot be before departure time. Please check your flight schedule.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      let uploadedImageUrls = [];
      
      // Upload all selected images
      if (formData.aircraftImages.length > 0) {
        for (const image of formData.aircraftImages) {
          try {
            const formDataForUpload = new FormData();
            formDataForUpload.append('aircraftImage', image);
            
            const uploadResponse = await fetch('http://localhost:4000/api/upload/aircraft-image', {
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
                : `http://localhost:4000${uploadResult.imageUrl}`;
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
      
      // Prepare flight data
      const flightData = {
        // Required backend fields
        aircraftType: formData.aircraftType,
        originCode: formData.originAirport?.code || '',
        destinationCode: formData.destinationAirport?.code || '',
        departureDateTime: formData.departureTime,
        originalPrice: parseFloat(formData.originalPrice),
        emptyLegPrice: parseFloat(formData.price),
        totalSeats: parseInt(formData.seatsAvailable),
        
        // Optional fields with improved airport naming format
        flightNumber: `CF${Date.now()}`, // Generate flight number
        originName: formData.originAirport ? `${formData.originAirport.name} (${formData.originAirport.code})` : '',
        originCity: formData.originAirport?.city || '',
        originCountry: formData.originAirport?.country || getCountryByAirportCode(formData.originAirport?.code),
        destinationName: formData.destinationAirport ? `${formData.destinationAirport.name} (${formData.destinationAirport.code})` : '',
        destinationCity: formData.destinationAirport?.city || '',
        destinationCountry: formData.destinationAirport?.country || getCountryByAirportCode(formData.destinationAirport?.code),
        arrivalDateTime: formData.arrivalTime,
        description: formData.description,
        
        // Additional frontend fields for display
        origin: formData.originAirport?.city || '',
        destination: formData.destinationAirport?.city || '',
        price: parseFloat(formData.price),
        seatsAvailable: parseInt(formData.seatsAvailable),
        aircraft_image: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : getDefaultAircraftImage(formData.aircraftType),
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : []
      };
      
      // Use real API to save to database, fallback to mock API if needed
      if (shouldUseRealAPI()) {
        await flightsAPI.createFlight(flightData);
       } else {
        throw new Error('No API available for flight creation');
      }
      
      console.log('Flight created successfully:', flightData);
      
      // Navigate back to dashboard
      navigate('/dashboard', { 
        state: { message: 'Flight submitted for review successfully! You will be notified once it is approved.' } 
      });
    } catch (error) {
      console.error('Error creating flight:', error);
      
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
            {t('createFlight.backToDashboard')}
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">{t('createFlight.title')}</h1>
          <p className="text-gray-600 mt-1">{t('createFlight.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                label="Origin Airport"
                placeholder="Type city or airport... (e.g., 'Miami' or 'BOG')"
                value={formData.originAirport}
                onChange={handleOriginAirportChange}
                required
              />

              <AirportAutocomplete
                label="Destination Airport"
                placeholder="Type city or airport... (e.g., 'Mexico City' or 'MEX')"
                value={formData.destinationAirport}
                onChange={handleDestinationAirportChange}
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
                  <p className="text-blue-800 font-medium">Airport not in our database?</p>
                  <p className="text-blue-700">
                    No problem! If you're using a smaller airport or private airstrip, click "Airport not listed?" 
                    in the dropdown to add custom airport details.
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
                <CurrencyInput
                  label={t('createFlight.sections.pricing.fields.pricePerSeat')}
                  value={formData.price}
                  onChange={(value) => setFormData({...formData, price: value})}
                  currency="COP"
                  placeholder="1,500,000"
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
                  placeholder="10,000,000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t('createFlight.sections.pricing.fields.marketPricePerSeatHelp')}</p>
              </div>
            </div>

            {formData.price && formData.originalPrice && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-green-700">
                  <strong>{t('createFlight.sections.pricing.savingsCalculation.savings')}:</strong> {formatCOP(parseFloat(formData.originalPrice) - parseFloat(formData.price))} {t('createFlight.sections.pricing.savingsCalculation.perSeat')} 
                  ({Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}% {t('createFlight.sections.pricing.savingsCalculation.off')})
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
              {isSubmitting ? t('createFlight.buttons.creatingFlight') : t('createFlight.buttons.createFlight')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
