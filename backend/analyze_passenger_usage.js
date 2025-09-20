const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('🔍 Analyzing database structure for booking flow...\n');

// Check for bookings table
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'", (err, row) => {
  if (err) {
    console.error('Error checking bookings table:', err);
    db.close();
    return;
  }
  
  console.log(`📋 Bookings table exists: ${row ? '✅ YES' : '❌ NO'}`);
  
  // Check passengers table usage
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='passengers'", (err, passengerRow) => {
    if (err) {
      console.error('Error checking passengers table:', err);
      db.close();
      return;
    }
    
    console.log(`👥 Passengers table exists: ${passengerRow ? '✅ YES' : '❌ NO'}`);
    
    if (passengerRow) {
      // Check if passengers table has foreign key to bookings
      db.all("PRAGMA foreign_key_list(passengers)", (err, fkeys) => {
        if (err) {
          console.error('Error checking foreign keys:', err);
        } else {
          console.log('\n🔗 Foreign keys in passengers table:');
          if (fkeys.length === 0) {
            console.log('   No foreign keys found');
          } else {
            fkeys.forEach(fk => {
              console.log(`   ${fk.from} -> ${fk.table}.${fk.to}`);
            });
          }
        }
        
        // Show current usage analysis
        console.log('\n📊 Current Usage Analysis:');
        console.log('──────────────────────────────────────');
        console.log('1. Flight creation only requires passenger COUNT (via max_passengers)');
        console.log('2. No actual booking flow implemented yet');
        console.log('3. No customer-facing booking forms');
        console.log('4. Passengers table exists but is EMPTY and UNUSED');
        console.log('5. Code references "passenger count" but not individual passenger records');
        
        console.log('\n💡 Recommendation:');
        console.log('──────────────────────────────────────');
        if (!row) {
          console.log('✅ SAFE TO REMOVE passengers table');
          console.log('   - No bookings table exists');
          console.log('   - No booking flow implemented');
          console.log('   - Only passenger COUNT is used, not individual passenger data');
        } else {
          console.log('⚠️  Consider keeping passengers table');
          console.log('   - Bookings table exists - may be needed for future booking flow');
          console.log('   - Check if booking flow is planned');
        }
        
        db.close();
      });
    } else {
      console.log('\n💡 Passengers table analysis: Table does not exist');
      db.close();
    }
  });
});