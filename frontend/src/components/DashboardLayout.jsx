import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plane, 
  BookOpen, 
  User, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

/**
 * DashboardLayout - Shared layout component for customer pages
 * Provides consistent navigation and sidebar across customer dashboard and flight details
 */
export default function DashboardLayout({ children, activeTab = 'flights', user }) {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

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

  const handleTabClick = (tabId) => {
    if (tabId === 'flights' || tabId === 'bookings') {
      navigate('/dashboard', { state: { activeTab: tabId } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        {/* Sidebar Header with Logo */}
        <div className="p-4">
          <div className="flex items-center justify-center">
            <img 
              src="/images/logo/logo_black.svg" 
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
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-900 flex items-center">
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
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

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
