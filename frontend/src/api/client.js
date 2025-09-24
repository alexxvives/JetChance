// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem('accessToken', token);
  }

  // Remove auth token
  clearAuthToken() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 errors (token expired)
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers.Authorization = `Bearer ${this.getAuthToken()}`;
          return fetch(url, config);
        } else {
          this.clearAuthToken();
          window.location.href = '/login';
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        return response.text();
      }
    } catch (error) {
      // Only log unexpected errors (not user validation errors)
      if (!error.message.includes('Wrong Signup Code') && 
          !error.message.includes('User already exists') &&
          !error.message.includes('Invalid credentials') &&
          !error.message.includes('Missing required fields') &&
          !error.message.includes('Password must be') &&
          !error.message.includes('Password must contain')) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Refresh access token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setAuthToken(data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }

  // GET request
  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.tokens) {
      apiClient.setAuthToken(response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.tokens) {
      apiClient.setAuthToken(response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
    }
    return response;
  },

  // Logout user
  logout: () => {
    apiClient.clearAuthToken();
  },

  // Get current user profile
  getProfile: () => apiClient.get('/auth/me'),

  // Update user profile
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),

  // Change password
  changePassword: (passwordData) => apiClient.post('/auth/change-password', passwordData),
};

// Flights API
export const flightsAPI = {
  // Search flights with filters
  search: async (filters = {}) => {
    return apiClient.get('/flights', filters);
  },

  // Get flight details by ID
  getById: (flightId) => apiClient.get(`/flights/${flightId}`),

  // Create new flight (operators only)
  create: (flightData) => apiClient.post('/flights', flightData),

  // Update flight (operators only)
  update: (flightId, flightData) => apiClient.put(`/flights/${flightId}`, flightData),

  // Delete/cancel flight (operators only)
  delete: (flightId) => apiClient.delete(`/flights/${flightId}`),
};

// Bookings API
export const bookingsAPI = {
  // Get user's bookings
  getAll: () => apiClient.get('/bookings'),

  // Create new booking
  create: (bookingData) => apiClient.post('/bookings', bookingData),

  // Get booking details
  getById: (bookingId) => apiClient.get(`/bookings/${bookingId}`),

  // Cancel booking
  cancel: (bookingId) => apiClient.delete(`/bookings/${bookingId}`),
};

// Payments API
export const paymentsAPI = {
  // Create payment intent
  createIntent: (bookingId) => apiClient.post('/payments/create-intent', { bookingId }),

  // Confirm payment
  confirmPayment: (paymentData) => apiClient.post('/payments/confirm', paymentData),
};

// Users API
export const usersAPI = {
  // Get dashboard data
  getDashboard: () => apiClient.get('/users/dashboard'),

  // Get profile (alias for auth.getProfile)
  getProfile: () => apiClient.get('/users/profile'),
};

// Operators API
export const operatorsAPI = {
  // Get all operators
  getAll: () => apiClient.get('/operators'),

  // Get operator details
  getById: (operatorId) => apiClient.get(`/operators/${operatorId}`),
};

export default apiClient;