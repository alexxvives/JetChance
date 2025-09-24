const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking flights table structure...');

db.all("PRAGMA table_info(flights)", (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('📋 Current flights table columns:');
    rows.forEach(row => {
      console.log(`  - ${row.name} (${row.type})`);
    });
  }
  
  // Check if we have any flights data
  db.get("SELECT COUNT(*) as count FROM flights", (err, row) => {
    if (err) {
      console.error('❌ Error counting flights:', err.message);
    } else {
      console.log(`\n📊 Total flights in database: ${row.count}`);
    }
    
    db.close();
  });
});