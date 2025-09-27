import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Plane, BarChart3 } from 'lucide-react';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { getTotalCharterPrice, formatPrice, transformFlightsArray } from '../utils/flightDataUtils';
import ConfirmationModal from './ConfirmationModal';
import { useTranslation } from '../contexts/TranslationContext';
import OperatorFlightBookings from './OperatorFlightBookings';

// Helper function to format Colombian Peso currency
const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `COP ${formatted}`;
};

// Safe wrapper component
export default function SafeOperatorDashboard({ user }) {
  const { t, currentLanguage } = useTranslation();
  
  // Debug translations
  console.log('🌐 Current language:', currentLanguage);
  console.log('🔍 Translation test - origin:', t('dashboard.operator.flightCard.origin'));
  console.log('🔍 Translation test - destination:', t('dashboard.operator.flightCard.destination'));
  console.log('🔍 Translation test - seats:', t('dashboard.operator.flightCard.seats'));
  
  try {
    // Immediate safety checks
    if (!user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.operator.loading.title')}</h2>
            <p className="text-gray-600">{t('dashboard.operator.loading.message')}</p>
          </div>
        </div>
      );
    }

    if (!user.id) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{t('dashboard.operator.error.auth.title')}</h2>
            <p className="text-gray-600 mb-4">{t('dashboard.operator.error.auth.message')}</p>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4">
              <p className="text-sm">User data: {JSON.stringify(user, null, 2)}</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear Session & Re-login
            </button>
          </div>
        </div>
      );
    }

    // If we get here, render the actual dashboard
    return <ActualOperatorDashboard user={user} />;

  } catch (error) {
    console.error('Error in SafeOperatorDashboard:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('dashboard.operator.error.title')}</h2>
          <p className="text-gray-600 mb-4">{t('dashboard.operator.error.message')}</p>
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
            <p className="text-sm">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

// The actual dashboard component
function ActualOperatorDashboard({ user }) {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPastFlightsCollapsed, setIsPastFlightsCollapsed] = useState(true); // Collapsed by default
  const [isUpcomingFlightsCollapsed, setIsUpcomingFlightsCollapsed] = useState(false); // Expanded by default
  const [activeTab, setActiveTab] = useState('flights');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    flightId: null,
    flightRoute: ''
  });

  console.log('ActualOperatorDashboard - User:', user);

  useEffect(() => {
    try {
      if (user && user.id) {
        console.log('Setting up dashboard for user:', user.id);
        fetchFlights();
      } else {
        console.warn('User validation failed in useEffect');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in dashboard useEffect:', error);
      setIsLoading(false);
    }
  }, [user]);

  // Listen for flight updates to refresh the list
  useEffect(() => {
    const handleFlightUpdate = () => {
      console.log('🔄 Flight updated - refreshing list');
      fetchFlights();
    };

    window.addEventListener('flightUpdate', handleFlightUpdate);
    return () => window.removeEventListener('flightUpdate', handleFlightUpdate);
  }, []);

  const fetchFlights = async () => {
    try {
      console.log('🔄 Fetching flights for user:', user.id);
      setIsLoading(true);

      if (shouldUseRealAPI()) {
        console.log('📡 Using Real API...');
        const response = await flightsAPI.getOperatorFlights(user.id);
        console.log('📡 API Response:', response);
        console.log('📡 Flights array:', response.flights);
        console.log('📡 First flight sample:', response.flights?.[0]);
        setFlights(response.flights || []);
      } else {
        console.log('❌ No API available');
        setFlights([]);
      }
    } catch (error) {
      console.error('❌ Error fetching flights:', error);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to categorize flights based on departure date
  const categorizeFlights = (flights) => {
    const now = new Date();
    const currentFlights = [];
    const pastFlights = [];

    flights.forEach(flight => {
      const departureDate = new Date(flight.departure_time || flight.departure_datetime || flight.schedule?.departure);
      if (departureDate > now) {
        currentFlights.push(flight);
      } else {
        pastFlights.push(flight);
      }
    });

    return { currentFlights, pastFlights };
  };

  // Delete flight functionality
  const handleDeleteFlight = async (flightId, flightRoute) => {
    setDeleteModal({
      isOpen: true,
      flightId,
      flightRoute
    });
  };

  const confirmDeleteFlight = async () => {
    const { flightId } = deleteModal;
    
    // Store the original flight data in case we need to restore it
    const originalFlight = flights.find(f => f.id === flightId);
    
    try {
      // Optimistically remove from local state immediately
      setFlights(flights.filter(f => String(f.id) !== String(flightId)));
      
      if (shouldUseRealAPI()) {
        await flightsAPI.deleteFlight(flightId);
      } else {
        throw new Error('No API available');
      }
      
      // Close the modal
      setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' });
      
      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('flightUpdate'));
    } catch (error) {
      console.error('Error deleting flight:', error);
      
      // Restore the flight to the UI since deletion failed
      if (originalFlight) {
        setFlights(prev => [...prev, originalFlight]);
      }
      
      // Close the modal
      setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' });
      
      alert('Error deleting flight. Please try again.');
    }
  };

  const { currentFlights, pastFlights } = categorizeFlights(flights);

  // Tabs configuration to match AdminDashboard style
  const tabs = [
    { id: 'flights', name: t('dashboard.operator.tabs.flights') || 'My Flights', icon: Plane },
    { id: 'bookings', name: t('dashboard.operator.tabs.bookings') || 'Bookings CRM', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pt-16 pb-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.operator.title')}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {t('dashboard.operator.welcome')}
                </p>
              </div>
              <button
                onClick={() => navigate('/create-flight')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('dashboard.operator.createFlight')}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Matching AdminDashboard Style */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'flights' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('dashboard.operator.loading.flights')}</p>
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.operator.noFlights.title')}</h3>
                <p className="text-gray-600 mb-4">{t('dashboard.operator.noFlights.message')}</p>
              <button
                onClick={() => navigate('/create-flight')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('dashboard.operator.createFirstFlight')}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Flights Section */}
              {currentFlights.length > 0 && (
                <div>
                  <div 
                    className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                    onClick={() => setIsUpcomingFlightsCollapsed(!isUpcomingFlightsCollapsed)}
                  >
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {t('dashboard.operator.sections.upcoming.title')} ({currentFlights.length})
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                        {t('dashboard.operator.sections.upcoming.status')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {isUpcomingFlightsCollapsed ? t('dashboard.operator.actions.show') : t('dashboard.operator.actions.hide')}
                      </span>
                      {isUpcomingFlightsCollapsed ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Collapsible content */}
                  {!isUpcomingFlightsCollapsed && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 transition-all duration-300 ease-in-out">
                      {currentFlights.map((flight) => (
                        <FlightCard key={flight.id} flight={flight} navigate={navigate} onDelete={handleDeleteFlight} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Past Flights Section */}
              {pastFlights.length > 0 && (
                <div>
                  <div 
                    className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                    onClick={() => setIsPastFlightsCollapsed(!isPastFlightsCollapsed)}
                  >
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {t('dashboard.operator.sections.past.title')} ({pastFlights.length})
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {t('dashboard.operator.sections.past.status')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {isPastFlightsCollapsed ? t('dashboard.operator.actions.show') : t('dashboard.operator.actions.hide')}
                      </span>
                      {isPastFlightsCollapsed ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Collapsible content */}
                  {!isPastFlightsCollapsed && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 transition-all duration-300 ease-in-out">
                      {pastFlights.map((flight) => (
                        <FlightCard key={flight.id} flight={flight} navigate={navigate} isPast={true} onDelete={handleDeleteFlight} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Show message if only one category exists */}
              {currentFlights.length === 0 && pastFlights.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    {t('dashboard.operator.messages.allPastFlights')}
                  </p>
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <OperatorFlightBookings user={user} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' })}
        onConfirm={confirmDeleteFlight}
        title={t('dashboard.operator.delete.title')}
        message={t('dashboard.operator.delete.message')}
        route={deleteModal.flightRoute}
        type="danger"
        confirmText={t('dashboard.operator.delete.confirm')}
      />
    </div>
  );
}

// Flight Card Component - Modern Design
function FlightCard({ flight, navigate, isPast = false, onDelete }) {
  const { t, currentLanguage } = useTranslation();
  
  console.log('🎯 FlightCard flight data:', flight);
  console.log('🎯 Available seats:', flight.capacity?.availableSeats);
  console.log('🎯 Original price:', flight.pricing?.originalPrice);
  console.log('🎯 Flight duration:', flight.duration);
  console.log('🎯 Schedule duration:', flight.schedule?.duration);
  console.log('🎯 Estimated duration:', flight.estimated_duration_minutes);
  
  const cardOpacity = isPast ? 'opacity-75' : '';
  
  // Status styling - for past flights show booking status, for future flights show approval status
  const getStatusBadge = (flight, isPast) => {
    const normalizeNumber = (value, fallback = 0) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : fallback;
    };

    const maxPassengers = normalizeNumber(flight.max_passengers ?? flight.capacity?.maxPassengers, 0);
    const rawAvailableSeats =
      flight.available_seats ??
      flight.capacity?.availableSeats ??
      flight.seats_available ??
      maxPassengers;
    const availableSeats = Math.min(
      Math.max(normalizeNumber(rawAvailableSeats, maxPassengers), 0),
      maxPassengers || normalizeNumber(rawAvailableSeats, 0)
    );
    const bookedSeats = Math.max(maxPassengers - availableSeats, 0);

    const seatStatus = () => {
      if (maxPassengers <= 0) {
        return { style: 'bg-gray-400 text-white', text: t('dashboard.operator.flightCard.statuses.noData') };
      }

      if (availableSeats === 0) {
        return { style: 'bg-green-600 text-white', text: t('dashboard.operator.flightCard.statuses.fullyBooked') };
      }

      if (bookedSeats > 0) {
        return { style: 'bg-orange-500 text-white', text: t('dashboard.operator.flightCard.statuses.partiallyBooked') };
      }

      return { style: 'bg-blue-500 text-white', text: t('dashboard.operator.flightCard.statuses.available') };
    };

    if (isPast) {
      return seatStatus();
    }

    const status = flight.status ? String(flight.status).toLowerCase() : '';
    const pendingStatuses = ['pending', 'pending_approval', 'submitted', 'in_review', 'review'];
  const declinedStatuses = ['denied', 'declined', 'rejected', 'cancelled'];

    if (pendingStatuses.includes(status)) {
      return { style: 'bg-violet-500 text-white', text: t('dashboard.operator.flightCard.statuses.pending') };
    }

    if (declinedStatuses.includes(status)) {
      return { style: 'bg-red-500 text-white', text: t('dashboard.operator.flightCard.statuses.denied') };
    }

    return seatStatus();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    // Capitalize the first letter
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  return (
    <div className={`relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 overflow-hidden ${cardOpacity}`}>
      {/* Main Content */}
      <div className="p-6">
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
                  {flight.aircraft_model || flight.aircraft?.name || flight.aircraft?.manufacturer || 'Private Jet'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(flight.departure_time || flight.departure_datetime || flight.schedule?.departure)}
                </p>
              </div>
              <div className="flex-shrink-0">
                {(() => {
                  const statusInfo = getStatusBadge(flight, isPast);
                  return (
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-semibold ${statusInfo.style}`}>
                      {statusInfo.text}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Route Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {flight.origin_code || flight.origin?.code || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {flight.origin?.city || t('dashboard.operator.flightCard.origin')}
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
                {flight.destination_code || flight.destination?.code || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {flight.destination?.city || t('dashboard.operator.flightCard.destination')}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {flight.available_seats ?? flight.capacity?.availableSeats ?? flight.seats_available ?? 'N/A'}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.operator.flightCard.availableSeats')}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {flight.max_passengers || flight.capacity?.maxPassengers || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.operator.flightCard.totalSeats')}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {formatCOP(getTotalCharterPrice(flight))}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.operator.flightCard.totalPrice')}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {flight.flight_time || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.operator.flightCard.flightTime')}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              console.log('Navigating to flight details:', flight.id);
              navigate(`/flight/${flight.id}`);
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <EyeIcon className="h-4 w-4" />
            <span>{t('dashboard.operator.actions.viewDetails')}</span>
          </button>
          
          {!isPast && (
            <>
              <button
                onClick={() => navigate(`/edit-flight/${flight.id}`)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                title="Edit Flight"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete && onDelete(flight.id, `${flight.origin?.code || 'Unknown'} → ${flight.destination?.code || 'Unknown'}`)}
                className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                title="Delete Flight"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


