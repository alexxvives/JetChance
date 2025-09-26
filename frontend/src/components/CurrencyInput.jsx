import React, { useState, useEffect } from 'react';

const CurrencyInput = ({ 
  label, 
  value, 
  onChange, 
  currency = 'COP', 
  placeholder = '0', 
  required = false, 
  className = '',
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format number with commas for display
  const formatWithCommas = (num) => {
    if (!num && num !== 0) return '';
    const numStr = num.toString();
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Remove commas and return numeric value
  const parseNumericValue = (str) => {
    if (!str) return '';
    const cleaned = str.replace(/[^\d]/g, '');
    return cleaned === '' ? '' : parseInt(cleaned, 10);
  };

  // Update display value when external value changes
  useEffect(() => {
    if (value || value === 0) {
      setDisplayValue(formatWithCommas(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow only digits and commas
    const cleanedInput = inputValue.replace(/[^\d,]/g, '');
    
    // Parse to get numeric value
    const numericValue = parseNumericValue(cleanedInput);
    
    // Format for display
    const formatted = formatWithCommas(numericValue);
    setDisplayValue(formatted);
    
    // Call onChange with numeric value
    if (onChange) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    // Ensure proper formatting on blur
    if (value || value === 0) {
      setDisplayValue(formatWithCommas(value));
    }
  };

  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'COP':
        return '$';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return '$';
    }
  };

  const getCurrencyLabel = (curr) => {
    switch (curr) {
      case 'COP':
        return 'COP';
      case 'USD':
        return 'USD';
      case 'EUR':
        return 'EUR';
      default:
        return curr;
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Currency symbol */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-lg font-medium">
            {getCurrencySymbol(currency)}
          </span>
        </div>
        
        {/* Input field */}
        <input
          type="text"
          className="w-full pl-8 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right font-mono"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          required={required}
          {...props}
        />
        
        {/* Currency code */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm font-medium">
            {getCurrencyLabel(currency)}
          </span>
        </div>
      </div>
      
      {/* Helper text */}
      {displayValue && (
        <div className="mt-1 text-xs text-gray-500">
          {currency === 'COP' && value >= 1000 && (
            <span>
              Approximately ${(value / 4300).toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })} USD
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;