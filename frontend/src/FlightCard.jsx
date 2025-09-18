
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FlightCard({ flight }) {
  const navigate = useNavigate();
  
  const savings = flight.original_price - flight.price;
  const savingsPercent = Math.round((savings / flight.original_price) * 100);

  const handleViewDetails = () => {
    navigate(`/flight/${flight.id}`);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
        {/* Aircraft Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={flight.aircraft_image || `https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center`}
            alt={flight.aircraft_type}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
            {flight.aircraft_type}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-1">
                {flight.origin} → {flight.destination}
              </h3>
              <p className="text-sm text-gray-500">{flight.operator}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${flight.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 line-through">
                ${flight.original_price.toLocaleString()}
              </div>
            </div>
          </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Departure:</span> {new Date(flight.departure_time).toLocaleDateString()} at {new Date(flight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Aircraft:</span> {flight.aircraft_type}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Available Seats:</span> {flight.seats_available}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
            Save ${savings.toLocaleString()} ({savingsPercent}% off)
          </div>
        </div>

          <button 
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            onClick={handleViewDetails}
          >
            View Details & Book
          </button>
        </div>
      </div>
    </>
  );
}
