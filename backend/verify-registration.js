const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking latest operator registration...');

db.get(`
  SELECT o.*, au.email, au.created_at 
  FROM operators o 
  JOIN auth_users au ON o.auth_user_id = au.id 
  ORDER BY au.created_at DESC 
  LIMIT 1
`, (err, row) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else if (row) {
    console.log('✅ Latest operator found:');
    console.log(JSON.stringify(row, null, 2));
  } else {
    console.log('❌ No operators found');
  }
  db.close();
});