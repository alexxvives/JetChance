const { query, run, db } = require('./config/database-sqlite');

console.log('=== TESTING CRM QUERY ===');

try {
  // Test basic bookings query first
  console.log('Testing basic bookings...');
  const basicBookings = db.prepare("SELECT * FROM bookings LIMIT 1").get();
  console.log('Basic booking:', basicBookings);

  // Test if all required tables exist
  const tables = ['bookings', 'flights', 'operators', 'customers', 'users'];
  for (const table of tables) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      console.log(`${table}: ${count.count} records`);
    } catch (e) {
      console.log(`${table}: ERROR - ${e.message}`);
    }
  }

  // Test the complex JOIN query step by step
  console.log('\nTesting JOIN queries...');
  
  // First, test bookings -> flights
  try {
    const bf = db.prepare(`
      SELECT b.id, b.flight_id, f.origin_city, f.destination_city 
      FROM bookings b 
      JOIN flights f ON b.flight_id = f.id 
      LIMIT 1
    `).get();
    console.log('Bookings + Flights:', bf);
  } catch (e) {
    console.log('Bookings + Flights ERROR:', e.message);
  }

  // Test bookings -> customers
  try {
    const bc = db.prepare(`
      SELECT b.id, b.customer_id, c.first_name, c.last_name 
      FROM bookings b 
      JOIN customers c ON b.customer_id = c.id 
      LIMIT 1
    `).get();
    console.log('Bookings + Customers:', bc);
  } catch (e) {
    console.log('Bookings + Customers ERROR:', e.message);
  }

  // Test customers -> users
  try {
    const cu = db.prepare(`
      SELECT c.id, c.user_id, u.email 
      FROM customers c 
      JOIN users u ON c.user_id = u.id 
      LIMIT 1
    `).get();
    console.log('Customers + Users:', cu);
  } catch (e) {
    console.log('Customers + Users ERROR:', e.message);
  }

} catch (error) {
  console.error('Test error:', error);
}