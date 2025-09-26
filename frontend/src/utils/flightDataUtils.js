/**
 * Utility functions for flight data transformation and display
 */

/**
 * Extract the charter price PER SEAT from flight data
 * Handles both nested API structure and flat structure for backward compatibility
 * @param {Object} flight - Flight data object
 * @returns {number} Charter price per seat
 */
export const getCharterPrice = (flight) => {
  // Always prioritize charter price (seat_leg_price) over market rate (seat_market_price)
  return flight.pricing?.emptyLegPrice || 
         flight.seat_leg_price || 
         flight.empty_leg_price || // backward compatibility
         flight.emptyLegPrice || 
         0;
};

/**
 * Extract the market price PER SEAT from flight data
 * @param {Object} flight - Flight data object
 * @returns {number} Market price per seat
 */
export const getMarketPrice = (flight) => {
  return flight.pricing?.originalPrice || 
         flight.seat_market_price || 
         flight.original_price || // backward compatibility
         flight.originalPrice || 
         0;
};

/**
 * Get the TOTAL charter price (per-seat price × max passengers)
 * @param {Object} flight - Flight data object
 * @returns {number} Total charter price
 */
export const getTotalCharterPrice = (flight) => {
  const pricePerSeat = getCharterPrice(flight);
  const maxPassengers = flight.max_passengers || flight.capacity?.maxPassengers || 8; // Use max passengers, not available seats
  return pricePerSeat * maxPassengers;
};

/**
 * Get the TOTAL market price (per-seat price × max passengers)
 * @param {Object} flight - Flight data object
 * @returns {number} Total market price
 */
export const getTotalMarketPrice = (flight) => {
  const pricePerSeat = getMarketPrice(flight);
  const maxPassengers = flight.max_passengers || flight.capacity?.maxPassengers || 8; // Use max passengers, not available seats
  return pricePerSeat * maxPassengers;
};

/**
 * Get the total price to display (defaults to total charter price)
 * @param {Object} flight - Flight data object
 * @param {string} priceType - 'charter' or 'market'
 * @returns {number} Total price to display
 */
export const getDisplayPrice = (flight, priceType = 'charter') => {
  if (priceType === 'market') {
    return getTotalMarketPrice(flight);
  }
  return getTotalCharterPrice(flight);
};

/**
 * Transform API flight data to consistent frontend format
 * Maps various API field names to standard frontend field names
 * @param {Object} flight - Raw flight data from API
 * @returns {Object} Transformed flight data
 */
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
    // Use total charter price as the main price for display
    price: getTotalCharterPrice(flight),
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
 * Format price for display in Colombian Pesos
 * @param {number} price - Price number
 * @returns {string} Formatted price string in COP
 */
export const formatPrice = (price) => {
  if (!price || price === 0) return 'N/A';
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  return `COP ${formatted}`;
};