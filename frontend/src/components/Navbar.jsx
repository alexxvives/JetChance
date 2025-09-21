import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';

export default function Navbar({ useSimpleBackground, setUseSimpleBackground }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActivePage = (path) => location.pathname === path;

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-violet-400/20 shadow-2xl relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center flex-shrink-0">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-2 rounded-lg mr-3 shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
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
                      isActivePage('/') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/operators"
                    className={`${
                      isActivePage('/operators') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.operators')}
                  </Link>
                  <Link
                    to="/about"
                    className={`${
                      isActivePage('/about') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.about')}
                  </Link>
                  <Link
                    to="/contact"
                    className={`${
                      isActivePage('/contact') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.contact')}
                  </Link>
                </>
              ) : (
                // Authenticated Navigation
                <>
                  <Link
                    to="/dashboard"
                    className={`${
                      isActivePage('/dashboard') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/profile"
                    className={`${
                      isActivePage('/profile') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                    } transition-colors text-sm font-medium`}
                  >
                    {t('nav.profile')}
                  </Link>
                </>
              )}
            </div>
          </div>
            
          {/* User Actions & Settings - Right */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              // Authenticated User Actions
              <>
                <NotificationBell />
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-violet-300">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-white/60">{user?.role} • {user?.id}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-violet-500/20 backdrop-blur-sm text-white border border-violet-400/30 px-4 py-2 rounded-lg font-medium hover:bg-violet-500/30 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              // Guest User Actions
              <div className="flex items-center space-x-3">
                <LanguageSelector />
                <Link
                  to="/login"
                  className="text-white/90 hover:text-violet-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/90 hover:text-violet-300 p-2 rounded-lg hover:bg-violet-500/20 transition-colors"
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
          <div className="md:hidden border-t border-violet-300/20 backdrop-blur-md">
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
                        isActivePage('/') ? 'text-violet-300 bg-violet-500/10 font-semibold' : 'text-white/80 hover:text-violet-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.home')}
                    </Link>
                    <Link
                      to="/operators"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/operators') ? 'text-violet-300 bg-violet-500/10 font-semibold' : 'text-white/80 hover:text-violet-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.operators')}
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/about') ? 'text-violet-300 bg-violet-500/10 font-semibold' : 'text-white/80 hover:text-violet-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.about')}
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/contact') ? 'text-violet-300 bg-violet-500/10 font-semibold' : 'text-white/80 hover:text-violet-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.contact')}
                    </Link>
                  </>
                ) : (
                  // Authenticated Navigation
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/dashboard') ? 'text-violet-300 bg-violet-500/10 font-semibold' : 'text-white/80 hover:text-violet-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={`${
                        isActivePage('/profile') ? 'text-violet-300 bg-violet-500/10 font-semibold' : 'text-white/80 hover:text-violet-300 hover:bg-white/5'
                      } block px-4 py-3 rounded-lg transition-all duration-200`}
                    >
                      {t('nav.profile')}
                    </Link>
                  </>
                )}
              </div>
              
              {/* User Section */}
              <div className="border-t border-violet-300/20 pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2">
                      <div className="text-sm font-medium text-violet-300">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-white/60">{user?.role} • {user?.id}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all duration-200 font-medium"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Language Settings for Non-authenticated Users */}
                    <div className="border-b border-violet-300/20 pb-3 mb-3">
                      <div className="text-sm text-white/60 mb-3 px-4 font-medium uppercase tracking-wide">Settings</div>
                      <div className="px-4 py-2">
                        <LanguageSelector />
                      </div>
                    </div>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-white/80 hover:text-violet-300 hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                    >
                      {t('nav.signIn')}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block mx-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      Join Now
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