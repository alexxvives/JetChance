// Airport Service - Database-first approach
// Replaces hardcoded airportsAndCities.js with API calls

import API_BASE_URL from '../config/api';
const API_URL = API_BASE_URL;

class AirportService {
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all approved airports from database
   */
  static async getApprovedAirports() {
    const cacheKey = 'approved_airports';
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('🎯 Using cached airports data');
      return cached.data;
    }

    try {
      console.log('🔄 Fetching airports from database...');
      const response = await fetch(`${API_URL}/airports`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const airports = await response.json();
      console.log(`📡 Loaded ${airports.length} approved airports from database`);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: airports,
        timestamp: Date.now()
      });
      
      return airports;
    } catch (error) {
      console.error('❌ Error fetching airports:', error);
      
      // Return fallback data if API fails
      return this.getFallbackAirports();
    }
  }

  /**
   * Search airports by query (code, name, or city)
   */
  static async searchAirports(query) {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await fetch(`${API_URL}/airports?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const airports = await response.json();
      console.log(`🔍 Found ${airports.length} airports matching "${query}"`);
      return airports;
    } catch (error) {
      console.error('❌ Error searching airports:', error);
      return [];
    }
  }

  /**
   * Extract unique cities from airports
   */
  static async getAvailableCities() {
    const airports = await this.getApprovedAirports();
    
    const origins = [];
    const destinations = [];
    
    airports.forEach(airport => {
      if (airport.city && !origins.includes(airport.city)) {
        origins.push(airport.city);
      }
      if (airport.city && !destinations.includes(airport.city)) {
        destinations.push(airport.city);
      }
    });
    
    // Sort alphabetically
    const sortedOrigins = origins.sort();
    const sortedDestinations = destinations.sort();
    
    console.log(`🏙️ Extracted ${sortedOrigins.length} unique cities from airports`);
    
    return {
      origins: sortedOrigins,
      destinations: sortedDestinations
    };
  }

  /**
   * Get airport by IATA/ICAO code
   */
  static async getAirportByCode(code) {
    const airports = await this.getApprovedAirports();
    return airports.find(airport => 
      airport.code.toLowerCase() === code.toLowerCase()
    );
  }

  /**
   * Get airports in a specific city
   */
  static async getAirportsByCity(cityName) {
    const airports = await this.getApprovedAirports();
    return airports.filter(airport => 
      airport.city.toLowerCase() === cityName.toLowerCase()
    );
  }

  /**
   * Clear cache (useful for admin operations)
   */
  static clearCache() {
    this.cache.clear();
    console.log('🗑️ Airport cache cleared');
  }

  /**
   * Fallback airports if API fails (minimal set)
   */
  static getFallbackAirports() {
    console.log('⚠️ Using fallback airport data');
    return [
      { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
      { code: 'MDE', name: 'José María Córdova International Airport', city: 'Medellín', country: 'Colombia' },
      { code: 'CTG', name: 'Rafael Núñez International Airport', city: 'Cartagena', country: 'Colombia' },
      { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA' },
      { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico' },
      { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico' }
    ];
  }

  /**
   * Get statistics about airports
   */
  static async getAirportStats() {
    const airports = await this.getApprovedAirports();
    const countries = [...new Set(airports.map(a => a.country))];
    const cities = [...new Set(airports.map(a => a.city))];
    
    return {
      totalAirports: airports.length,
      countries: countries.length,
      cities: cities.length,
      topCountries: countries.slice(0, 5)
    };
  }
}

export default AirportService;