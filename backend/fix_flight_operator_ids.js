const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('🔧 Fixing existing flight with wrong operator_id...\n');

// Find flights with user_id instead of operator_id
db.all(`
  SELECT f.id, f.operator_id, u.id as user_id, o.id as correct_operator_id, o.company_name
  FROM flights f
  JOIN users u ON f.operator_id = u.id
  JOIN operators o ON o.user_id = u.id
  WHERE f.operator_id LIKE 'USR%'
`, (err, wrongFlights) => {
  if (err) {
    console.error('Error finding wrong flights:', err);
    db.close();
    return;
  }
  
  console.log(`Found ${wrongFlights.length} flights with incorrect operator_id:`);
  
  let fixedCount = 0;
  const totalFlights = wrongFlights.length;
  
  if (totalFlights === 0) {
    console.log('✅ No flights need fixing!');
    db.close();
    return;
  }
  
  wrongFlights.forEach((flight, index) => {
    console.log(`\n${index + 1}. Flight ${flight.id}:`);
    console.log(`   Wrong operator_id: ${flight.operator_id} (user_id)`);
    console.log(`   Correct operator_id: ${flight.correct_operator_id}`);
    console.log(`   Company: ${flight.company_name}`);
    
    // Fix the operator_id
    db.run(
      'UPDATE flights SET operator_id = ? WHERE id = ?',
      [flight.correct_operator_id, flight.id],
      function(err) {
        if (err) {
          console.error(`   ❌ Error fixing flight ${flight.id}:`, err);
        } else {
          console.log(`   ✅ Fixed flight ${flight.id}: ${flight.operator_id} → ${flight.correct_operator_id}`);
          fixedCount++;
        }
        
        // Check if this was the last flight
        if (fixedCount + (wrongFlights.length - fixedCount) === totalFlights) {
          console.log(`\n🎉 Summary: Fixed ${fixedCount}/${totalFlights} flights`);
          
          // Verify the fix
          db.get('SELECT COUNT(*) as count FROM flights WHERE operator_id LIKE "USR%"', (err, result) => {
            if (err) {
              console.error('Error verifying:', err);
            } else {
              console.log(`\n✅ Verification: ${result.count} flights still have user_id as operator_id`);
            }
            db.close();
          });
        }
      }
    );
  });
});