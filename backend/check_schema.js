const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking flights table schema...');

db.all("PRAGMA table_info(flights)", (err, rows) => {
  if (err) {
    console.error('Error checking schema:', err);
  } else {
    console.log('\nFlights table columns:');
    rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
  }
  
  // Also get a sample row to see the actual data
  db.all("SELECT * FROM flights LIMIT 1", (err, sampleRows) => {
    if (err) {
      console.error('Error getting sample data:', err);
    } else if (sampleRows.length > 0) {
      console.log('\nSample flight data:');
      console.log(Object.keys(sampleRows[0]).join(', '));
      console.log(sampleRows[0]);
    }
    db.close();
  });
});