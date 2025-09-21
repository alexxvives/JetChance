import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';
import { mockFlightAPI } from './utils/mockFlightAPI';
import { flightsAPI, shouldUseRealAPI } from './api/flightsAPI';

export default function FlightList({ filters = {}, isAdminView = false, onDeleteFlight }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading flights for customer view...');
        
        let flightData = [];
        
        if (shouldUseRealAPI()) {
          console.log('📡 Using Real API for customer flights...');
          // For customers, get all approved flights (no user_id filter)
          const response = await flightsAPI.getFlights(filters);
          console.log('📡 Customer API response:', response);
          flightData = response.flights || response || [];
        } else {
          console.log('🧪 Using Mock API for customer flights...');
          const response = await mockFlightAPI.getFlights();
          flightData = response.flights || [];
        }
        
        console.log(`✅ Loaded ${flightData.length} flights for customer`);
        setFlights(Array.isArray(flightData) ? flightData : []);
      } catch (error) {
        console.error('❌ Error loading flights:', error);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    loadFlights();

    // Listen for flight updates
    const handleStorageChange = (e) => {
      if (e.key === 'flights') {
        loadFlights();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleFlightUpdate = () => {
      loadFlights();
    };
    
    window.addEventListener('flightUpdate', handleFlightUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('flightUpdate', handleFlightUpdate);
    };
  }, [filters]); // Add filters as dependency

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading flights...</h3>
        </div>
      </div>
    );
  }

  // Ensure flights is always an array before filtering
  const flightsArray = Array.isArray(flights) ? flights : [];
  
  let filteredFlights = flightsArray.filter(flight => {
    // Ensure flight object has required properties
    if (!flight || typeof flight !== 'object') return false;
    
    if (filters.origin && flight.origin && !flight.origin.toLowerCase().includes(filters.origin.toLowerCase())) {
      return false;
    }
    if (filters.destination && flight.destination && !flight.destination.toLowerCase().includes(filters.destination.toLowerCase())) {
      return false;
    }
    if (filters.date && flight.departure_time && !flight.departure_time.startsWith(filters.date)) {
      return false;
    }
    if (filters.passengers && flight.seats_available && flight.seats_available < filters.passengers) {
      return false;
    }
    return true;
  });

  filteredFlights = filteredFlights.sort((a, b) => {
    return new Date(a.departure_time) - new Date(b.departure_time);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredFlights.map(flight => (
        <FlightCard 
          key={flight.id} 
          flight={flight} 
          isAdminView={isAdminView}
          onDelete={onDeleteFlight}
        />
      ))}
      {filteredFlights.length === 0 && flightsArray.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights available</h3>
          <p className="text-gray-600">Check back later for new flight options</p>
        </div>
      )}
      {filteredFlights.length === 0 && flightsArray.length > 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}