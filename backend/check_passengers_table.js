const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chancefly.db');

console.log('🔍 Checking database schema for passengers table...\n');

// Check if passengers table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='passengers'", (err, row) => {
  if (err) {
    console.error('Error checking table:', err);
    db.close();
    return;
  }
  
  if (row) {
    console.log('✅ Passengers table EXISTS');
    
    // Get table schema
    db.all("PRAGMA table_info(passengers)", (err, columns) => {
      if (err) {
        console.error('Error getting schema:', err);
      } else {
        console.log('\n📋 Passengers table schema:');
        columns.forEach(col => {
          console.log(`   ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}${col.notnull ? ' NOT NULL' : ''}`);
        });
      }
      
      // Check if table has any data
      db.get("SELECT COUNT(*) as count FROM passengers", (err, result) => {
        if (err) {
          console.error('Error counting rows:', err);
        } else {
          console.log(`\n📊 Passengers table contains: ${result.count} rows`);
        }
        
        // Show sample data if any exists
        if (result.count > 0) {
          db.all("SELECT * FROM passengers LIMIT 5", (err, rows) => {
            if (err) {
              console.error('Error fetching sample data:', err);
            } else {
              console.log('\n📄 Sample passenger data:');
              rows.forEach(row => {
                console.log(`   ${JSON.stringify(row)}`);
              });
            }
            db.close();
          });
        } else {
          db.close();
        }
      });
    });
  } else {
    console.log('❌ Passengers table does NOT exist');
    
    // Check what tables do exist
    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
      if (err) {
        console.error('Error listing tables:', err);
      } else {
        console.log('\n📋 Existing tables:');
        tables.forEach(table => {
          console.log(`   - ${table.name}`);
        });
      }
      db.close();
    });
  }
});