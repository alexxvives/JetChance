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
  const defaultPlaceholder = placeholder || t('customCalendar.selectDate');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('09:00');
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

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const dateTime = new Date(dateTimeString);
    const date = dateTime.toLocaleDateString('es-ES');
    const time = dateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${date} - ${time}`;
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
    const selectedDate = new Date(year, month, day);
    
    // Combine with selected time
    const [hours, minutes] = selectedTime.split(':');
    selectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Convert to ISO string for form submission
    const isoString = selectedDate.toISOString();
    onChange(isoString);
    setIsOpen(false);
  };

  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    
    // If we have a date selected, update the datetime
    if (value) {
      const currentDate = new Date(value);
      const [hours, minutes] = newTime.split(':');
      currentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange(currentDate.toISOString());
    }
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
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value ? formatDateTime(value) : defaultPlaceholder}
          </span>
        </div>
      </div>

      {/* Calendar and Time Picker Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 mt-2 bg-white rounded-xl shadow-lg border ${themeClasses.calendar} p-4 w-80`}>
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
                const isSelected = value && day && 
                  new Date(value).getDate() === day &&
                  new Date(value).getMonth() === displayDate.getMonth() &&
                  new Date(value).getFullYear() === displayDate.getFullYear();
                
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
            
            <div className="max-h-32 overflow-y-auto border rounded-lg">
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