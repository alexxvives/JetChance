import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchAirports } from '../data/airportsAndCities';
import { useTranslation } from '../contexts/TranslationContext';

const AirportAutocomplete = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  className = '' 
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAirport, setCustomAirport] = useState({
    code: '',
    name: '',
    city: '',
    country: 'CO', // Default to Colombia
    latitude: '',
    longitude: ''
  });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update input value when external value changes
  useEffect(() => {
    if (value && value.code) {
      if (value.isCustom) {
        setInputValue(`${value.code} - ${value.name} (Custom)`);
      } else {
        setInputValue(`${value.code} - ${value.name}`);
      }
    } else if (typeof value === 'string') {
      setInputValue(value);
    } else {
      setInputValue('');
    }
  }, [value]);

  // Search function that looks for airports by city name OR airport code/name
  const searchFunction = (query, limit = 10) => {
    if (!query || query.length < 1) return [];
    
    const results = searchAirports(query, limit);
    
    // Also search by city name and show all airports in that city
    const cityResults = [];
    const lowercaseQuery = query.toLowerCase();
    
    // Get unique cities that match the query
    const matchingCities = new Set();
    searchAirports('', 1000).forEach(airport => {
      if (airport.city && airport.city.toLowerCase().includes(lowercaseQuery)) {
        matchingCities.add(airport.city);
      }
    });
    
    // For each matching city, add all its airports
    matchingCities.forEach(city => {
      const airportsInCity = searchAirports('', 1000).filter(airport => 
        airport.city === city && !results.some(r => r.code === airport.code)
      );
      cityResults.push(...airportsInCity);
    });
    
    // Combine and limit results
    const combined = [...results, ...cityResults];
    const unique = combined.filter((airport, index, self) => 
      index === self.findIndex(a => a.code === airport.code)
    );
    
    return unique.slice(0, limit);
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    
    if (query.length > 0) {
      const options = searchFunction(query);
      setFilteredOptions(options);
      setIsOpen(true);
    } else {
      setFilteredOptions([]);
      setIsOpen(false);
      if (onChange) {
        onChange(null);
      }
    }
  };

  const handleFocus = () => {
    if (inputValue.length > 0) {
      const options = searchFunction(inputValue);
      setFilteredOptions(options);
      setIsOpen(true);
    }
  };

  const handleOptionClick = (option) => {
    const displayValue = `${option.code} - ${option.name}`;
    setInputValue(displayValue);
    setIsOpen(false);
    
    if (onChange) {
      onChange(option);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredOptions([]);
    setIsOpen(false);
    setShowCustomForm(false);
    setCustomAirport({
      code: '',
      name: '',
      city: '',
      country: 'CO'
    });
    if (onChange) {
      onChange(null);
    }
    inputRef.current?.focus();
  };

  const handleShowCustomForm = () => {
    setIsOpen(false);
    setShowCustomForm(true);
  };

  const handleCustomAirportSubmit = () => {
    if (customAirport.code && customAirport.name && customAirport.city && 
        customAirport.latitude && customAirport.longitude) {
      const customAirportData = {
        ...customAirport,
        code: customAirport.code.toUpperCase(),
        latitude: parseFloat(customAirport.latitude),
        longitude: parseFloat(customAirport.longitude),
        isCustom: true
      };
      
      setInputValue(`${customAirportData.code} - ${customAirportData.name}`);
      resetCustomForm();
      
      if (onChange) {
        onChange(customAirportData);
      }
    }
  };

  const handleCustomInputChange = (field, value) => {
    setCustomAirport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetCustomForm = () => {
    setCustomAirport({
      code: '',
      name: '',
      city: '',
      country: 'CO',
      latitude: '',
      longitude: ''
    });
    setShowCustomForm(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderAirportOption = (airport, isSelected = false) => {
    if (isSelected) {
      return `${airport.code} - ${airport.name}${airport.isCustom ? ' (Custom)' : ''}`;
    }
    
    return (
      <div className="py-2">
        <div className="font-medium text-gray-900 flex items-center">
          {airport.code} - {airport.name}
          {airport.isCustom && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
              Custom
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {airport.city}, {airport.state ? `${airport.state}, ` : ''}{airport.country}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder={placeholder || t('airportAutocomplete.placeholder')}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          required={required}
          autoComplete="off"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100"
              onClick={() => handleOptionClick(option)}
            >
              {renderAirportOption(option)}
            </button>
          ))}
          
          {/* Custom airport option */}
          {inputValue.length > 0 && (
            <button
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-t-2 border-blue-200 bg-blue-25"
              onClick={handleShowCustomForm}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <div>
                  <div className="font-medium text-blue-700">{t('airportAutocomplete.notListed')}</div>
                  <div className="text-sm text-blue-600">{t('airportAutocomplete.addCustom')}</div>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Custom Airport Form */}
      {showCustomForm && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">{t('airportAutocomplete.addCustomAirport')}</h4>
              <button
                type="button"
                onClick={resetCustomForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">{t('airportAutocomplete.smallerAirportsNote')}</p>
          </div>

          <div className="space-y-3">
            {/* Airport Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('airportAutocomplete.airportCode')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('airportAutocomplete.placeholders.code')}
                value={customAirport.code}
                onChange={(e) => handleCustomInputChange('code', e.target.value.toUpperCase())}
                maxLength={4}
              />
            </div>

            {/* Airport Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('airportAutocomplete.airportName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('airportAutocomplete.placeholders.name')}
                value={customAirport.name}
                onChange={(e) => handleCustomInputChange('name', e.target.value)}
              />
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('airportAutocomplete.city')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('airportAutocomplete.placeholders.city')}
                  value={customAirport.city}
                  onChange={(e) => handleCustomInputChange('city', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('airportAutocomplete.country')} <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customAirport.country}
                  onChange={(e) => handleCustomInputChange('country', e.target.value)}
                >
                  <option value="CO">Colombia</option>
                  <option value="US">United States</option>
                  <option value="MX">Mexico</option>
                  <option value="PA">Panama</option>
                  <option value="CR">Costa Rica</option>
                  <option value="EC">Ecuador</option>
                  <option value="PE">Peru</option>
                  <option value="BR">Brazil</option>
                  <option value="AR">Argentina</option>
                  <option value="CL">Chile</option>
                  <option value="UY">Uruguay</option>
                  <option value="VE">Venezuela</option>
                </select>
              </div>
            </div>

            {/* Coordinates */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('airportAutocomplete.coordinates')} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">{t('airportAutocomplete.coordinatesNote')}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('airportAutocomplete.placeholders.latitude')}
                    value={customAirport.latitude}
                    onChange={(e) => handleCustomInputChange('latitude', e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('airportAutocomplete.latitude')}</p>
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('airportAutocomplete.placeholders.longitude')}
                    value={customAirport.longitude}
                    onChange={(e) => handleCustomInputChange('longitude', e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('airportAutocomplete.longitude')}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCustomAirportSubmit}
                disabled={!customAirport.code || !customAirport.name || !customAirport.city || !customAirport.latitude || !customAirport.longitude}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('airportAutocomplete.addAirport')}
              </button>
              <button
                type="button"
                onClick={resetCustomForm}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t('airportAutocomplete.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;