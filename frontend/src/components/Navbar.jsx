import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';
import { User, ChevronDown, LogOut } from 'lucide-react';

export default function Navbar({ useSimpleBackground, setUseSimpleBackground, isHomePage }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const isActivePage = (path) => location.pathname === path;

  return (
    <nav className={`${
      isHomePage 
        ? 'bg-slate-900/90 backdrop-blur-lg border-b border-amber-500/20' 
        : 'bg-slate-800/90 backdrop-blur-lg border-b border-amber-400/20'
    } shadow-2xl relative z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          
          {/* Mobile & Desktop: Logo (always on left) */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo/logo_white2.svg" 
                alt="JetChance" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop: Absolutely centered navigation */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-8">
              {!isAuthenticated ? (
                // Public Navigation
                <>
                  <Link
                    to="/"
                    className={`${
                      isActivePage('/') ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/operators"
                    className={`${
                      isActivePage('/operators') ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.operators')}
                  </Link>
                  <Link
                    to="/about"
                    className={`${
                      isActivePage('/about') ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.about')}
                  </Link>
                  <Link
                    to="/contact"
                    className={`${
                      isActivePage('/contact') ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.contact')}
                  </Link>
                </>
              ) : (
                // Authenticated Navigation - Show About Us and Contact Us in true center
                <>
                  <Link
                    to="/about"
                    className={`${
                      isActivePage('/about') ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.about')}
                  </Link>
                  <Link
                    to="/contact"
                    className={`${
                      isActivePage('/contact') ? 'text-amber-300 font-semibold' : 'text-white/90 hover:text-amber-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.contact')}
                  </Link>
                </>
              )}
            </div>
          </div>
            
          {/* Right side: Desktop Auth / Mobile Language + Hamburger */}
          <div className="flex items-center space-x-3">
            {/* Desktop authentication section */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                // Authenticated User Actions
                <>
                  <LanguageSelector />
                  <NotificationBell />
                  
                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center justify-center bg-amber-500/20 backdrop-blur-sm text-white border border-amber-400/30 px-3 py-2 rounded-lg hover:bg-amber-500/30 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[50px]"
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
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="h-4 w-4 mr-3" />
                            {t('nav.profile')}
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            {t('nav.logout')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Guest User Actions  
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <LanguageSelector />
                </>
              )}
            </div>

            {/* Mobile: Language selector + Hamburger */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSelector />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white relative w-10 h-10 flex items-center justify-center"
              >
                <span className="sr-only">Open main menu</span>
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  {/* Hamburger to X animation */}
                  <span className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : 'rotate-0 translate-y-0'
                  }`}></span>
                  <span className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isMenuOpen ? '-rotate-45 -translate-y-2' : 'rotate-0 translate-y-0'
                  }`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Overlay style */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-amber-300/20 shadow-2xl z-40">
            <div className="px-4 py-4 space-y-1">
              {/* Navigation Links */}
              <div className="space-y-1">
                {!isAuthenticated ? (
                  // Public Navigation
                  <>
                    <Link
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/') ? 'text-amber-300 bg-amber-500/10 font-semibold' : 'text-white/80 hover:text-amber-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.home')}
                    </Link>
                    <Link
                      to="/operators"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/operators') ? 'text-amber-300 bg-amber-500/10 font-semibold' : 'text-white/80 hover:text-amber-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.operators')}
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/about') ? 'text-amber-300 bg-amber-500/10 font-semibold' : 'text-white/80 hover:text-amber-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.about')}
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/contact') ? 'text-amber-300 bg-amber-500/10 font-semibold' : 'text-white/80 hover:text-amber-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.contact')}
                    </Link>
                  </>
                ) : (
                  // Authenticated Navigation - Show About Us and Contact Us
                  <>
                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/about') ? 'text-amber-300 bg-amber-500/10 font-semibold' : 'text-white/80 hover:text-amber-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.about')}
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/contact') ? 'text-amber-300 bg-amber-500/10 font-semibold' : 'text-white/80 hover:text-amber-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.contact')}
                    </Link>
                  </>
                )}
              </div>
              
              {/* User Section */}
              <div className="border-t border-amber-300/20 pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2">
                      <div className="text-sm font-medium text-amber-300">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-white/60">{user?.role} • {user?.id}</div>
                    </div>
                    {/* Profile Icon Button */}
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-white/80 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                    >
                      <User size={18} className="mr-3" />
                      {t('nav.profile')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all duration-200 font-medium"
                    >
                      <LogOut size={18} className="mr-3" />
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Highlighted Sign In Button */}
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block mx-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-xl font-semibold text-center hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg"
                    >
                      {t('nav.signIn')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
