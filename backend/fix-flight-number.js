const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding missing flight_number column...');

// Add the flight_number column
db.run("ALTER TABLE flights ADD COLUMN flight_number TEXT", (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('❌ Error adding flight_number column:', err.message);
  } else {
    console.log('✅ flight_number column added successfully');
    
    // Generate flight numbers for existing flights
    db.all("SELECT id FROM flights WHERE flight_number IS NULL", (err, rows) => {
      if (err) {
        console.error('❌ Error getting flights:', err.message);
        db.close();
        return;
      }
      
      console.log(`🔢 Generating flight numbers for ${rows.length} existing flights...`);
      
      let completed = 0;
      rows.forEach((row, index) => {
        const flightNumber = `CF${String(index + 1001).padStart(4, '0')}`;
        db.run("UPDATE flights SET flight_number = ? WHERE id = ?", [flightNumber, row.id], (err) => {
          if (err) {
            console.error(`❌ Error updating flight ${row.id}:`, err.message);
          } else {
            console.log(`✅ Updated flight ${row.id} with flight number ${flightNumber}`);
          }
          
          completed++;
          if (completed === rows.length) {
            console.log('🎉 All flight numbers generated successfully!');
            db.close();
          }
        });
      });
      
      if (rows.length === 0) {
        console.log('ℹ️ No flights need flight number updates');
        db.close();
      }
    });
  }
});