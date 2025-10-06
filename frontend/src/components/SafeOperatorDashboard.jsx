import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import OperatorFlightBookings from './OperatorFlightBookings';
import ConfirmationModal from './ConfirmationModal';
import NotificationsAPI from '../api/notificationsAPI';
import { flightsAPI } from '../api/flightsAPI';
import Profile from './Profile';
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
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState('flights');
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, flightId: null, flightRoute: '' });
  const [isUpcomingFlightsCollapsed, setIsUpcomingFlightsCollapsed] = useState(false);
  const [isPastFlightsCollapsed, setIsPastFlightsCollapsed] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
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
    { id: 'bookings', name: t('dashboard.operator.tabs.bookings'), icon: UserGroupIcon },
    { id: 'profile', name: t('nav.profile') || 'Profile', icon: User }
  ];

  useEffect(() => {
    loadFlights();
    loadNotifications(); // Load notifications when component mounts
  }, [user]);

  // Set up periodic notification refresh
  useEffect(() => {
    if (!user || !user.id) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
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

  const loadNotifications = async () => {
    if (!user || !user.id) {
      console.log('❌ No user available for loading notifications');
      return;
    }

    try {
      setNotificationsLoading(true);
      console.log('🔄 Loading notifications for operator:', user.id);
      
      const notificationsData = await NotificationsAPI.getNotifications();
      console.log('✅ Loaded notifications:', notificationsData);
      
      setNotifications(notificationsData || []);
      
      // Count unread notifications (using read_at field - null means unread)
      const unread = notificationsData.filter(notification => !notification.read_at);
      setUnreadCount(unread.length);
      
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      console.log('📬 Marking all notifications as read...');
      await NotificationsAPI.markAllAsRead();
      console.log('✅ Successfully marked all notifications as read');
      // Refresh notifications to update the UI
      await loadNotifications();
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  const handleNotificationDropdownToggle = async () => {
    const willBeOpen = !isNotificationDropdownOpen;
    setIsNotificationDropdownOpen(willBeOpen);
    
    // If opening the dropdown and there are unread notifications, mark them all as read
    if (willBeOpen && unreadCount > 0) {
      await markAllNotificationsAsRead();
    }
  };

  const handleDeleteFlight = (flightId, flightRoute) => {
    setDeleteModal({ isOpen: true, flightId, flightRoute });
  };

  const confirmDeleteFlight = async () => {
    try {
      await flightsAPI.deleteFlight(deleteModal.flightId);
      await loadFlights();
      setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' });
    } catch (error) {
      console.error('Failed to delete flight:', error);
      alert(`Failed to delete flight: ${error.message}`);
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
        <div className="p-4">
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
                  {t('dashboard.operator.welcome')} {user?.companyName?.toUpperCase() || user?.company_name?.toUpperCase() || (user?.firstName + ' ' + user?.lastName)?.toUpperCase()}
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
                  <span className="text-sm font-medium">{currentLanguage === 'es' ? 'ES' : 'EN'}</span>
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Language Dropdown */}
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          changeLanguage('en');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🇺🇸 English
                      </button>
                      <button
                        onClick={() => {
                          changeLanguage('es');
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
                  onClick={handleNotificationDropdownToggle}
                  className="relative flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <BellIcon className="h-5 w-5" />
                  {/* Show notification badge if there are unread notifications */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-[440px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">{t('notifications.title')}</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="px-6 py-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-500 text-sm">{t('notifications.loading')}</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BellIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">{t('notifications.noNotifications')}</p>
                          <p className="text-gray-400 text-xs mt-1">{t('notifications.noNotificationsDescription')}</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                              notification.read_at 
                                ? 'border-l-gray-200 bg-white' 
                                : 'border-l-blue-400 bg-blue-50/30'
                            }`}
                            onClick={async () => {
                              // Mark as read when clicked
                              console.log('🔔 Notification clicked:', notification.id, 'read_at:', notification.read_at);
                              if (!notification.read_at) {
                                try {
                                  console.log('📤 Calling markAsRead API...');
                                  await NotificationsAPI.markAsRead(notification.id);
                                  console.log('✅ Mark as read successful, refreshing...');
                                  // Refresh notifications to update the UI
                                  await loadNotifications();
                                } catch (error) {
                                  console.error('❌ Error marking notification as read:', error);
                                }
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                                notification.type === 'flight_submitted' ? 'bg-blue-100' :
                                notification.type === 'flight_approved' ? 'bg-green-100' :
                                notification.type === 'flight_rejected' ? 'bg-red-100' :
                                'bg-gray-100'
                              }`}>
                                {notification.type === 'flight_submitted' ? (
                                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                                ) : notification.type === 'flight_approved' ? (
                                  <DocumentTextIcon className="h-4 w-4 text-green-600" />
                                ) : notification.type === 'flight_rejected' ? (
                                  <DocumentTextIcon className="h-4 w-4 text-red-600" />
                                ) : (
                                  <BellIcon className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </div>
                                <div className="text-xs text-gray-400 mt-2 flex items-center">
                                  <span>
                                    {new Date(notification.created_at).toLocaleDateString()} {' '}
                                    {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                  {!notification.read_at && (
                                    <span className="ml-2 w-2 h-2 bg-blue-400 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      {notifications.length > 0 ? (
                        <button 
                          onClick={() => {
                            // Refresh notifications
                            loadNotifications();
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          {t('notifications.refresh')}
                        </button>
                      ) : (
                        <button className="text-sm text-gray-400 font-medium cursor-not-allowed">
                          {t('notifications.noNotificationsToView')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center bg-blue-500/10 text-gray-700 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md min-w-[50px] h-10"
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
                          setActiveTab('profile');
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

          {activeTab === 'profile' && (
            <Profile />
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
        noteText="This action is permanent and cannot be undone."
      />
    </div>
  );
}

// Flight Card Component - Modern Design
function FlightCard({ flight, navigate, isPast = false, onDelete }) {
  const { t, currentLanguage } = useTranslation();
  
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

  // Parse departure date
  const departureDate = new Date(flight.departure_time || flight.departureDateTime);
  
  // Format date exactly like in FlightDetailsPage
  const formatFullDate = (date) => {
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
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 ${cardOpacity}`}>
      <div className="p-6">
        {/* Aircraft Header - exact copy from FlightDetailsPage */}
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
                  {flight.aircraft_model || flight.aircraft_name || 'Private Jet'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFullDate(departureDate)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.style}`}>
                {statusBadge.text}
              </span>
            </div>
          </div>
        </div>

        {/* Route Section - exact copy from FlightDetailsPage */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {flight.originCode || flight.origin_code || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                ORIGIN
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
                DESTINATION
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/flight/${flight.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <span>{t('dashboard.operator.actions.viewDetails')}</span>
          </button>
          
          {!isPast && (
            <>
              {/* Edit button only shows for pending flights */}
              {flight.status === 'pending' && (
                <button
                  onClick={() => navigate(`/edit-flight/${flight.id}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  title={t('auth.operator.actions.editFlight')}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              {/* Delete button - same size whether edit is visible or not */}
              <button
                onClick={() => onDelete && onDelete(flight.id, `${flight.origin_code || 'Unknown'} → ${flight.destination_code || 'Unknown'}`)}
                className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                title={t('auth.operator.actions.deleteFlight')}
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
  const { t } = useTranslation();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('auth.operator.accessDenied.title')}</h2>
          <p className="text-gray-600">{t('auth.operator.accessDenied.message')}</p>
        </div>
      </div>
    );
  }

  return <ActualOperatorDashboard user={user} />;
}