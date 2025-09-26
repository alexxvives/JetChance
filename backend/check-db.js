const { query, run, db } = require('./config/database-sqlite');

console.log('=== DATABASE TABLES ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

console.log('\n=== BOOKINGS COUNT ===');
try {
  const bookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get();
  console.log('Total bookings:', bookings.count);
} catch (e) {
  console.log('Error counting bookings:', e.message);
}

console.log('\n=== SAMPLE BOOKING DATA ===');
try {
  const sampleBooking = db.prepare("SELECT * FROM bookings LIMIT 1").get();
  console.log('Sample booking:', sampleBooking);
} catch (e) {
  console.log('Error getting sample booking:', e.message);
}

console.log('\n=== CUSTOMERS COUNT ===');
try {
  const customers = db.prepare("SELECT COUNT(*) as count FROM customers").get();
  console.log('Total customers:', customers.count);
} catch (e) {
  console.log('Error counting customers:', e.message);
}

console.log('\n=== FLIGHTS COUNT ===');
try {
  const flights = db.prepare("SELECT COUNT(*) as count FROM flights").get();
  console.log('Total flights:', flights.count);
} catch (e) {
  console.log('Error counting flights:', e.message);
}