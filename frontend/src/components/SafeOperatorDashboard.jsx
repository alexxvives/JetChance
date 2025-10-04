import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import OperatorFlightBookings from './OperatorFlightBookings';
import ConfirmationModal from './ConfirmationModal';
import { 
  PlusIcon, 
  PaperAirplaneIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon, 
  BellIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { User, ChevronDown } from 'lucide-react';

function ActualOperatorDashboard({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('flights');
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, flightId: null, flightRoute: '' });
  const [isUpcomingFlightsCollapsed, setIsUpcomingFlightsCollapsed] = useState(false);
  const [isPastFlightsCollapsed, setIsPastFlightsCollapsed] = useState(false);
  
  // Dropdown state management
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  
  // Refs for dropdowns
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Tab configuration
  const tabs = [
    { id: 'flights', name: t('dashboard.operator.tabs.flights'), icon: PaperAirplaneIcon },
    { id: 'bookings', name: t('dashboard.operator.tabs.bookings'), icon: UserGroupIcon }
  ];

  useEffect(() => {
    loadFlights();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadFlights = async () => {
    if (!user || !user.id) {
      console.log('❌ No user available for loading flights');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Loading flights for operator:', user.id);
      
      const response = await fetch(`http://localhost:4000/api/flights?user_id=${user.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 No flights found for this operator');
          setFlights([]);
          return;
        }
        throw new Error(`Failed to fetch flights: ${response.status}`);
      }
      
      const flightData = await response.json();
      console.log('✅ Loaded flights:', flightData);
      
      // Handle both direct array response and object with flights property
      const flightsArray = Array.isArray(flightData) ? flightData : flightData.flights || [];
      setFlights(flightsArray);
      
    } catch (error) {
      console.error('❌ Error loading flights:', error);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlight = (flightId, flightRoute) => {
    setDeleteModal({ isOpen: true, flightId, flightRoute });
  };

  const confirmDeleteFlight = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/flights/${deleteModal.flightId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadFlights();
        setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' });
      } else {
        console.error('Failed to delete flight');
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  };

  // Separate flights into current and past
  const now = new Date();
  
  // Use the correct field name: departure_time
  const getFlightDate = (flight) => {
    return flight.departure_time || 
           flight.departureDateTime || 
           flight.departure_date || 
           flight.departureDate || 
           flight.date;
  };
  
  const currentFlights = flights.filter(flight => {
    const flightDate = getFlightDate(flight);
    if (!flightDate) return false;
    return new Date(flightDate) > now;
  });
  
  const pastFlights = flights.filter(flight => {
    const flightDate = getFlightDate(flight);
    if (!flightDate) return false;
    return new Date(flightDate) <= now;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        {/* Sidebar Header with Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <img 
              src="/images/logo/logo2.svg" 
              alt="JetChance" 
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="flex-1 text-left">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  {t('dashboard.operator.welcomeBack') || 'Welcome back'} {user?.firstName} {user?.lastName}
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('dashboard.operator.role') || 'Operator'}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Right side navigation components */}
            <div className="flex items-center space-x-4">
              {/* Create Flight Button */}
              <button
                onClick={() => navigate('/create-flight')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('dashboard.operator.createFlight') || 'Create Flight'}
              </button>

              {/* Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button 
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 min-w-[50px]"
                >
                  <GlobeAltIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">EN</span>
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Language Dropdown */}
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          // Add language change logic here
                          setIsLanguageDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🇺🇸 English
                      </button>
                      <button
                        onClick={() => {
                          // Add language change logic here
                          setIsLanguageDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🇪🇸 Español
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notification Bell */}
              <div className="relative" ref={notificationDropdownRef}>
                <button 
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  className="relative flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg animate-pulse">2</span>
                </button>
                
                {/* Notifications Dropdown */}
                {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">2 new</span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-l-4 border-l-green-400 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <DocumentTextIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Flight approved</div>
                            <div className="text-sm text-gray-600 mt-1">Your flight BOG → MIA has been approved and is now live</div>
                            <div className="text-xs text-gray-400 mt-2 flex items-center">
                              <span>1 hour ago</span>
                              <span className="ml-2 w-2 h-2 bg-green-400 rounded-full"></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-l-4 border-l-blue-400 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">New booking</div>
                            <div className="text-sm text-gray-600 mt-1">Someone booked your MDE → BOG flight for tomorrow</div>
                            <div className="text-xs text-gray-400 mt-2">3 hours ago</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">View all notifications →</button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center bg-blue-500/10 text-gray-700 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md min-w-[50px]"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{user?.firstName}</span>
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-gray-500">{user?.role} • {user?.id}</div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        {t('nav.profile') || 'Profile'}
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('nav.logout') || 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab Content */}
          {activeTab === 'flights' && (
            <div className="p-6">
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
            <div className="p-6">
              <OperatorFlightBookings user={user} />
            </div>
          )}
        </div>
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

  const statusBadge = getStatusBadge(flight, isPast);

  // Parse dates - use correct field names from API
  const departureDate = new Date(flight.departure_time || flight.departureDateTime);
  const arrivalDate = flight.arrival_time ? new Date(flight.arrival_time) : (flight.arrivalDateTime ? new Date(flight.arrivalDateTime) : null);
  
  // Format dates and times
  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  };

  const departure = formatDateTime(departureDate);
  const arrival = arrivalDate ? formatDateTime(arrivalDate) : null;

  // Calculate duration
  const getDuration = () => {
    if (flight.estimated_duration_minutes) {
      const hours = Math.floor(flight.estimated_duration_minutes / 60);
      const minutes = flight.estimated_duration_minutes % 60;
      return `${hours}h ${minutes}m`;
    }
    
    if (flight.schedule?.duration) {
      return flight.schedule.duration;
    }
    
    if (flight.duration) {
      return flight.duration;
    }
    
    if (arrivalDate) {
      const durationMs = arrivalDate - departureDate;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    
    return '-';
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return t('dashboard.operator.flightCard.pricing.notSet');
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const currentPrice = flight.pricing?.currentPrice || flight.empty_leg_price || flight.seat_leg_price || flight.price;
  const originalPrice = flight.pricing?.originalPrice || flight.market_price || flight.seat_market_price;

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${cardOpacity}`}>
      <div className="p-6">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {flight.origin_code || 'Unknown'} → {flight.destination_code || 'Unknown'}
              </h3>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.style}`}>
            {statusBadge.text}
          </span>
        </div>

        {/* Flight Route Details */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">
            {flight.origin_name || 'Unknown Airport'} → {flight.destination_name || 'Unknown Airport'}
          </div>
          {flight.origin_city && flight.destination_city && (
            <div className="text-xs text-gray-500">
              {flight.origin_city}, {flight.origin_country} → {flight.destination_city}, {flight.destination_country}
            </div>
          )}
        </div>

        {/* Flight Times */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">{t('dashboard.operator.flightCard.departure')}</div>
            <div className="font-semibold text-gray-900">{departure.time}</div>
            <div className="text-xs text-gray-600">{departure.date}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">{t('dashboard.operator.flightCard.duration')}</div>
            <div className="font-semibold text-blue-600 flex items-center justify-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {getDuration()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">{t('dashboard.operator.flightCard.arrival')}</div>
            <div className="font-semibold text-gray-900">{arrival ? arrival.time : '-'}</div>
            <div className="text-xs text-gray-600">{arrival ? arrival.date : '-'}</div>
          </div>
        </div>

        {/* Flight Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600">{t('dashboard.operator.flightCard.capacity')}: </span>
            <span className="font-medium ml-1">{flight.max_passengers || 0}</span>
          </div>
          <div className="flex items-center">
            <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600">{t('dashboard.operator.flightCard.price')}: </span>
            <span className="font-medium ml-1 text-green-600">{formatPrice(currentPrice)}</span>
          </div>
          {flight.aircraft_name && (
            <div className="flex items-center col-span-2">
              <PaperAirplaneIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{t('dashboard.operator.flightCard.aircraft')}: </span>
              <span className="font-medium ml-1">{flight.aircraft_name}</span>
            </div>
          )}
        </div>

        {/* Pricing Details */}
        {originalPrice && originalPrice !== currentPrice && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">{t('dashboard.operator.flightCard.pricing.discounted')}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                <span className="text-sm font-semibold text-green-600">{formatPrice(currentPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => navigate(`/flight/${flight.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
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
                onClick={() => onDelete && onDelete(flight.id, `${flight.origin_code || 'Unknown'} → ${flight.destination_code || 'Unknown'}`)}
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

export default function SafeOperatorDashboard({ user }) {
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as an operator to view this page.</p>
        </div>
      </div>
    );
  }

  return <ActualOperatorDashboard user={user} />;
}