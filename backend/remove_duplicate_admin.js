const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('🗑️ Removing duplicate super-admin user...');

// First, check if this user has any associated operator entry
db.get('SELECT * FROM operators WHERE user_id = ?', ['USR010'], (err, operator) => {
  if (err) {
    console.error('Error checking operator:', err);
    db.close();
    return;
  }
  
  if (operator) {
    console.log(`Found operator entry for USR010: ${operator.id}`);
    
    // Remove operator entry first
    db.run('DELETE FROM operators WHERE user_id = ?', ['USR010'], function(err) {
      if (err) {
        console.error('Error deleting operator:', err);
      } else {
        console.log(`✅ Deleted operator entry: ${operator.id}`);
      }
      
      // Then remove user
      deleteUser();
    });
  } else {
    console.log('No operator entry found for USR010');
    deleteUser();
  }
});

function deleteUser() {
  db.run('DELETE FROM users WHERE id = ? AND email = ?', ['USR010', 'superadmin@chancefly.com'], function(err) {
    if (err) {
      console.error('Error deleting user:', err);
    } else {
      console.log(`✅ Deleted duplicate super-admin: USR010 (superadmin@chancefly.com)`);
      console.log(`📋 Changes: ${this.changes} row(s) deleted`);
    }
    
    // Verify only one super-admin remains
    db.all('SELECT id, email, role FROM users WHERE role = ?', ['super-admin'], (err, superAdmins) => {
      if (err) {
        console.error('Error verifying:', err);
      } else {
        console.log('\n🎉 Verification - Remaining super-admins:');
        superAdmins.forEach(admin => {
          console.log(`   ${admin.id}: ${admin.email}`);
        });
        
        if (superAdmins.length === 1 && superAdmins[0].email === 'admin@chancefly.com') {
          console.log('✅ Perfect! Only the official admin@chancefly.com remains.');
        } else {
          console.log('⚠️ Warning: Unexpected super-admin configuration!');
        }
      }
      db.close();
    });
  });
}