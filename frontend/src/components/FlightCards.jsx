import React, { useState, useEffect } from 'react';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';

export default function FlightCards() {
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

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes (for same-tab updates)
    const interval = setInterval(() => {
      const stored = localStorage.getItem('chancefly_mock_flights');
      if (stored) {
        try {
          const parsedFlights = JSON.parse(stored);
          if (parsedFlights.length !== flights.length) {
            setLastUpdate(Date.now());
          }
        } catch (error) {
          console.error('Error parsing flights from localStorage:', error);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [flights.length]);

  // Fallback static data - empty since user will create their own
  const fallbackFlightData = [];

  useEffect(() => {
    const loadFlights = async () => {
      try {
        if (shouldUseRealAPI()) {
          const response = await flightsAPI.getFlights({ limit: 6 });
          const activeFlights = (response.flights || response)
            .filter(flight => flight.status === 'active')
            .slice(0, 6);
          setFlights(activeFlights);
        } else if (shouldUseMockFlightAPI()) {
          const allFlights = await mockFlightAPI.getFlights();
          
          // Show only active flights and limit to 6 for the landing page
          const activeFlights = allFlights
            .filter(flight => flight.status === 'active')
            .slice(0, 6);
          
          setFlights(activeFlights);
        } else {
          // Use fallback data if no API is available
          setFlights(fallbackFlightData);
        }
      } catch (error) {
        console.error('FlightCards: Error loading flights:', error);
        // Fallback to empty array if API fails
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, [lastUpdate]); // Re-run when lastUpdate changes

  // Format flight data for display
  const formatFlightForDisplay = (flight) => {
    const departureDate = new Date(flight.departureTime);
    const timeString = departureDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    const savings = flight.originalPrice - flight.price;
    const savingsPercent = Math.round((savings / flight.originalPrice) * 100);
    
    return {
      route: `${flight.origin} → ${flight.destination}`,
      price: `$${flight.price.toLocaleString()}`,
      time: `${departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeString}`,
      aircraft: flight.aircraftType,
      seats: `${flight.seatsAvailable} seats available`,
      savings: `Save $${savings.toLocaleString()} (${savingsPercent}% off)`,
      rotation: Math.random() > 0.5 ? "rotate-1" : "-rotate-1"
    };
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
          <p className="text-white/80 mt-4">Loading available flights...</p>
        </div>
      </section>
    );
  }

  // Use dynamic flights if available, otherwise show empty state
  const displayFlights = flights.length > 0 
    ? flights.map(formatFlightForDisplay)
    : fallbackFlightData;

  // Duplicate the data for seamless looping (only if we have flights)
  const duplicatedFlights = displayFlights.length > 0 
    ? [...displayFlights, ...displayFlights]
    : [];

  // Show empty state if no flights
  if (!loading && displayFlights.length === 0) {
    return (
      <section className="py-16 overflow-hidden">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Available Flights Right Now
          </h2>
          <p className="text-white/80 text-lg">
            Discover luxury flights at unbeatable prices
          </p>
        </div>
        
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Flights Available Yet</h3>
            <p className="text-white/70">
              Operators can add new flights through the dashboard to get started.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Available Flights Right Now
        </h2>
        <p className="text-white/80 text-lg">
          Discover luxury flights at unbeatable prices
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
        
        {/* Scrolling container */}
        <div className="flight-cards-scroll" style={{ height: '220px' }}>
          <div className="flex gap-6 py-4">
            {duplicatedFlights.map((flight, index) => (
              <div key={index} className="card-wrapper">
                <div
                  className={`card-inner bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform ${flight.rotation} hover:rotate-0 hover:scale-105 transition-all duration-300 border border-violet-100`}
                >
                  <div className="card-header">
                    <div className="card-route">{flight.route}</div>
                    <div className="card-price">{flight.price}</div>
                  </div>
                  <div className="card-time">{flight.time}</div>
                  <div className="card-aircraft">{flight.aircraft} • {flight.seats}</div>
                  <div className="card-savings">
                    {flight.savings}
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