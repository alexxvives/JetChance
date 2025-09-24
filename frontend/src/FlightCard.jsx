
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from './contexts/AuthContext';
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
  return 'https://img.icons8.com/ios-filled/400/airplane-mode-on.png';
};

export default function FlightCard({ flight, isAdminView = false, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super-admin';
  const showAdminActions = isAdminView && isSuperAdmin;
  // Handle the new nested API response structure
  const price = flight.pricing?.emptyLegPrice || flight.empty_leg_price || flight.price || 0;
  const originalPrice = flight.pricing?.originalPrice || flight.original_price || 0;
  const savings = flight.pricing?.savings || (originalPrice - price) || 0;
  const savingsPercent = flight.pricing?.savingsPercent || (originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0);
  
  // Handle field name mapping for both new nested and old flat structures
  const origin = flight.origin?.code || flight.origin_code || flight.origin || '';
  const destination = flight.destination?.code || flight.destination_code || flight.destination || '';
  const departureTime = flight.schedule?.departure || flight.departure_time || flight.departure_datetime || '';
  
  // Prioritize aircraft_name from backend, fallback to constructed name or default
  const aircraftName = flight.aircraft_name || flight.aircraft?.name;
  const aircraftType = flight.aircraft?.type || flight.aircraft_type || 'Private Jet';
  const aircraftModel = flight.aircraft?.model || flight.model || '';
  const aircraftManufacturer = flight.aircraft?.manufacturer || flight.manufacturer || '';
  const fullAircraftName = aircraftName || (aircraftManufacturer && aircraftModel ? `${aircraftManufacturer} ${aircraftModel}` : aircraftType);
  
  const operatorName = flight.operator?.name || flight.operator_name || flight.operator || 'Private Operator';
  const seatsAvailable = flight.capacity?.availableSeats || flight.seats_available || flight.available_seats || 0;

  const handleViewDetails = () => {
    navigate(`/flight/${flight.id}`);
  };

  const handleDeleteFlight = async () => {
    if (onDelete) {
      onDelete(flight.id, operatorName, `${origin} → ${destination}`);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
        {/* Aircraft Image */}
        <div className="relative h-48 overflow-hidden">
          {(flight.aircraft_image || flight.aircraft_image_url || flight.aircraft?.image) ? (
            // Use provided aircraft image
            <>
              <img 
                src={flight.aircraft_image || flight.aircraft_image_url || flight.aircraft?.image}
                alt={fullAircraftName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If custom image fails, fall back to animated plane scene
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.fallback-scene');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              />
              {/* Hidden fallback scene */}
              <div className="fallback-scene hidden w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 items-center justify-center relative overflow-hidden">
                <div className="animate-bounce" style={{animationDuration: '3s'}}>
                  <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
                {/* Animated clouds */}
                <div className="absolute top-4 left-0 animate-pulse opacity-30" style={{animationDuration: '4s'}}>
                  <svg className="w-16 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                  </svg>
                </div>
                <div className="absolute top-8 right-4 animate-pulse opacity-20" style={{animationDelay: '2s', animationDuration: '5s'}}>
                  <svg className="w-12 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                  </svg>
                </div>
              </div>
            </>
          ) : (
            // No custom image provided - use animated plane scene with SVG
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative overflow-hidden">
              <div className="animate-bounce" style={{animationDuration: '3s'}}>
                <svg className="w-24 h-24 text-blue-600 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              {/* Animated clouds */}
              <div className="absolute top-4 left-0 animate-pulse opacity-30" style={{animationDuration: '4s'}}>
                <svg className="w-16 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                </svg>
              </div>
              <div className="absolute top-8 right-4 animate-pulse opacity-20" style={{animationDelay: '2s', animationDuration: '5s'}}>
                <svg className="w-12 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                </svg>
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-10">
            {fullAircraftName}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-1">
                {origin} → {destination}
              </h3>
              <p className="text-sm text-gray-500">{operatorName}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <div className="text-2xl font-bold text-blue-600">
                  ${price ? price.toLocaleString() : '0'}
                </div>
                {savings > 0 && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    -{savingsPercent}%
                  </div>
                )}
              </div>
              {originalPrice && originalPrice > 0 && (
                <div className="text-sm text-gray-400 line-through">
                  ${originalPrice.toLocaleString()}
                </div>
              )}
            </div>
          </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Departure:</span> {departureTime ? new Date(departureTime).toLocaleDateString() : 'TBD'} at {departureTime ? new Date(departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Operator:</span> {operatorName}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Aircraft:</span> {fullAircraftName}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Available Seats:</span> {seatsAvailable}
          </div>
        </div>

          <button 
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            onClick={handleViewDetails}
          >
            View Details & Book
          </button>

          {/* Admin Actions - Only visible to super admins in admin view */}
          {showAdminActions && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={handleDeleteFlight}
                className="w-full flex items-center justify-center py-1.5 px-3 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-3 w-3 mr-1.5" />
                Delete Flight
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
