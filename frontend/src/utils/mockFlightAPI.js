// Mock flight management for demo purposes
const MOCK_FLIGHTS_KEY = 'chancefly_mock_flights';

// Initialize with empty flights - user will create their own
const DEFAULT_FLIGHTS = [];

// Clear all flight data
const clearAllFlights = () => {
  try {
    localStorage.removeItem(MOCK_FLIGHTS_KEY);
    console.log('All flight data cleared from localStorage');
  } catch (error) {
    console.warn('Error clearing flight data:', error);
  }
};

// Get flights from localStorage or initialize with defaults
const getStoredFlights = () => {
  try {
    const stored = localStorage.getItem(MOCK_FLIGHTS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_FLIGHTS;
  } catch (error) {
    console.warn('Error loading stored flights, using defaults:', error);
    return DEFAULT_FLIGHTS;
  }
};

// Save flights to localStorage
const saveFlights = (flights) => {
  try {
    localStorage.setItem(MOCK_FLIGHTS_KEY, JSON.stringify(flights));
  } catch (error) {
    console.warn('Error saving flights:', error);
  }
};

// Initialize flights in localStorage if not present (don't clear existing data)
if (!localStorage.getItem(MOCK_FLIGHTS_KEY)) {
  saveFlights(DEFAULT_FLIGHTS);
  console.log('✅ Initialized localStorage with empty flights array');
}

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockFlightAPI = {
  // Get all flights (with optional filters)
  getFlights: async (filters = {}) => {
    await delay(500);
    
    let flights = getStoredFlights();
    
    // Apply filters
    if (filters.origin) {
      flights = flights.filter(f => 
        f.origin.toLowerCase().includes(filters.origin.toLowerCase()) ||
        f.originCode.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }
    
    if (filters.destination) {
      flights = flights.filter(f => 
        f.destination.toLowerCase().includes(filters.destination.toLowerCase()) ||
        f.destinationCode.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      flights = flights.filter(f => 
        new Date(f.departureTime).toDateString() === filterDate
      );
    }
    
    if (filters.passengers) {
      flights = flights.filter(f => f.seatsAvailable >= parseInt(filters.passengers));
    }
    
    return { flights, total: flights.length };
  },

  // Get flights for specific operator
  getOperatorFlights: async (operatorId) => {
    await delay(500);
    
    const flights = getStoredFlights();
    const operatorFlights = flights.filter(f => f.operatorId === operatorId);
    
    return { flights: operatorFlights, total: operatorFlights.length };
  },

  // Get single flight by ID
  getFlightById: async (flightId) => {
    await delay(300);
    
    const flights = getStoredFlights();
    const flight = flights.find(f => f.id === parseInt(flightId));
    
    if (!flight) {
      throw new Error('Flight not found');
    }
    
    return flight;
  },

  // Create new flight
  createFlight: async (flightData, operatorId) => {
    await delay(800);
    
    const flights = getStoredFlights();
    
    const newFlight = {
      id: Math.max(...flights.map(f => f.id), 0) + 1,
      ...flightData,
      operatorId,
      status: 'active',
      bookings: 0,
      createdAt: new Date().toISOString()
    };
    
    flights.push(newFlight);
    saveFlights(flights);
    
    return newFlight;
  },

  // Update flight
  updateFlight: async (flightId, updateData) => {
    await delay(600);
    
    const flights = getStoredFlights();
    const flightIndex = flights.findIndex(f => f.id === parseInt(flightId));
    
    if (flightIndex === -1) {
      throw new Error('Flight not found');
    }
    
    flights[flightIndex] = {
      ...flights[flightIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    saveFlights(flights);
    
    return flights[flightIndex];
  },

  // Delete flight
  deleteFlight: async (flightId) => {
    await delay(400);
    
    const flights = getStoredFlights();
    const flightIndex = flights.findIndex(f => f.id === parseInt(flightId));
    
    if (flightIndex === -1) {
      throw new Error('Flight not found');
    }
    
    flights.splice(flightIndex, 1);
    saveFlights(flights);
    
    return { success: true };
  },

  // Get flight statistics for operator
  getOperatorStats: async (operatorId) => {
    await delay(400);
    
    const flights = getStoredFlights();
    const operatorFlights = flights.filter(f => f.operatorId === operatorId);
    
    const stats = {
      totalFlights: operatorFlights.length,
      activeFlights: operatorFlights.filter(f => f.status === 'active').length,
      totalBookings: operatorFlights.reduce((sum, f) => sum + f.bookings, 0),
      totalRevenue: operatorFlights.reduce((sum, f) => sum + (f.price * f.bookings), 0),
      avgBookingRate: operatorFlights.length > 0 
        ? operatorFlights.reduce((sum, f) => sum + f.bookings, 0) / operatorFlights.length 
        : 0
    };
    
    return stats;
  },

  // Clear all flight data
  clearAllFlights: async () => {
    await delay(200);
    clearAllFlights();
    return { success: true, message: 'All flight data cleared' };
  }
};

// Check if we should use mock flight API
export const shouldUseMockFlightAPI = () => {
  // Only use mock when explicitly enabled
  return import.meta.env.VITE_USE_MOCK_AUTH === 'true' || 
         !import.meta.env.VITE_API_URL;
};