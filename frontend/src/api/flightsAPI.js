// Real flights API for database operations
import API_BASE_URL from '../config/api';

class FlightsAPI {
  async getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Get all flights with optional filters
  async getFlights(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}/flights${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: await this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch flights: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get flights for specific operator
  async getOperatorFlights(userId) {
    // Use the main flights endpoint with user_id filter
    const response = await fetch(`${API_BASE_URL}/flights?user_id=${userId}`, {
      headers: await this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch operator flights: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get single flight by ID
  async getFlightById(flightId) {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
      headers: await this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch flight: ${response.statusText}`);
    }

    return await response.json();
  }

  // Create new flight
  async createFlight(flightData) {
    console.log('Creating flight with data:', flightData);
    console.log('API endpoint:', `${API_BASE_URL}/flights`);
    
    const headers = await this.getAuthHeaders();
    console.log('Auth headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}/flights`, {
      method: 'POST',
      headers,
      body: JSON.stringify(flightData)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `Failed to create flight: ${response.statusText}`);
    }

    return await response.json();
  }

  // Update flight
  async updateFlight(flightId, flightData) {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(flightData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update flight: ${response.statusText}`);
    }

    return await response.json();
  }

  // Delete flight
  async deleteFlight(flightId) {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete flight: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get all flights with admin filtering (for admin dashboard)
  async getAllFlights(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `${API_BASE_URL}/flights${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: await this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all flights: ${response.statusText}`);
    }

    return await response.json();
  }

  // Update flight status (for admin approval/denial)
  async updateFlightStatus(flightId, status) {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}/approve`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to update flight status: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get operator statistics (calculated from flights)
  async getOperatorStats(userId) {
    // Get all flights for this user and calculate stats client-side
    const response = await this.getOperatorFlights(userId);
    const flights = response.flights || [];
    
    const stats = {
      totalFlights: flights.length,
      activeFlights: flights.filter(f => f.status === 'active').length,
      totalBookings: flights.reduce((sum, f) => sum + (f.bookings || 0), 0),
      totalRevenue: flights.reduce((sum, f) => sum + ((f.price || 0) * (f.bookings || 0)), 0),
      avgBookingRate: flights.length > 0 
        ? flights.reduce((sum, f) => sum + (f.bookings || 0), 0) / flights.length 
        : 0
    };
    
    return stats;
  }
}

export const flightsAPI = new FlightsAPI();

// Check if we should use real API (opposite of mock)
export const shouldUseRealAPI = () => {
  // Use real API when we have an API URL and mock is not explicitly enabled
  return import.meta.env.VITE_USE_MOCK_AUTH !== 'true' && 
         import.meta.env.VITE_API_URL;
};