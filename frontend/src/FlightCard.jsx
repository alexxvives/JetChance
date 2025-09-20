
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AircraftImageFallback from './components/AircraftImageFallback';

// Function to get high-quality private jet images based on aircraft type
const getDefaultAircraftImage = (aircraftType) => {
  const imageMap = {
    // Gulfstream aircraft - verified private jet images
    'Gulfstream G650': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Gulfstream G550': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Gulfstream G280': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    
    // Citation aircraft - verified private jet images
    'Citation CJ4': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    'Citation X': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Citation X+': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Citation Sovereign': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    
    // Learjet aircraft - verified private jet images
    'Learjet 75': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Learjet 60': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    
    // Falcon aircraft - verified private jet images
    'Falcon 7X': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Falcon 900': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    
    // Hawker aircraft - verified private jet images
    'Hawker 900XP': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Hawker 4000': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    
    // King Air aircraft - verified private jet images
    'King Air 350': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'King Air 250': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    
    // Challenger aircraft - verified private jet images
    'Challenger 350': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Challenger 650': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    
    // Global aircraft - verified private jet images
    'Global 6000': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Global Express': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    
    // Default fallbacks for aircraft families - all verified private jets
    'Gulfstream': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Citation': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Learjet': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Falcon': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
    'Hawker': 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=200&fit=crop&crop=center',
    'King Air': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=200&fit=crop&crop=center',
    'Challenger': 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=200&fit=crop&crop=center',
    'Global': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center'
  };

  // Try exact match first
  if (imageMap[aircraftType]) {
    return imageMap[aircraftType];
  }

  // Try to match by aircraft family (e.g., "Gulfstream G650" matches "Gulfstream")
  for (const [family, image] of Object.entries(imageMap)) {
    if (aircraftType && aircraftType.toLowerCase().includes(family.toLowerCase())) {
      return image;
    }
  }

  // Default fallback - high-quality private jet image
  return 'https://images.unsplash.com/photo-1583094447810-64e19c025d70?w=400&h=200&fit=crop&crop=center';
};

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
          {(flight.aircraft_image || getDefaultAircraftImage(flight.aircraft_type)) ? (
            <>
              <img 
                src={flight.aircraft_image || getDefaultAircraftImage(flight.aircraft_type)}
                alt={flight.aircraft_type}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, show the animated fallback
                  e.target.style.display = 'none';
                  const fallbackElement = e.target.parentElement.querySelector('.aircraft-fallback');
                  if (fallbackElement) {
                    fallbackElement.style.display = 'block';
                  }
                }}
              />
              {/* Hidden fallback that shows on error */}
              <div className="aircraft-fallback hidden">
                <AircraftImageFallback 
                  aircraftType={flight.aircraft_type}
                  className="w-full h-full"
                />
              </div>
            </>
          ) : (
            /* Show animated fallback when no image available */
            <AircraftImageFallback 
              aircraftType={flight.aircraft_type}
              className="w-full h-full"
            />
          )}

          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-10">
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
                ${flight.price ? flight.price.toLocaleString() : '0'}
              </div>
              {flight.original_price && (
                <div className="text-sm text-gray-400 line-through">
                  ${flight.original_price.toLocaleString()}
                </div>
              )}
            </div>
          </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Departure:</span> {new Date(flight.departure_time).toLocaleDateString()} at {new Date(flight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Operator:</span> {flight.operator_name || flight.operator || 'Private Operator'}
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
