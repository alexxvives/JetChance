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
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center flex-shrink-0">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black p-2 rounded-lg mr-3 shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent drop-shadow-lg">
                ChanceFly
              </span>
            </div>
          </Link>

          {/* Main Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
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
                // Authenticated Navigation - Dashboard is default, Profile accessible via icon
                <></>
              )}
            </div>
          </div>
            
          {/* User Actions & Settings - Right */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
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
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-white/90 hover:text-amber-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {t('auth.login.signUp')}
                </Link>
                <LanguageSelector />
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/90 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-amber-300/20 backdrop-blur-md">
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
                  // Authenticated Navigation - Dashboard is default, Profile accessible via icon
                  <></>
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
                    {/* Language Settings for Authenticated Users */}
                    <div className="border-b border-amber-300/20 pb-3 mb-3">
                      <div className="text-sm text-white/60 mb-3 px-4 font-medium uppercase tracking-wide">Settings</div>
                      <div className="px-4 py-2">
                        <LanguageSelector />
                      </div>
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
                    {/* Language Settings for Non-authenticated Users */}
                    <div className="border-b border-amber-300/20 pb-3 mb-3">
                      <div className="text-sm text-white/60 mb-3 px-4 font-medium uppercase tracking-wide">Settings</div>
                      <div className="px-4 py-2">
                        <LanguageSelector />
                      </div>
                    </div>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-white/80 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                    >
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block mx-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-xl font-semibold text-center hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg"
                    >
                      {t('auth.login.signUp')}
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
