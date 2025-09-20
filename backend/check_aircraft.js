const db = require('./config/database-sqlite');

async function checkAircraft() {
  try {
    console.log('=== AIRCRAFT TABLE DATA ===');
    const result = await db.query('SELECT * FROM aircraft LIMIT 10');
    console.log('Aircraft found:', result.rows.length);
    result.rows.forEach((aircraft, index) => {
      console.log(`${index + 1}. ID: ${aircraft.id}, Manufacturer: ${aircraft.manufacturer}, Model: ${aircraft.model}, Operator: ${aircraft.operator_id}, Active: ${aircraft.is_active}`);
    });
    
    console.log('\n=== CHECKING RECENT FLIGHTS ===');
    const flightResult = await db.query(`
      SELECT f.id, f.aircraft_id, a.manufacturer, a.model 
      FROM flights f 
      LEFT JOIN aircraft a ON f.aircraft_id = a.id 
      ORDER BY f.created_at DESC 
      LIMIT 5
    `);
    console.log('Recent flights with aircraft:');
    flightResult.rows.forEach((flight, index) => {
      console.log(`${index + 1}. Flight: ${flight.id}, Aircraft ID: ${flight.aircraft_id}, Name: ${flight.manufacturer} ${flight.model}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAircraft();