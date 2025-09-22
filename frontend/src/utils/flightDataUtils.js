/**
 * Utility functions for flight data transformation and display
 */

/**
 * Extract the charter price from flight data
 * Handles both nested API structure and flat structure for backward compatibility
 * @param {Object} flight - Flight data object
 * @returns {number} Charter price (empty leg price)
 */
export const getCharterPrice = (flight) => {
  // Always prioritize charter price (empty_leg_price) over market rate (original_price)
  return flight.pricing?.emptyLegPrice || 
         flight.empty_leg_price || 
         flight.emptyLegPrice || 
         0;
};

/**
 * Extract the market price from flight data
 * @param {Object} flight - Flight data object
 * @returns {number} Market price (original price)
 */
export const getMarketPrice = (flight) => {
  return flight.pricing?.originalPrice || 
         flight.original_price || 
         flight.originalPrice || 
         0;
};

/**
 * Get the price to display (defaults to charter price)
 * @param {Object} flight - Flight data object
 * @param {string} priceType - 'charter' or 'market'
 * @returns {number} Price to display
 */
export const getDisplayPrice = (flight, priceType = 'charter') => {
  if (priceType === 'market') {
    return getMarketPrice(flight);
  }
  return getCharterPrice(flight);
};

/**
 * Transform API flight data to consistent frontend format
 * Maps various API field names to standard frontend field names
 * @param {Object} flight - Raw flight data from API
 * @returns {Object} Transformed flight data
 */
export const transformFlightData = (flight) => {
  return {
    ...flight,
    // Map API fields to frontend expected fields
    origin: flight.origin_code || flight.origin,
    destination: flight.destination_code || flight.destination,
    departureTime: flight.departure_datetime || flight.departureTime,
    seatsAvailable: flight.available_seats || flight.seatsAvailable,
    // Always use charter price as the main price
    price: getCharterPrice(flight),
    bookings: flight.bookings || 0
  };
};

/**
 * Transform array of flights from API response
 * @param {Array|Object} response - API response (could be array or object with flights property)
 * @returns {Array} Array of transformed flight objects
 */
export const transformFlightsArray = (response) => {
  const flights = response.flights || response;
  if (!Array.isArray(flights)) {
    return [];
  }
  return flights.map(transformFlightData);
};

/**
 * Format price for display
 * @param {number} price - Price number
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (!price || price === 0) return 'N/A';
  return `$${price.toLocaleString()}`;
};