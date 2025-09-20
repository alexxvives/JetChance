const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('🔍 Checking operator mapping for USR007...\n');

// Check user USR007
db.get('SELECT * FROM users WHERE id = ?', ['USR007'], (err, user) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log('👤 User USR007:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  
  // Check corresponding operator
  db.get('SELECT * FROM operators WHERE user_id = ?', ['USR007'], (err, operator) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    if (operator) {
      console.log('\n🏢 Corresponding Operator:');
      console.log(`   Operator ID: ${operator.id}`);
      console.log(`   Company: ${operator.company_name}`);
      
      // Check flights created with user_id vs operator_id
      db.all('SELECT id, operator_id FROM flights WHERE operator_id = ?', ['USR007'], (err, userFlights) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log(`\n✈️ Flights with operator_id = USR007 (WRONG): ${userFlights.length}`);
          userFlights.forEach(f => console.log(`   Flight ${f.id}`));
        }
        
        db.all('SELECT id, operator_id FROM flights WHERE operator_id = ?', [operator.id], (err, operatorFlights) => {
          if (err) {
            console.error('Error:', err);
          } else {
            console.log(`\n✈️ Flights with operator_id = ${operator.id} (CORRECT): ${operatorFlights.length}`);
            operatorFlights.forEach(f => console.log(`   Flight ${f.id}`));
          }
          
          console.log('\n🎯 Solution:');
          console.log(`   Need to fix flight creation to use operator_id: ${operator.id}`);
          console.log(`   Instead of user_id: USR007`);
          
          db.close();
        });
      });
    } else {
      console.log('\n❌ No operator found for USR007');
      db.close();
    }
  });
});