import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AirportService from '../services/AirportService';
import { useTranslation } from '../contexts/TranslationContext';

const AirportAutocomplete = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  className = '',
  disabledAirport = null // Airport code to disable in the dropdown
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAirport, setCustomAirport] = useState({
    code: '',
    name: '',
    country: '', // No default selection
    city: ''
  });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cities by country for dropdown (sorted alphabetically)
  const citiesByCountry = {
    'AR': [
      'Buenos Aires', 'Corrientes', 'Córdoba', 'La Plata', 'Mar del Plata',
      'Mendoza', 'Neuquén', 'Resistencia', 'Rosario', 'Salta', 'San Juan', 'Santa Fe'
    ],
    'BR': [
      'Belém', 'Belo Horizonte', 'Brasília', 'Curitiba', 'Fortaleza', 'Goiânia',
      'Manaus', 'Porto Alegre', 'Recife', 'Rio de Janeiro', 'Salvador', 'São Paulo'
    ],
    'CL': [
      'Antofagasta', 'Arica', 'Calama', 'Chillán', 'Concepción', 'Copiapó',
      'La Serena', 'Rancagua', 'Santiago', 'Talca', 'Temuco', 'Valparaíso'
    ],
    'CO': [
      'Barranquilla', 'Bogotá', 'Bucaramanga', 'Cali', 'Cartagena', 'Cúcuta',
      'Ibagué', 'Manizales', 'Medellín', 'Montería', 'Neiva', 'Pasto',
      'Pereira', 'Santa Marta', 'Soacha', 'Soledad', 'Valledupar', 'Villavicencio'
    ],
    'CR': [
      'Cartago', 'Liberia', 'Puntarenas', 'San José'
    ],
    'EC': [
      'Ambato', 'Cuenca', 'Esmeraldas', 'Guayaquil', 'Ibarra', 'Loja',
      'Machala', 'Manta', 'Portoviejo', 'Quito', 'Riobamba', 'Santo Domingo'
    ],
    'MX': [
      'Acapulco', 'Cancún', 'Guadalajara', 'Los Cabos', 'Mazatlán', 'Mérida',
      'Mexico City', 'Monterrey', 'Playa del Carmen', 'Puebla', 'Puerto Vallarta', 'Tijuana'
    ],
    'PA': [
      'Colón', 'David', 'Panama City', 'Santiago'
    ],
    'PE': [
      'Arequipa', 'Chiclayo', 'Chimbote', 'Cusco', 'Huancayo', 'Ica',
      'Iquitos', 'Lima', 'Piura', 'Pucallpa', 'Tacna', 'Trujillo'
    ],
    'US': [
      'Atlanta', 'Boston', 'Charlotte', 'Chicago', 'Dallas', 'Denver',
      'Houston', 'Las Vegas', 'Los Angeles', 'Miami', 'New York', 'Philadelphia',
      'Phoenix', 'Portland', 'San Antonio', 'San Diego', 'San Francisco', 'Seattle'
    ],
    'UY': [
      'Canelones', 'Maldonado', 'Montevideo', 'Punta del Este', 'Salto'
    ],
    'VE': [
      'Barquisimeto', 'Caracas', 'Ciudad Guayana', 'Maracaibo', 'Maracay',
      'Maturín', 'Puerto La Cruz', 'San Cristóbal', 'Valencia'
    ]
  };

  // Country name mapping for better search experience
  const countryNames = {
    'AR': 'Argentina',
    'BR': 'Brazil',
    'CL': 'Chile',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'EC': 'Ecuador',
    'MX': 'Mexico',
    'PA': 'Panama',
    'PE': 'Peru',
    'US': 'United States',
    'UY': 'Uruguay',
    'VE': 'Venezuela'
  };

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

  // Search function that looks for airports by city name OR airport code/name OR country name
  const searchFunction = async (query, limit = 10) => {
    if (!query || query.length < 1) return [];
    
    try {
      // First, try direct database search (covers code, name, city, and country code)
      let results = await AirportService.searchAirports(query);
      
      // If searching by country name (e.g., "Colombia", "United States"), 
      // also search by country code
      const queryLower = query.toLowerCase();
      const countryCodeMatch = Object.entries(countryNames).find(
        ([code, name]) => name.toLowerCase().includes(queryLower)
      );
      
      if (countryCodeMatch && results.length < limit) {
        const [countryCode] = countryCodeMatch;
        const countryResults = await AirportService.searchAirports(countryCode);
        
        // Merge results, avoiding duplicates
        const existingCodes = new Set(results.map(r => r.code));
        const newResults = countryResults.filter(r => !existingCodes.has(r.code));
        results = [...results, ...newResults];
      }
      
      // Limit results and return
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching airports:', error);
      return [];
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    
    if (query.length > 0) {
      searchFunction(query).then(options => {
        setFilteredOptions(options);
        setIsOpen(true);
      }).catch(error => {
        console.error('Search error:', error);
        setFilteredOptions([]);
      });
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
      searchFunction(inputValue).then(options => {
        setFilteredOptions(options);
        setIsOpen(true);
      }).catch(error => {
        console.error('Search error:', error);
        setFilteredOptions([]);
      });
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
    // Validate required fields
    if (!customAirport.code || !customAirport.name || !customAirport.city || !customAirport.country) {
      alert(t('airportAutocomplete.validation.required'));
      return;
    }

    // Create a temporary custom airport object (will be saved when flight is submitted)
    const tempCustomAirport = {
      code: customAirport.code.toUpperCase(),
      name: customAirport.name,
      city: customAirport.city,
      country: customAirport.country,
      isCustom: true,
      isPending: true // Flag to indicate this needs to be saved to database
    };

    // Set the temporary custom airport as selected
    setInputValue(`${tempCustomAirport.code} - ${tempCustomAirport.name} (Custom - Pending)`);
    setShowCustomForm(false);
    setCustomAirport({ code: '', name: '', country: '', city: '' });
    
    if (onChange) {
      onChange(tempCustomAirport);
    }
  };

  const handleCustomInputChange = (field, value) => {
    setCustomAirport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCityChange = (value) => {
    if (value === '_custom') {
      // Switch to manual input mode
      setCustomAirport(prev => ({
        ...prev,
        city: '',
        _manualCity: true
      }));
    } else {
      setCustomAirport(prev => ({
        ...prev,
        city: value,
        _manualCity: false
      }));
    }
  };

  const resetCustomForm = () => {
    setCustomAirport({
      code: '',
      name: '',
      country: '', // No default selection
      city: '',
      _manualCity: false
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
    
    // Get full country name or fallback to country code
    const countryDisplay = countryNames[airport.country] || airport.country;
    
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
          {airport.city}, {airport.state ? `${airport.state}, ` : ''}{countryDisplay}
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
          {filteredOptions.map((option) => {
            const isDisabled = disabledAirport && option.code === disabledAirport;
            return (
              <button
                key={option.code}
                type="button"
                className={`w-full px-4 py-2 text-left border-b border-gray-100 ${
                  isDisabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                    : 'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none'
                }`}
                onClick={() => !isDisabled && handleOptionClick(option)}
                disabled={isDisabled}
              >
                {renderAirportOption(option)}
                {isDisabled && (
                  <span className="text-xs text-gray-500 ml-2">(Already selected)</span>
                )}
              </button>
            );
          })}
          
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
              <p className="text-xs text-gray-500 mt-1">
                {t('airportAutocomplete.airportCodeHelp')}
              </p>
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
            <div className="space-y-3">
              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('airportAutocomplete.country')} <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customAirport.country}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    setCustomAirport(prev => ({
                      ...prev,
                      country: newCountry,
                      city: '', // Reset city when country changes
                      _manualCity: false // Reset manual city flag to show dropdown
                    }));
                  }}
                >
                  <option value="">Select country...</option>
                  <option value="AR">Argentina</option>
                  <option value="BR">Brazil</option>
                  <option value="CL">Chile</option>
                  <option value="CO">Colombia</option>
                  <option value="CR">Costa Rica</option>
                  <option value="EC">Ecuador</option>
                  <option value="MX">Mexico</option>
                  <option value="PA">Panama</option>
                  <option value="PE">Peru</option>
                  <option value="US">United States</option>
                  <option value="UY">Uruguay</option>
                  <option value="VE">Venezuela</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('airportAutocomplete.city')} <span className="text-red-500">*</span>
                </label>
                {customAirport.country && citiesByCountry[customAirport.country] && !customAirport._manualCity ? (
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customAirport.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                  >
                    <option value="">Select city...</option>
                    {citiesByCountry[customAirport.country].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                    <option value="_custom">Other (type manually)</option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('airportAutocomplete.placeholders.city')}
                      value={customAirport.city}
                      onChange={(e) => handleCustomInputChange('city', e.target.value)}
                    />
                    {customAirport.country && citiesByCountry[customAirport.country] && (
                      <button
                        type="button"
                        onClick={() => setCustomAirport(prev => ({ ...prev, _manualCity: false, city: '' }))}
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        ← Back to city dropdown
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCustomAirportSubmit}
                disabled={!customAirport.code || !customAirport.name || !customAirport.city}
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