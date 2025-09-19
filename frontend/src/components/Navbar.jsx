import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ useSimpleBackground, setUseSimpleBackground }) {
  const { user, isAuthenticated, logout } = useAuth();
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
          {/* Logo */}
          <Link to="/" className="flex items-center">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${
                isActivePage('/') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
              } transition-colors text-sm font-medium`}
            >
              Home
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`${
                  isActivePage('/dashboard') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                } transition-colors text-sm font-medium`}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Performance Toggle */}
                <button
                  onClick={() => setUseSimpleBackground?.(!useSimpleBackground)}
                  className="p-2 rounded-lg text-white/70 hover:text-violet-300 hover:bg-violet-500/20 transition-colors backdrop-blur-sm"
                  title={useSimpleBackground ? "Switch to plasma background" : "Switch to simple background"}
                >
                  {useSimpleBackground ? "🎨" : "⚡"}
                </button>
                <div className="text-sm text-white/80">
                  Welcome, <span className="font-semibold text-violet-300">{user?.firstName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-violet-500/20 backdrop-blur-sm text-white border border-violet-400/30 px-4 py-2 rounded-lg font-medium hover:bg-violet-500/30 transition-colors shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Performance Toggle */}
                <button
                  onClick={() => setUseSimpleBackground?.(!useSimpleBackground)}
                  className="p-2 rounded-lg text-white/70 hover:text-violet-300 hover:bg-violet-500/20 transition-colors backdrop-blur-sm"
                  title={useSimpleBackground ? "Switch to plasma background" : "Switch to simple background"}
                >
                  {useSimpleBackground ? "🎨" : "⚡"}
                </button>
                <Link
                  to="/login"
                  className={`${
                    isActivePage('/login') ? 'text-violet-300 font-semibold' : 'text-white/90 hover:text-violet-300'
                  } transition-colors text-sm font-medium`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-violet-500/90 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-semibold hover:bg-violet-600 transition-colors shadow-xl border border-violet-400/30"
                >
                  Get Started
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
          <div className="md:hidden border-t border-violet-300/20 py-4 backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`${
                  isActivePage('/') ? 'text-violet-400 font-medium' : 'text-white/80'
                } block px-4 py-2 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm`}
              >
                Home
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`${
                    isActivePage('/dashboard') ? 'text-violet-400 font-medium' : 'text-white/80'
                  } block px-4 py-2 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm`}
                >
                  Dashboard
                </Link>
              )}

              {isAuthenticated ? (
                <div className="px-4 py-2 border-t border-violet-300/20 pt-4">
                  <div className="text-sm text-white/70 mb-3">
                    Signed in as <span className="font-medium text-violet-300">{user?.firstName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-white/80 hover:text-red-400 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={`${
                      isActivePage('/login') ? 'text-violet-400 font-medium' : 'text-white/80'
                    } block px-4 py-2 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium text-center hover:from-violet-500 hover:to-purple-500 transition-all duration-200 backdrop-blur-sm border border-violet-400/20 shadow-lg shadow-violet-500/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}