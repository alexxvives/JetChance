import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import FlightFilters from './FlightFilters';
import FlightList from '../FlightList';
import CustomerBookings from './CustomerBookings';
import RegularJetRequestModal from './RegularJetRequestModal';
import { 
  Plane, 
  BookOpen, 
  User, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

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

  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

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
    { id: 'bookings', name: t('dashboard.customer.tabs.myBookings') || 'My Bookings', icon: BookOpen }
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
                          navigate('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t('dashboard.profile') || 'Profile'}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('dashboard.logout') || 'Logout'}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {t('dashboard.customer.emptyLegFlights.title') || 'Available Empty Leg Flights'}
                      </h2>
                      <p className="text-gray-600 text-sm">{t('dashboard.customer.emptyLegFlights.description') || 'Browse available empty leg flights at discounted prices'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-sm font-medium">{t('dashboard.customer.emptyLegFlights.savingsLabel') || 'Big Savings'}</span>
                    </div>
                  </div>
                </div>
                
                <FlightFilters filters={filters} setFilters={setFilters} />
                <FlightList filters={filters} />
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
