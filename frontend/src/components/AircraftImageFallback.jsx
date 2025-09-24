import React, { useState } from 'react';

export default function AircraftImageFallback({ aircraftType, className = "" }) {
  const [animationStyle, setAnimationStyle] = useState({ transform: 'translateX(-100px)' });

  React.useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimationStyle({ 
        transform: 'translateX(300px)',
        transition: 'transform 3s ease-in-out'
      });
    }, 100);

    // Loop the animation
    const interval = setInterval(() => {
      setAnimationStyle({ transform: 'translateX(-100px)', transition: 'none' });
      setTimeout(() => {
        setAnimationStyle({ 
          transform: 'translateX(300px)',
          transition: 'transform 3s ease-in-out'
        });
      }, 100);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`relative bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center overflow-hidden ${className}`}>
      {/* Animated plane */}
      <div className="relative w-full h-full">
        <div 
          className="absolute top-1/2 -translate-y-1/2"
          style={animationStyle}
        >
          <svg 
            className="w-12 h-12 text-blue-600" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
      </div>
      
      {/* Aircraft type overlay */}
      {aircraftType && (
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm">
            <p className="text-sm font-medium text-gray-700">{aircraftType}</p>
            <p className="text-xs text-gray-500">Loading image...</p>
          </div>
        </div>
      )}
      
      {/* Subtle cloud background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
          <ellipse cx="80" cy="50" rx="25" ry="12" fill="white" opacity="0.6">
            <animate attributeName="cx" values="80;120;80" dur="8s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="150" cy="40" rx="35" ry="18" fill="white" opacity="0.4">
            <animate attributeName="cx" values="150;180;150" dur="6s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="280" cy="60" rx="30" ry="15" fill="white" opacity="0.5">
            <animate attributeName="cx" values="280;320;280" dur="10s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="320" cy="120" rx="20" ry="10" fill="white" opacity="0.3">
            <animate attributeName="cx" values="320;360;320" dur="7s" repeatCount="indefinite"/>
          </ellipse>
        </svg>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-100/20 to-transparent pointer-events-none"></div>
    </div>
  );
}
