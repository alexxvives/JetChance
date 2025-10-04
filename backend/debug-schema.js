const Database = require('better-sqlite3');
const db = new Database('jetchance.db');

console.log('=== CHECKING DATABASE SCHEMA ===');

try {
  // Check available tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Available tables:', tables.map(t => t.name));

  // Check airports table
  console.log('\n=== AIRPORTS TABLE SCHEMA ===');
  const airportsSchema = db.prepare('PRAGMA table_info(airports)').all();
  console.log('Airports columns:', airportsSchema.map(c => `${c.name} (${c.type})`));

  // Check users table  
  console.log('\n=== USERS TABLE SCHEMA ===');
  const usersSchema = db.prepare('PRAGMA table_info(users)').all();
  console.log('Users columns:', usersSchema.map(c => `${c.name} (${c.type})`));

  // Check if operators table exists
  console.log('\n=== OPERATORS TABLE CHECK ===');
  try {
    const operatorsSchema = db.prepare('PRAGMA table_info(operators)').all();
    if (operatorsSchema.length > 0) {
      console.log('Operators columns:', operatorsSchema.map(c => `${c.name} (${c.type})`));
    } else {
      console.log('Operators table exists but has no columns');
    }
  } catch(e) {
    console.log('Operators table does not exist:', e.message);
  }

  // Check sample data
  console.log('\n=== SAMPLE PENDING AIRPORTS ===');
  const sampleAirports = db.prepare("SELECT * FROM airports WHERE status = 'pending' LIMIT 2").all();
  console.log('Sample pending airports:', sampleAirports);

} catch(error) {
  console.error('Database error:', error.message);
}

db.close();