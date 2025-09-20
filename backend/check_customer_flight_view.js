const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('🔍 Checking flight status and customer view issues...\n');

// Check the current flight status
db.get('SELECT id, status, operator_id FROM flights WHERE id = ?', ['FL662435'], (err, flight) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  if (flight) {
    console.log('✈️ Flight FL662435 Details:');
    console.log(`   Status: ${flight.status}`);
    console.log(`   Operator ID: ${flight.operator_id}`);
    
    // Check user USR008
    db.get('SELECT id, email, role FROM users WHERE id = ?', ['USR008'], (err, user) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      
      console.log('\n👤 Customer USR008:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      
      // Check what customers should see
      console.log('\n📋 Customer Flight Visibility Rules:');
      console.log('   ✅ Customers should see: status = "approved"');
      console.log('   ✅ Customers should see: future flights only');
      console.log(`   ❌ Current flight status: "${flight.status}"`);
      
      if (flight.status === 'pending') {
        console.log('\n🔧 ISSUE FOUND: Flight is "pending" but customers need "approved" flights');
        console.log('   Solutions:');
        console.log('   1. Approve the flight (change status to "approved")');
        console.log('   2. Test with super-admin to approve the flight');
        
        // Let's approve the flight for testing
        db.run('UPDATE flights SET status = ? WHERE id = ?', ['approved', 'FL662435'], function(err) {
          if (err) {
            console.error('Error approving flight:', err);
          } else {
            console.log('\n✅ FIXED: Changed FL662435 status to "approved"');
            console.log('   Customer USR008 should now see this flight!');
          }
          db.close();
        });
      } else {
        console.log('\n✅ Flight status is correct for customer view');
        db.close();
      }
    });
  } else {
    console.log('❌ Flight FL662435 not found!');
    db.close();
  }
});