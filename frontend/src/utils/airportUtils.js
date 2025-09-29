/**
 * Utility functions for airport and route handling
 */

/**
 * Extract airport code from various string formats
 * Handles: "Airport Name (CODE)", "City CODE", or just "CODE"
 * @param {string} airportString - The airport string to parse
 * @returns {string} - The airport code (e.g., "BOG", "MDE")
 */
export const extractAirportCode = (airportString) => {
  if (!airportString) return '';
  
  // If it's already just a code (3-4 letters), return as is
  if (typeof airportString === 'string' && /^[A-Z]{3,4}$/.test(airportString)) {
    return airportString;
  }
  
  // Extract code from "Airport Name (CODE)" format
  const match = airportString.toString().match(/\(([A-Z]{3,4})\)$/);
  if (match) {
    return match[1];
  }
  
  // If no parentheses, check if it's a city name followed by code
  const parts = airportString.toString().split(' ');
  const lastPart = parts[parts.length - 1];
  if (/^[A-Z]{3,4}$/.test(lastPart)) {
    return lastPart;
  }
  
  // Fallback: return original string
  return airportString.toString();
};

/**
 * Format a flight route using airport codes
 * @param {string} origin - Origin airport string
 * @param {string} destination - Destination airport string
 * @returns {string} - Formatted route (e.g., "BOG → MDE")
 */
export const formatFlightRoute = (origin, destination) => {
  const originCode = extractAirportCode(origin);
  const destinationCode = extractAirportCode(destination);
  return `${originCode} → ${destinationCode}`;
};