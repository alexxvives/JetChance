import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

const CustomCalendar = ({ 
  value, 
  onChange, 
  minDate, 
  maxDate, 
  placeholder = "Select date", 
  theme = "default" // "departure", "arrival", "default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(() => {
    const date = value ? new Date(value) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (date) {
      onChange(date.toISOString().split('T')[0]);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction) => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isDateDisabled = (date) => {
    if (!date) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    
    return false;
  };

  const isDateSelected = (date) => {
    if (!date || !value) return false;
    return date.toISOString().split('T')[0] === value;
  };

  const isDateToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Theme colors - using web's blue/purple palette
  const getThemeColors = () => {
    switch (theme) {
      case 'departure':
        return {
          primary: 'text-blue-600',
          primaryBg: 'bg-blue-500',
          primaryHover: 'hover:bg-blue-600',
          primaryLight: 'bg-blue-50',
          primaryBorder: 'border-blue-200',
          focusRing: 'ring-blue-500',
          accent: 'text-blue-700',
        };
      case 'arrival':
        return {
          primary: 'text-purple-600',
          primaryBg: 'bg-purple-500',
          primaryHover: 'hover:bg-purple-600',
          primaryLight: 'bg-purple-50',
          primaryBorder: 'border-purple-200',
          focusRing: 'ring-purple-500',
          accent: 'text-purple-700',
        };
      default:
        return {
          primary: 'text-blue-600',
          primaryBg: 'bg-blue-500',
          primaryHover: 'hover:bg-blue-600',
          primaryLight: 'bg-blue-50',
          primaryBorder: 'border-blue-200',
          focusRing: 'ring-blue-500',
          accent: 'text-blue-700',
        };
    }
  };

  const colors = getThemeColors();
  const days = getDaysInMonth(displayDate);

  return (
    <div className="relative" ref={calendarRef}>
      {/* Input Field */}
      <div
        ref={inputRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-xl cursor-pointer
          transition-all duration-200 hover:border-gray-400
          focus-within:ring-2 ${colors.focusRing} focus-within:border-transparent
          bg-white text-lg flex items-center justify-between
        `}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarIcon className={`h-5 w-5 ${colors.primary}`} />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 ${colors.primaryLight} border-b border-gray-200`}>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className={`p-2 rounded-lg ${colors.primary} hover:bg-white hover:bg-opacity-50 transition-colors`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              
              <h2 className={`text-lg font-semibold ${colors.accent}`}>
                {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className={`p-2 rounded-lg ${colors.primary} hover:bg-white hover:bg-opacity-50 transition-colors`}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 p-4 pb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 px-4 pb-4">
            {days.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date)}
                className={`
                  h-10 flex items-center justify-center text-sm rounded-lg transition-all duration-150
                  ${!date ? 'invisible' : ''}
                  ${isDateDisabled(date) 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'hover:bg-gray-100 cursor-pointer'
                  }
                  ${isDateSelected(date) 
                    ? `${colors.primaryBg} text-white ${colors.primaryHover} font-medium shadow-md` 
                    : 'text-gray-700'
                  }
                  ${isDateToday(date) && !isDateSelected(date)
                    ? `${colors.primaryBorder} border-2 ${colors.primary} font-medium`
                    : ''
                  }
                `}
              >
                {date && date.getDate()}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                if (!isDateDisabled(new Date(today))) {
                  onChange(today);
                  setIsOpen(false);
                }
              }}
              className={`
                w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
                ${colors.primaryLight} ${colors.primary} hover:bg-opacity-75
                border ${colors.primaryBorder}
              `}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;