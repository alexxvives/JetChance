const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./chancefly.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to SQLite database.');
});

// First, check the table structure
db.all("PRAGMA table_info(flights)", (err, columns) => {
  if (err) {
    console.error('Error getting table info:', err);
  } else {
    console.log('\n=== FLIGHTS TABLE STRUCTURE ===');
    console.table(columns);
    
    // Now check flights data with correct column names
    db.all('SELECT * FROM flights LIMIT 5', (err, rows) => {
      if (err) {
        console.error('Error querying flights:', err);
      } else {
        console.log('\n=== FLIGHTS IN DATABASE ===');
        console.table(rows);
        
        // Count total flights
        db.all('SELECT COUNT(*) as total FROM flights', (err, countRows) => {
          if (err) {
            console.error('Error counting flights:', err);
          } else {
            console.log('\n=== TOTAL FLIGHTS ===');
            console.table(countRows);
          }
          db.close();
        });
      }
    });
  }
});