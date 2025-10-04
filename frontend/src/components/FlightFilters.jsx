import React, { useState, useEffect } from 'react';
import LocationAutocomplete from './LocationAutocomplete';
import AirportService from '../services/AirportService';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { useTranslation } from '../contexts/TranslationContext';

export default function FlightFilters({ filters, setFilters }) {
  const { t } = useTranslation();
  const [availableCities, setAvailableCities] = useState({ origins: [], destinations: [] });
  const [loading, setLoading] = useState(true);

  // Load available cities from actual flight data
  useEffect(() => {
    const loadAvailableCities = async () => {
      try {
        console.log('🔄 FlightFilters: Loading cities from available flights...');
        console.log('🔧 FlightFilters: shouldUseRealAPI():', shouldUseRealAPI());
        console.log('🔧 FlightFilters: VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('🔧 FlightFilters: VITE_USE_MOCK_AUTH:', import.meta.env.VITE_USE_MOCK_AUTH);
        
        // Always try to get flights first (regardless of shouldUseRealAPI)
        let flights = [];
        
        try {
          const response = await flightsAPI.getFlights({ limit: 100 });
          flights = response.flights || response || [];
          console.log(`📡 FlightFilters: Loaded ${flights.length} total flights from API`);
          
          if (flights.length > 0) {
            console.log('📡 FlightFilters: Sample flight:', flights[0]);
          }
        } catch (apiError) {
          console.warn('⚠️ FlightFilters: API failed:', apiError.message);
          console.warn('⚠️ FlightFilters: Checking localStorage...');
          
          // Try localStorage as backup
          const localFlights = localStorage.getItem('jetchance_mock_flights');
          if (localFlights) {
            flights = JSON.parse(localFlights);
            console.log(`💾 FlightFilters: Loaded ${flights.length} flights from localStorage`);
          } else {
            console.log('💾 FlightFilters: No flights in localStorage either');
          }
        }

        if (flights.length > 0) {
          // Filter for available/approved flights only
          const availableFlights = flights.filter(flight => {
            const status = (flight.status || '').toLowerCase();
            const allowedStatuses = ['approved', 'available'];
            return allowedStatuses.includes(status);
          });

          console.log(`✅ FlightFilters: Found ${availableFlights.length} available flights (from ${flights.length} total)`);

          if (availableFlights.length === 0) {
            console.log('⚠️ FlightFilters: No approved/available flights found. Sample statuses:');
            flights.slice(0, 3).forEach((f, i) => {
              console.log(`  ${i+1}. Status: "${f.status}"`);
            });
          }

          // Extract unique cities from flight data
          const origins = new Set();
          const destinations = new Set();

          availableFlights.forEach(flight => {
            // Extract origin city (try multiple field names)
            const originCity = flight.origin_city || 
                             flight.origin?.city || 
                             flight.origin_name ||
                             flight.origin ||
                             (flight.route && flight.route.from);
            
            // Extract destination city (try multiple field names)
            const destinationCity = flight.destination_city || 
                                   flight.destination?.city || 
                                   flight.destination_name ||
                                   flight.destination ||
                                   (flight.route && flight.route.to);

            if (originCity) {
              // Clean city name (remove airport codes in parentheses)
              const cleanOrigin = originCity.includes('(') ? 
                                originCity.split('(')[0].trim() : 
                                originCity.trim();
              if (cleanOrigin) origins.add(cleanOrigin);
            }
            
            if (destinationCity) {
              // Clean city name (remove airport codes in parentheses)
              const cleanDestination = destinationCity.includes('(') ? 
                                      destinationCity.split('(')[0].trim() : 
                                      destinationCity.trim();
              if (cleanDestination) destinations.add(cleanDestination);
            }
          });

          console.log(`🎯 FlightFilters: Extracted ${origins.size} origin cities: [${Array.from(origins).slice(0, 5).join(', ')}...]`);
          console.log(`🎯 FlightFilters: Extracted ${destinations.size} destination cities: [${Array.from(destinations).slice(0, 5).join(', ')}...]`);
          
          if (origins.size === 0 && destinations.size === 0) {
            console.log('❌ FlightFilters: No cities extracted! Sample flight data:');
            availableFlights.slice(0, 2).forEach((f, i) => {
              console.log(`  Flight ${i+1}:`, {
                origin_city: f.origin_city,
                origin_name: f.origin_name,
                origin: f.origin,
                destination_city: f.destination_city,
                destination_name: f.destination_name,
                destination: f.destination
              });
            });
          }
          
          setAvailableCities({
            origins: Array.from(origins).sort(),
            destinations: Array.from(destinations).sort()
          });
        } else {
          // No flights found - use empty arrays to show no options
          console.log('⚠️ FlightFilters: No flights found, showing empty dropdowns');
          setAvailableCities({
            origins: [],
            destinations: []
          });
        }
      } catch (error) {
        console.error('❌ FlightFilters: Error loading cities:', error);
        
        // Show empty dropdowns on error rather than falling back to all airports
        setAvailableCities({
          origins: [],
          destinations: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadAvailableCities();
  }, []);

  // Custom search function that uses ONLY available cities from flights (NOT airport database)
  const searchAvailableCities = async (query, limit = 10) => {
    console.log('🔍 FlightFilters searchAvailableCities called with query:', query);
    console.log('🔍 Available origins:', availableCities.origins.length, 'destinations:', availableCities.destinations.length);
    
    if (loading) {
      console.log('🔍 Still loading, returning empty array');
      return [];
    }
    
    const allCities = [...new Set([...availableCities.origins, ...availableCities.destinations])];
    console.log('🔍 Total unique cities from flights:', allCities.length);
    
    if (!query || query.length < 1) {
      const result = allCities.slice(0, limit).map(city => ({ city }));
      console.log('🔍 No query, returning first', limit, 'cities:', result);
      return result;
    }

    const lowercaseQuery = query.toLowerCase();
    const result = allCities
      .filter(city => city.toLowerCase().includes(lowercaseQuery))
      .slice(0, limit)
      .map(city => ({ city }));
    
    console.log('🔍 Filtered cities for query "' + query + '":', result);
    return result;
  };
  
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
          label={t('flightFilters.from')}
          placeholder="Medellín"
          value={filters.origin}
          onChange={handleOriginChange}
          searchFunction={searchAvailableCities}
          renderOption={renderCityOption}
          disabled={loading}
        />

        <LocationAutocomplete
          label={t('flightFilters.to')}
          placeholder="Cancún"
          value={filters.destination}
          onChange={handleDestinationChange}
          searchFunction={searchAvailableCities}
          renderOption={renderCityOption}
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('flightFilters.date')}
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
            {t('flightFilters.passengers')}
          </label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({...filters, passengers: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
              <option key={num} value={num}>{num} {num !== 1 ? t('flightFilters.passengers') : t('flightFilters.passenger')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={() => setFilters({ origin: '', destination: '', date: '', passengers: 1 })}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          {t('flightFilters.clearFilters')}
        </button>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            {t('flightFilters.sortByPrice')}
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            {t('flightFilters.sortByDate')}
          </button>
        </div>
      </div>
    </div>
  );
}
