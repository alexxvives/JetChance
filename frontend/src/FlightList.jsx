import React from 'react';
import FlightCard from './FlightCard';
import { flights } from './data/flights';

export default function FlightList({ filters }) {
  let filteredFlights = flights.filter(flight => {
    if (filters.origin && !flight.origin.toLowerCase().includes(filters.origin.toLowerCase())) {
      return false;
    }
    if (filters.destination && !flight.destination.toLowerCase().includes(filters.destination.toLowerCase())) {
      return false;
    }
    if (filters.date && !flight.departure_time.startsWith(filters.date)) {
      return false;
    }
    if (filters.passengers && flight.seats_available < filters.passengers) {
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
        <FlightCard key={flight.id} flight={flight} />
      ))}
      {filteredFlights.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 text-6xl mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}