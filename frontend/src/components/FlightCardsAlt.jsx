import React, { useState, useEffect } from 'react';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { getTotalCharterPrice, getTotalMarketPrice, formatPrice } from '../utils/flightDataUtils';
import { useTranslation } from '../contexts/TranslationContext';

const formatCOP = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `COP ${formatted}`;
};

// Helper function to format COP with separate styling for currency label
const formatCOPWithStyling = (amount) => {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return { number: formatted, currency: 'COP' };
};

export default function FlightCardsAlt({ onNavigate }) {
  const { t } = useTranslation();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Listen for localStorage changes (when flights are added/updated)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'chancefly_mock_flights') {
        setLastUpdate(Date.now());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fallback static data - empty since user will create their own
  const fallbackFlightData = [];

  useEffect(() => {
    const loadFlights = async () => {
      console.log('FlightCardsAlt: Loading flights...');
      
      try {
        if (shouldUseRealAPI()) {
          console.log('FlightCardsAlt: Using real API...');
          const response = await flightsAPI.getFlights({ limit: 10 }); // Get more flights to account for filtering
          console.log('FlightCardsAlt: Real API response:', response);
          const currentTime = new Date();
          const approvedFlights = (response.flights || response)
            .filter(flight => {
              // Filter for approved status
              const status = (flight.status || '').toLowerCase();
              const allowedStatuses = ['approved', 'available'];
              if (!allowedStatuses.includes(status)) return false;
              
              // Filter out past flights (additional safety check)
              const departureTime = new Date(flight.schedule?.departure || flight.departure_time);
              if (departureTime <= currentTime) {
                console.log(`Filtering out past flight: ${flight.flightNumber || flight.id} (departed: ${departureTime.toISOString()})`);
                return false;
              }
              
              return true;
            })
            .slice(0, 6);
          console.log('FlightCardsAlt: Approved future flights:', approvedFlights);
          setFlights(approvedFlights);
        } else {
          console.log('FlightCardsAlt: Using fallback data...');
          setFlights(fallbackFlightData);
        }
      } catch (error) {
        console.error('FlightCardsAlt: Error loading flights:', error);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, [lastUpdate]);

  // Format flight data for display
  const formatFlightForDisplay = (flight) => {
    const departureDateTime = flight.departure_datetime || flight.schedule?.departure;
    const departureDate = new Date(departureDateTime);
    const timeString = departureDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    const charterPrice = getTotalCharterPrice(flight);
    const marketPrice = getTotalMarketPrice(flight);
    const savings = marketPrice - charterPrice;
    const savingsPercent = marketPrice > 0 ? Math.round((savings / marketPrice) * 100) : 0;
    
    const originCode = flight.origin_code || flight.origin?.code;
    const destinationCode = flight.destination_code || flight.destination?.code;
    
    const aircraftType = flight.aircraft_model || flight.aircraft_name || flight.aircraft?.type || 'Aircraft';
    const availableSeats = flight.available_seats || flight.capacity?.availableSeats || 0;
    
    return {
      id: flight.id,
      route: `${originCode} → ${destinationCode}`,
      price: formatCOPWithStyling(charterPrice),
      originalPrice: marketPrice,
      charterPrice: charterPrice,
      time: `${departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeString}`,
      aircraft: aircraftType,
      seats: `${availableSeats} ${t('flightCatalog.seatsAvailable')}`,
      savings: savings,
      savingsPercent: savingsPercent,
      originCode,
      destinationCode
    };
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
          <p className="text-white/80 mt-4">{t('flightCatalog.loading')}</p>
        </div>
      </section>
    );
  }

  const displayFlights = flights.length > 0 
    ? flights.map(formatFlightForDisplay)
    : fallbackFlightData;

  // Show empty state if no flights
  if (!loading && displayFlights.length === 0) {
    return (
      <section className="py-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Alternative Flight Cards Design
          </h2>
          <p className="text-white/80 text-lg">
            Static grid layout with enhanced visual hierarchy
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('flightCatalog.noFlights')}</h3>
            <p className="text-white/70">
              {t('flightCatalog.noFlightsDesc')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('flightCatalog.title')}
        </h2>
        <p className="text-white/80 text-lg">
          {t('flightCatalog.subtitle')}
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
        
        {/* Scrolling container */}
        <div className="flight-cards-alt-scroll" style={{ height: '320px' }}>
          <div className="flex gap-6 py-4">
            {/* Duplicate the data for seamless looping */}
            {[...displayFlights, ...displayFlights].slice(0, 12).map((flight, index) => (
              <div key={`${flight.id || index}-${index}`} className="card-alt-wrapper">
                <div className="card-alt-inner bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 hover:border-violet-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20">
                  
                  {/* Header with Route */}
                  <div className="card-alt-header">
                    <div className="route-display">
                      <span className="airport-code">{flight.originCode}</span>
                      <div className="route-connector">
                        <div className="route-line"></div>
                        <span className="route-plane">✈</span>
                        <div className="route-line"></div>
                      </div>
                      <span className="airport-code">{flight.destinationCode}</span>
                    </div>
                  </div>

                  {/* Price and Details Section */}
                  <div className="card-alt-content">
                    {/* Price Section */}
                    <div className="card-alt-price">
                      <div className="price-row">
                        <span className="price-amount">
                          <span className="text-xs opacity-75 mr-1">
                            {flight.price.currency}
                          </span>
                          {flight.price.number}
                        </span>
                        {flight.savings > 0 && (
                          <span className="discount-badge">
                            -{flight.savingsPercent}%
                          </span>
                        )}
                      </div>
                      {flight.savings > 0 && (
                        <div className="original-price">
                          ${flight.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Flight Details */}
                    <div className="card-alt-details">
                      <div className="detail-item">
                        <span className="text-white/60">🕒</span>
                        <span className="text-white/90 font-medium">{flight.time}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="text-white/60">✈️</span>
                        <span className="text-white/90">{flight.aircraft}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="text-white/60">👥</span>
                        <span className="text-white/90">{flight.seats}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="card-alt-cta">
                    <button 
                      onClick={() => onNavigate && onNavigate('signup')}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      {t('flightCatalog.bookNow')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
