import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../contexts/TranslationContext';

const CustomDateTimePicker = ({ 
  value, 
  onChange, 
  minDate, 
  maxDate, 
  placeholder,
  theme = "default", // "departure", "arrival", "default"
  label,
  required = false
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('customCalendar.selectDateTime');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedDate, setSelectedDate] = useState(null);
  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [hasSelectedTime, setHasSelectedTime] = useState(false);
  const timeContainerRef = useRef(null);
  const [displayDate, setDisplayDate] = useState(() => {
    const date = value ? new Date(value) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  // Extract date and time from value
  useEffect(() => {
    if (value) {
      const dateTime = new Date(value);
      const hours = dateTime.getHours().toString().padStart(2, '0');
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
      setSelectedDate(dateTime);
      setHasSelectedDate(true);
      setHasSelectedTime(true);
    } else {
      // Reset selection states when value is cleared
      setHasSelectedDate(false);
      setHasSelectedTime(false);
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to 9 AM when dropdown opens and no time is selected
  useEffect(() => {
    if (isOpen && timeContainerRef.current && !selectedTime) {
      setTimeout(() => {
        const nineAMIndex = timeOptions.findIndex(time => time === '09:00');
        if (nineAMIndex !== -1) {
          const buttonHeight = 40; // Approximate height of each time button
          const scrollPosition = nineAMIndex * buttonHeight;
          timeContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100); // Small delay to ensure DOM is rendered
    }
  }, [isOpen]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const dateTime = new Date(dateTimeString);
    const date = dateTime.toLocaleDateString('es-ES');
    const time = dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${date} - ${time}`;
  };

  const getDisplayText = () => {
    if (value) {
      return formatDateTime(value);
    }
    if (hasSelectedDate && selectedDate) {
      const date = selectedDate.toLocaleDateString('es-ES');
      if (hasSelectedTime) {
        return `${date} - ${selectedTime}`;
      } else {
        return `${date} - Seleccionar hora`;
      }
    }
    return defaultPlaceholder;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isDateDisabled = (day) => {
    if (!day) return false;
    
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const currentDate = new Date(year, month, day);
    
    if (minDate && currentDate < new Date(minDate)) return true;
    if (maxDate && currentDate > new Date(maxDate)) return true;
    
    return false;
  };

  const handleDateClick = (day) => {
    if (!day || isDateDisabled(day)) return;
    
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const selectedDateObj = new Date(year, month, day);
    
    setSelectedDate(selectedDateObj);
    setHasSelectedDate(true);
    
    // Only submit if both date and time have been selected
    if (hasSelectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      selectedDateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange(selectedDateObj.toISOString());
      setIsOpen(false);
    }
    // Keep picker open if time hasn't been selected yet
  };

  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    setHasSelectedTime(true);
    
    // Only submit if both date and time have been selected
    if (selectedDate && hasSelectedDate) {
      const [hours, minutes] = newTime.split(':');
      const finalDate = new Date(selectedDate);
      finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange(finalDate.toISOString());
      setIsOpen(false);
    }
    // Keep picker open if date hasn't been selected yet
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(displayDate.getMonth() + direction);
    setDisplayDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

  const themeClasses = {
    input: "border-gray-200 focus:ring-blue-500 focus:border-blue-500",
    calendar: "border-gray-200", 
    selected: "bg-blue-600 text-white"
  };

  return (
    <div className="relative" ref={calendarRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Field */}
      <div
        ref={inputRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-500 cursor-pointer transition-all duration-200 flex items-center justify-between ${themeClasses.input} ${isOpen ? 'ring-2' : 'hover:border-gray-300'}`}
      >
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <span className={value ? "text-gray-900" : (hasSelectedDate ? "text-blue-600" : "text-gray-500")}>
            {getDisplayText()}
          </span>
        </div>
      </div>

      {/* Calendar and Time Picker Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 mt-2 bg-white rounded-xl shadow-lg border ${themeClasses.calendar} p-4 w-80`}>
          {/* Selection Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Selecciona fecha y hora:</div>
            <div className="flex items-center space-x-4 text-xs">
              <div className={`flex items-center space-x-1 ${hasSelectedDate ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${hasSelectedDate ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Fecha {hasSelectedDate ? '✓' : ''}</span>
              </div>
              <div className={`flex items-center space-x-1 ${hasSelectedTime ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${hasSelectedTime ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Hora {hasSelectedTime ? '✓' : ''}</span>
              </div>
            </div>
          </div>
          
          {/* Calendar Section */}
          <div className="mb-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-medium text-gray-900">
                {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(displayDate).map((day, index) => {
                const isSelected = (value && day && 
                  new Date(value).getDate() === day &&
                  new Date(value).getMonth() === displayDate.getMonth() &&
                  new Date(value).getFullYear() === displayDate.getFullYear()) ||
                  (selectedDate && day &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === displayDate.getMonth() &&
                  selectedDate.getFullYear() === displayDate.getFullYear());
                
                const isDisabled = isDateDisabled(day);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={!day || isDisabled}
                    className={`
                      h-8 w-8 text-sm rounded-lg transition-colors
                      ${!day ? 'invisible' : ''}
                      ${isSelected ? themeClasses.selected : 'text-gray-900 hover:bg-gray-100'}
                      ${isDisabled ? 'text-gray-300 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Seleccionar Hora</span>
            </div>
            
            <div ref={timeContainerRef} className="max-h-32 overflow-y-auto border rounded-lg">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeChange(time)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    selectedTime === time ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateTimePicker;