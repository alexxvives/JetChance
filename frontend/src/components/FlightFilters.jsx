import React from 'react';
import LocationAutocomplete from './LocationAutocomplete';
import { searchCities } from '../data/airportsAndCities';

export default function FlightFilters({ filters, setFilters }) {
  const renderCityOption = (city, isSelected) => {
    if (isSelected) {
      return city.city; // Just return city name for input display
    }
    
    return (
      <div>
        <div className="font-medium">{city.city}</div>
        <div className="text-sm text-gray-500">
          {city.state ? `${city.state}, ` : ''}{city.country}
        </div>
      </div>
    );
  };

  const handleOriginChange = (value) => {
    if (typeof value === 'object' && value.city) {
      setFilters({...filters, origin: value.city});
    } else {
      setFilters({...filters, origin: value});
    }
  };

  const handleDestinationChange = (value) => {
    if (typeof value === 'object' && value.city) {
      setFilters({...filters, destination: value.city});
    } else {
      setFilters({...filters, destination: value});
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LocationAutocomplete
          label="From"
          placeholder="Medellín"
          value={filters.origin}
          onChange={handleOriginChange}
          searchFunction={searchCities}
          renderOption={renderCityOption}
        />

        <LocationAutocomplete
          label="To"
          placeholder="Cancún"
          value={filters.destination}
          onChange={handleDestinationChange}
          searchFunction={searchCities}
          renderOption={renderCityOption}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passengers
          </label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({...filters, passengers: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
              <option key={num} value={num}>{num} passenger{num !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={() => setFilters({ origin: '', destination: '', date: '', passengers: 1 })}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Clear Filters
        </button>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Sort by Price
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Sort by Date
          </button>
        </div>
      </div>
    </div>
  );
}
