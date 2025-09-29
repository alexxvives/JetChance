const { query, run, db } = require('./config/database-sqlite');

const checkFlightSeats = async () => {
  try {
    console.log('=== CHECKING FLIGHT SEATS ===');
    
    const result = await query('SELECT id, aircraft_model, available_seats, total_seats FROM flights LIMIT 10');
    
    if (result.rows.length === 0) {
      console.log('No flights found in database');
    } else {
      console.log('Flight seat data:');
      result.rows.forEach((flight, index) => {
        console.log(`${index + 1}. Flight ${flight.id}: ${flight.aircraft_model} - Available: ${flight.available_seats}, Total: ${flight.total_seats}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking flight seats:', error);
  }
};

checkFlightSeats();