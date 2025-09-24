const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking flights and operators relationship...');

// Check operators table
db.all("SELECT id, company_name FROM operators LIMIT 5", (err, operators) => {
  if (err) {
    console.error('❌ Error getting operators:', err.message);
  } else {
    console.log('📋 Operators:');
    operators.forEach(op => {
      console.log(`  - ${op.id}: ${op.company_name}`);
    });
  }
  
  // Check flights and their operator_id values
  db.all("SELECT id, flight_number, operator_id FROM flights LIMIT 5", (err, flights) => {
    if (err) {
      console.error('❌ Error getting flights:', err.message);
    } else {
      console.log('\n📋 Flights:');
      flights.forEach(flight => {
        console.log(`  - ${flight.flight_number} (${flight.id}): operator_id = ${flight.operator_id}`);
      });
    }
    
    db.close();
  });
});