import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import PayUPaymentForm from '../components/PayUPaymentForm';
import { flightsAPI } from '../api/flightsAPI';

const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `COP ${formatted}`;
};

export default function PaymentPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { flightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get flight data from navigation state or fetch it
  const [flight, setFlight] = useState(location.state?.flight || null);
  const [selectedPassengers, setSelectedPassengers] = useState(location.state?.passengers || 1);
  const [price, setPrice] = useState(location.state?.price || 0);
  const [loading, setLoading] = useState(!flight);
  const [error, setError] = useState(null);

  // New state for multi-step process
  const [currentStep, setCurrentStep] = useState(1);
  const [passengerData, setPassengerData] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: ''
  });
  const [completedSections, setCompletedSections] = useState({});

  // Initialize passenger data when component mounts or passenger count changes
  useEffect(() => {
    if (selectedPassengers > 0) {
      const initialData = Array.from({ length: selectedPassengers }, (_, index) => ({
        id: index + 1,
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        documentType: '',
        documentNumber: ''
      }));
      setPassengerData(initialData);
    }
  }, [selectedPassengers]);

  // Update contact info when user data becomes available
  useEffect(() => {
    if (user?.email && !contactInfo.email) {
      setContactInfo(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user?.email]);

  // Fetch flight data if not passed via navigation
  useEffect(() => {
    if (!flight && flightId) {
      fetchFlight();
    }
  }, [flightId, flight]);

  const fetchFlight = async () => {
    try {
      setLoading(true);
      const response = await flightsAPI.getFlightById(flightId);
      if (response) {
        setFlight(response);
        setPrice(response.empty_leg_price || response.original_price || 0);
      } else {
        setError('Flight not found');
      }
    } catch (err) {
      console.error('Error fetching flight:', err);
      setError('Failed to load flight details');
    } finally {
      setLoading(false);
    }
  };

  // Format date helper function
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
      return 'Not specified';
    }
    
    try {
      // Handle different date formats
      let date;
      
      // Add more specific parsing for the format we expect from the database
      if (typeof dateTimeString === 'string') {
        // If it's in format "2025-09-20T14:12", add seconds for better parsing
        if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          date = new Date(dateTimeString + ':00');
        } else {
          date = new Date(dateTimeString);
        }
      } else {
        date = new Date(dateTimeString);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateTimeString);
        return 'Invalid date format';
      }
      
      const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    } catch (error) {
      console.error('Date formatting error:', error, 'for input:', dateTimeString);
      return 'Date unavailable';
    }
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment success result:', result);
    console.log('Flight data:', flight);
    console.log('Selected passengers:', selectedPassengers);
    
    // Navigate to success page with booking details
    navigate('/booking-success', {
      state: {
        booking: result.booking,
        flight: flight,
        customerData: result.customerData,
        transactionId: result.transactionId,
        amount: result.amount,
        paymentMethod: result.paymentMethod
      }
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Could show error modal or toast notification
  };

  // Helper functions for passenger data
  const updatePassengerData = (passengerId, field, value) => {
    setPassengerData(prev => prev.map(passenger => 
      passenger.id === passengerId 
        ? { ...passenger, [field]: value }
        : passenger
    ));
  };

  const isPassengerComplete = (passenger) => {
    return passenger.firstName && 
           passenger.lastName && 
           passenger.dateOfBirth && 
           passenger.documentType && 
           passenger.documentNumber;
  };

  const canContinueToContact = passengerData.length > 0 && 
    passengerData.every(passenger => isPassengerComplete(passenger));

  const handleContinueToContact = () => {
    if (canContinueToContact) {
      setCurrentStep(2);
    }
  };

  const canContinueToPayment = contactInfo.email && contactInfo.phone;

  const handleContinueToPayment = () => {
    if (canContinueToPayment) {
      setCurrentStep(3);
    }
  };

  const isContactInfoComplete = () => {
    return contactInfo.email && contactInfo.phone;
  };

  const canProceedToStep = (step) => {
    switch (step) {
      case 2: // Contact info step
        return passengerData.every(isPassengerComplete);
      case 3: // Payment step
        return passengerData.every(isPassengerComplete) && isContactInfoComplete();
      default:
        return true;
    }
  };

  const handleStepChange = (step) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
    }
  };

  const getStepStatus = (step) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('payment.loadingFlightDetails')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('payment.errorLoadingFlight')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('payment.goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('payment.flightNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              {t('payment.backToFlightDetails')}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {t('payment.bookingReference')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Flight Summary - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('payment.flightSummary')}</h2>
              
              {/* Route */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{flight.origin_code}</div>
                    <div className="text-sm text-gray-500">{flight.origin_city}</div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="border-t-2 border-dashed border-gray-300 relative">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-blue-600 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{flight.destination_code}</div>
                    <div className="text-sm text-gray-500">{flight.destination_city}</div>
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.departure')}:</span>
                  <span className="font-medium">
                    {formatDateTime(flight.departure_time || flight.departure_datetime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.aircraft')}:</span>
                  <span className="font-medium">{flight.aircraft_model || flight.aircraft_name || t('payment.notSpecified')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.operator')}:</span>
                  <span className="font-medium">{flight.operator || flight.operator_name || t('payment.notSpecified')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('payment.passengers')}:</span>
                  <span className="font-medium">{selectedPassengers}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('payment.emptyLegPricePerSeat')}:</span>
                    <span className="font-medium">{formatCOP(flight.empty_leg_price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('payment.passengersMultiplied').replace('{count}', selectedPassengers)}:</span>
                    <span className="font-medium">{formatCOP(price)}</span>
                  </div>
                  {flight.original_price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('payment.marketPrice')}:</span>
                      <span className="text-gray-500 line-through">
                        {formatCOP(flight.original_price * selectedPassengers)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{t('payment.total')}:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCOP(price)}
                    </span>
                  </div>
                </div>

                {/* Savings Badge */}
                {flight.original_price && flight.empty_leg_price < flight.original_price && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          {t('payment.youAreSaving').replace('{amount}', formatCOP((flight.original_price - flight.empty_leg_price) * selectedPassengers))}
                        </div>
                        <div className="text-xs text-green-600">
                          {t('payment.percentOffRegularPrice').replace('{percent}', Math.round(((flight.original_price - flight.empty_leg_price) / flight.original_price) * 100))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">{t('payment.securePayment')}</h3>
                    <p className="text-xs text-blue-600 mt-1">
                      {t('payment.securePaymentDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Step Payment Form - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Progress Indicator */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                        1
                      </div>
                      <span className="ml-2 text-sm font-medium">{t('payment.steps.passengerInfo')}</span>
                    </div>
                    
                    <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    
                    <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                        2
                      </div>
                      <span className="ml-2 text-sm font-medium">{t('payment.steps.contactInfo')}</span>
                    </div>
                    
                    <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    
                    <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                        3
                      </div>
                      <span className="ml-2 text-sm font-medium">{t('payment.steps.payment')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                {currentStep === 1 && (
                  <PassengerInformationStep
                    passengerData={passengerData}
                    updatePassengerData={updatePassengerData}
                    isPassengerComplete={isPassengerComplete}
                    onContinue={handleContinueToContact}
                    canContinue={canContinueToContact}
                    flight={flight}
                    t={t}
                  />
                )}

                {currentStep === 2 && (
                  <ContactInformationStep
                    contactInfo={contactInfo}
                    setContactInfo={setContactInfo}
                    onBack={() => setCurrentStep(1)}
                    onContinue={handleContinueToPayment}
                    canContinue={canContinueToPayment}
                    user={user}
                    t={t}
                  />
                )}

                {currentStep === 3 && (
                  <PaymentStep
                    amount={price}
                    currency="COP"
                    flightId={flight.id}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    onBack={() => setCurrentStep(2)}
                    flight={flight}
                    selectedPassengers={selectedPassengers}
                    passengerData={passengerData}
                    contactInfo={contactInfo}
                    t={t}
                  />
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">{t('payment.instantConfirmation')}</h3>
                    <p className="text-xs text-gray-600">{t('payment.instantConfirmationDescription')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">{t('payment.securePayment')}</h3>
                    <p className="text-xs text-gray-600">{t('payment.pciCompliantDescription')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">{t('payment.support247')}</h3>
                    <p className="text-xs text-gray-600">{t('payment.support247Description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Passenger Information Component
const PassengerInformationStep = ({ passengerData, updatePassengerData, isPassengerComplete, onContinue, canContinue, flight, t }) => {
  const [expandedPassenger, setExpandedPassenger] = useState(1);

  // Check if flight is international to determine document requirements
  const isInternationalFlight = flight.origin_country !== flight.destination_country;
  
  const documentTypes = isInternationalFlight 
    ? [
        { value: 'passport', label: 'Passport' },
      ]
    : [
        { value: 'cc', label: 'Cédula de Ciudadanía' },
        { value: 'ce', label: 'Cédula de Extranjería' },
        { value: 'passport', label: 'Passport' },
        { value: 'ti', label: 'Tarjeta de Identidad' },
      ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-xl font-bold">{t('payment.passengerStep.title')}</h2>
        <p className="text-blue-100 text-sm mt-1">{t('payment.passengerStep.subtitle')}</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {passengerData.map((passenger) => (
            <div key={passenger.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedPassenger(expandedPassenger === passenger.id ? null : passenger.id)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  isPassengerComplete(passenger) 
                    ? 'bg-green-50 hover:bg-green-100 border-green-200' 
                    : expandedPassenger === passenger.id 
                      ? 'bg-blue-50 hover:bg-blue-100' 
                      : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isPassengerComplete(passenger)
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {isPassengerComplete(passenger) ? '✓' : passenger.id}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {passenger.firstName && passenger.lastName 
                        ? `${passenger.firstName} ${passenger.lastName}` 
                        : `${t('payment.passengerStep.passengerLabel')} ${passenger.id}`
                      }
                    </h3>
                    <p className={`text-sm ${isPassengerComplete(passenger) ? 'text-green-600' : 'text-gray-500'}`}>
                      {isPassengerComplete(passenger) ? t('payment.passengerStep.complete') : t('payment.passengerStep.informationRequired')}
                    </p>
                  </div>
                </div>
                {expandedPassenger === passenger.id ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
              </button>

              {expandedPassenger === passenger.id && (
                <div className="px-4 py-4 border-t bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('payment.passengerStep.firstName')} *
                      </label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => updatePassengerData(passenger.id, 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder={t('payment.passengerStep.firstNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('payment.passengerStep.lastName')} *
                      </label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => updatePassengerData(passenger.id, 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder={t('payment.passengerStep.lastNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('payment.passengerStep.dateOfBirth')} *
                      </label>
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => updatePassengerData(passenger.id, 'dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('payment.passengerStep.documentType')} *
                      </label>
                      <select
                        value={passenger.documentType}
                        onChange={(e) => updatePassengerData(passenger.id, 'documentType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">{t('payment.passengerStep.selectDocumentType')}</option>
                        {documentTypes.map(doc => (
                          <option key={doc.value} value={doc.value}>{doc.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('payment.passengerStep.documentNumber')} *
                      </label>
                      <input
                        type="text"
                        value={passenger.documentNumber}
                        onChange={(e) => updatePassengerData(passenger.id, 'documentNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder={t('payment.passengerStep.documentNumberPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('payment.passengerStep.continueToContact')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 2: Contact Information Component
const ContactInformationStep = ({ contactInfo, setContactInfo, onBack, onContinue, canContinue, user, t }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-xl font-bold">{t('payment.contactStep.title')}</h2>
        <p className="text-blue-100 text-sm mt-1">{t('payment.contactStep.subtitle')}</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment.contactStep.email')} *
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('payment.contactStep.emailPlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {user?.email && contactInfo.email === user.email ? 
                t('payment.contactStep.emailPrefilled') :
                t('payment.contactStep.emailHelp')
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment.contactStep.phone')} *
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('payment.contactStep.phonePlaceholder')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('payment.contactStep.phoneHelp')}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('payment.contactStep.backToPassengers')}
          </button>
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('payment.contactStep.continueToPayment')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 3: Payment Component
const PaymentStep = ({ amount, currency, flightId, onPaymentSuccess, onPaymentError, onBack, flight, selectedPassengers, passengerData, contactInfo, t }) => {
  return (
    <div className="space-y-6">
      {/* Summary of provided information */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('payment.paymentStep.bookingSummary')}</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-700">{t('payment.paymentStep.passengersTitle')}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {passengerData.map(passenger => (
                <div key={passenger.id}>
                  {passenger.firstName} {passenger.lastName} - {passenger.documentType?.toUpperCase()} {passenger.documentNumber}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">{t('payment.paymentStep.contactTitle')}</h4>
            <div className="text-sm text-gray-600">
              <div>{contactInfo.email}</div>
              <div>{contactInfo.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-xl font-bold">{t('payment.paymentStep.paymentInfo')}</h2>
          <p className="text-blue-100 text-sm mt-1">{t('payment.paymentStep.paymentSubtitle')}</p>
        </div>
        
        <div className="p-6">
          <PayUPaymentForm
            amount={amount}
            currency={currency}
            flightId={flightId}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            passengerData={passengerData}
            contactInfo={contactInfo}
            flightDetails={{
              route: `${flight.origin_code} → ${flight.destination_code}`,
              passengers: selectedPassengers,
              date: flight.departure_time || flight.departure_datetime,
              aircraft: flight.aircraft_model || flight.aircraft_name,
              operator: flight.operator_name || flight.operator,
              originCity: flight.origin_city,
              destinationCity: flight.destination_city,
              originCode: flight.origin_code,
              destinationCode: flight.destination_code,
              originCountry: flight.origin_country || 'CO',
              destinationCountry: flight.destination_country || 'CO'
            }}
          />
        </div>

        <div className="px-6 pb-6 flex justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('payment.paymentStep.backToContact')}
          </button>
        </div>
      </div>
    </div>
  );
};
