import React, { useState, useRef, useEffect } from 'react';
import { ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const CustomTimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select time",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate time options (every 30 minutes)
  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 48; i++) {
      const hour = Math.floor(i / 2);
      const minute = i % 2 === 0 ? '00' : '30';
      const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
      times.push(time24);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const formatDisplayTime = (time) => {
    if (!time) return '';
    return time; // Already in 24-hour format
  };

  const handleTimeSelect = (time) => {
    onChange(time);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-xl cursor-pointer
          transition-all duration-200 hover:border-gray-400
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
          bg-white text-lg flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? formatDisplayTime(value) : placeholder}
        </span>
        <div className="flex items-center space-x-1">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <ChevronDownIcon className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Time Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-64 overflow-hidden">
          <div className="py-2 max-h-64 overflow-y-auto">
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeSelect(time)}
                className={`
                  w-full px-4 py-2.5 text-left text-lg transition-colors hover:bg-gray-50
                  ${value === time 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{time}</span>
                  {value === time && (
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;