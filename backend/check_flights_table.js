const db = require('./config/database-sqlite');

async function checkFlightsTable() {
  try {
    console.log('=== FLIGHTS TABLE SCHEMA ===');
    const result = await db.query('PRAGMA table_info(flights)');
    console.log('Flights table columns:');
    result.rows.forEach((column, index) => {
      console.log(`${index + 1}. ${column.name} (${column.type}) - NotNull: ${column.notnull}, Default: ${column.dflt_value}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFlightsTable();