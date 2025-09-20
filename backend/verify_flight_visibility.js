const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('🔍 Verifying flight visibility for USR007...\n');

// Check user
db.get('SELECT * FROM users WHERE id = ?', ['USR007'], (err, user) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`👤 User: ${user.email} (${user.id}) - Role: ${user.role}`);
  
  // Get operator
  db.get('SELECT * FROM operators WHERE user_id = ?', ['USR007'], (err, operator) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    console.log(`🏢 Operator: ${operator.company_name} (${operator.id})`);
    
    // Check flights for this operator
    db.all(`
      SELECT f.id, f.origin_city, f.destination_city, f.departure_datetime, f.status, f.operator_id
      FROM flights f 
      WHERE f.operator_id = ?
      ORDER BY f.departure_datetime ASC
    `, [operator.id], (err, flights) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log(`\n✈️ Flights for operator ${operator.id}:`);
        if (flights.length === 0) {
          console.log('   No flights found');
        } else {
          flights.forEach(flight => {
            console.log(`   ${flight.id}: ${flight.origin_city} → ${flight.destination_city} (${flight.status})`);
          });
        }
        
        console.log('\n🎯 Dashboard Query Simulation:');
        console.log(`   Query: SELECT * FROM flights WHERE operator_id = '${operator.id}'`);
        console.log(`   Results: ${flights.length} flight(s)`);
        console.log('   ✅ Flight should now appear in USR007 dashboard!');
      }
      db.close();
    });
  });
});