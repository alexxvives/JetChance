const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('Checking all users in the database...');

db.all('SELECT * FROM users ORDER BY id', (err, users) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`\nTotal users: ${users.length}`);
  console.log('='.repeat(80));
  
  let superAdminCount = 0;
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.id}: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Created: ${user.created_at}`);
    
    if (user.role === 'super-admin') {
      superAdminCount++;
      console.log(`   ⚠️  SUPER-ADMIN #${superAdminCount}`);
    }
    
    console.log('');
  });
  
  console.log(`📊 Summary:`);
  console.log(`   Total users: ${users.length}`);
  console.log(`   Super-admins: ${superAdminCount}`);
  
  if (superAdminCount > 1) {
    console.log(`   ⚠️  WARNING: Multiple super-admins found!`);
    console.log(`   👤 Official super-admin should be: admin@chancefly.com`);
  }
  
  db.close();
});