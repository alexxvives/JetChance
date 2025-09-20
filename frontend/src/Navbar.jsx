import React from 'react';

export default function Navbar({ onNavigate, isLanding = false, user = null, onLogout = null }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">C</span>
        </div>
        <span className="font-bold text-xl text-gray-900">ChanceFly</span>
      </div>
      
      <div className="flex gap-4">
        {isLanding ? (
          <>
            <button 
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Join Now
            </button>
          </>
        ) : user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user.name}</span>
            <button 
              onClick={() => { onLogout(); onNavigate('landing'); }}
              className="px-4 py-2 text-gray-700 font-medium hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Join Now
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
