import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import CustomCalendar from './CustomCalendar';
import FlightList from '../FlightList';
import CustomerBookings from './CustomerBookings';
import RegularJetRequestModal from './RegularJetRequestModal';
import Profile from './Profile';
import { 
  Plane, 
  BookOpen, 
  User, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { GlobeAltIcon, UserIcon } from '@heroicons/react/24/outline';

export default function CustomerDashboard({ user }) {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('flights');
  const [showRegularJetModal, setShowRegularJetModal] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });
  const [availableCities, setAvailableCities] = useState({ origins: [], destinations: [] });
  const [maxAvailableSeats, setMaxAvailableSeats] = useState(12);
  const [allFlights, setAllFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  // Load available cities from flights
  const loadFlightsAndCities = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Customer loading flights and cities...');
      
      if (shouldUseRealAPI()) {
        const response = await flightsAPI.getFlights({ limit: 100, status: 'available' });
        const flights = response.flights || response || [];
        console.log(`📡 Customer loaded ${flights.length} flights`);
        setAllFlights(flights);
        
        // Extract unique cities from flight data
        const origins = new Set();
        const destinations = new Set();
        
        flights.forEach(flight => {
          const originCity = flight.origin_city || flight.origin_name || flight.origin;
          const destinationCity = flight.destination_city || flight.destination_name || flight.destination;
          
          if (originCity) {
            const cleanOrigin = originCity.includes('(') ? originCity.split('(')[0].trim() : originCity.trim();
            if (cleanOrigin) origins.add(cleanOrigin);
          }
          
          if (destinationCity) {
            const cleanDestination = destinationCity.includes('(') ? destinationCity.split('(')[0].trim() : destinationCity.trim();
            if (cleanDestination) destinations.add(cleanDestination);
          }
        });
        
        setAvailableCities({
          origins: Array.from(origins).sort(),
          destinations: Array.from(destinations).sort()
        });
        
        // Calculate max available seats
        const maxSeats = flights.reduce((max, flight) => {
          const totalSeats = flight.total_seats || 0;
          return Math.max(max, totalSeats);
        }, 12);
        setMaxAvailableSeats(maxSeats);
      }
    } catch (error) {
      console.error('❌ Error loading flights:', error);
      setAvailableCities({ origins: [], destinations: [] });
      setAllFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlightsAndCities();
  }, []);

  // Check if we should activate a specific tab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tabs = [
    { id: 'flights', name: t('dashboard.customer.tabs.emptyLegFlights') || 'Available Flights', icon: Plane },
    { id: 'bookings', name: t('dashboard.customer.tabs.myBookings') || 'My Bookings', icon: BookOpen },
    { id: 'profile', name: t('nav.profile') || 'Profile', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  {t('dashboard.customer.welcome')} {user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {t('dashboard.customer.role') || 'Customer'}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Right side navigation components */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button 
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 min-w-[50px] h-10"
                >
                  <GlobeAltIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{currentLanguage === 'es' ? 'ES' : 'EN'}</span>
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
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

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center bg-blue-500/10 text-gray-700 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md min-w-[50px] h-10"
                >
                  <User className="h-4 w-4 mr-1" />
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t('nav.profile') || 'Profile'}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('nav.logout') || 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'flights' && (
            <div>
              {/* Custom Flight Request Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-6 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {t('dashboard.customer.customFlight.title') || 'Need a Custom Flight?'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {t('dashboard.customer.customFlight.subtitle') || 'Request a personalized charter with flexible dates and custom service'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRegularJetModal(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t('dashboard.customer.customFlight.requestNow') || 'Request Now'}
                  </button>
                </div>
              </div>
              
              {/* Empty Leg Flights Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header with Title and Badge */}
                <div className="px-6 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {t('dashboard.customer.emptyLegFlights.title') || 'Available Empty Leg Flights'}
                      </h2>
                      <p className="text-gray-600 text-sm">{t('dashboard.customer.emptyLegFlights.description') || 'Browse available empty leg flights at discounted prices'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">{t('dashboard.customer.emptyLegFlights.savingsLabel') || 'Big Savings'}</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Filter Controls */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    {/* Main Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      {/* Origin Dropdown */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{t('dashboard.customer.filters.from')} ({availableCities.origins.length} {t('dashboard.customer.filters.cities')})</span>
                        </label>
                        <select
                          value={filters.origin}
                          onChange={(e) => setFilters({...filters, origin: e.target.value})}
                          className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                            backgroundPosition: 'right 0.75rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          <option value="">{t('dashboard.customer.filters.selectDepartureCity')}</option>
                          {availableCities.origins.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>

                      {/* Destination Dropdown */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{t('dashboard.customer.filters.to')} ({availableCities.destinations.length} {t('dashboard.customer.filters.cities')})</span>
                        </label>
                        <select
                          value={filters.destination}
                          onChange={(e) => setFilters({...filters, destination: e.target.value})}
                          className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                            backgroundPosition: 'right 0.75rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          <option value="">{t('dashboard.customer.filters.selectDestinationCity')}</option>
                          {availableCities.destinations.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>

                      {/* Custom Date Selector */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{t('dashboard.customer.filters.date')}</span>
                        </label>
                        <CustomCalendar
                          value={filters.date}
                          onChange={(date) => setFilters({...filters, date})}
                          minDate={new Date().toISOString().split('T')[0]}
                          placeholder={t('dashboard.customer.filters.selectDepartureDate')}
                          theme="departure"
                        />
                      </div>

                      {/* Passengers Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span>{t('dashboard.customer.filters.passengers')} ({t('dashboard.customer.filters.max')} {maxAvailableSeats})</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            min="1"
                            max={maxAvailableSeats}
                            value={filters.passengers}
                            onChange={(e) => {
                              const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxAvailableSeats);
                              setFilters({...filters, passengers: value});
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder={t('dashboard.customer.filters.numberOfPassengers')}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">
                              {filters.passengers === 1 ? t('dashboard.customer.filters.passenger') : t('dashboard.customer.filters.passengersPlural')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Left side - Clear + Active Filters */}
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setFilters({ origin: '', destination: '', date: '', passengers: 1 })}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{t('dashboard.customer.filters.clearAll')}</span>
                        </button>
                        
                        {/* Active Filter Tags */}
                        {(filters.origin || filters.destination || filters.date || filters.passengers > 1) && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">•</span>
                            <div className="flex flex-wrap gap-1">
                              {filters.origin && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {t('dashboard.customer.filters.activeFilters.from')}: {filters.origin}
                                </span>
                              )}
                              {filters.destination && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {t('dashboard.customer.filters.activeFilters.to')}: {filters.destination}
                                </span>
                              )}
                              {filters.date && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {new Date(filters.date).toLocaleDateString()}
                                </span>
                              )}
                              {filters.passengers > 1 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {filters.passengers} pax
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Flight List Section */}
                <div className="px-6 py-6">
                  <FlightList filters={filters} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.customer.myBookings.title') || 'My Bookings'}</h2>
                <p className="text-gray-600">{t('dashboard.customer.myBookings.subtitle') || 'Manage your flight reservations'}</p>
              </div>
              
              <CustomerBookings />
            </div>
          )}

          {activeTab === 'profile' && (
            <Profile />
          )}
        </div>
      </div>

      {/* Regular Jet Request Modal */}
      <RegularJetRequestModal
        isOpen={showRegularJetModal}
        onClose={() => setShowRegularJetModal(false)}
      />
    </div>
  );
}
