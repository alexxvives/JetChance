// Payment API integration for JetChance
import API_BASE_URL from '../config/api';

class PaymentAPI {
  async createPaymentIntent(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders())
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      return result;
    } catch (error) {
      console.error('PaymentIntent API error:', error);
      throw error;
    }
  }

  async processPayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders())
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Payment processing failed');
      }

      return result;
    } catch (error) {
      console.error('Payment API error:', error);
      throw error;
    }
  }

  async getUserBookings() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders())
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings');
      }

      return result;
    } catch (error) {
      console.error('Bookings API error:', error);
      throw error;
    }
  }

  async getBookingByReference(reference) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/booking/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Booking not found');
      }

      return result;
    } catch (error) {
      console.error('Booking lookup API error:', error);
      throw error;
    }
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export const paymentAPI = new PaymentAPI();
export default paymentAPI;