const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create connection to the database
const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

console.log('Testing status filtering...');

// Promisify for easier async handling
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

async function runTests() {
  try {
    // Test 1: Check all flights
    console.log('\n=== All flights in database ===');
    const allFlights = await query(`
      SELECT id, origin_code, destination_code, status, operator_id
      FROM flights
      ORDER BY id
    `);

    console.log(`Found ${allFlights.length} flights:`);
    allFlights.forEach(flight => {
      console.log(`- ${flight.id}: ${flight.origin_code} → ${flight.destination_code} (Status: ${flight.status})`);
    });

    // Test 2: Approved flights only
    console.log('\n=== Approved flights only ===');
    const approvedFlights = await query(`
      SELECT id, origin_code, destination_code, status
      FROM flights
      WHERE status = ?
    `, ['approved']);

    console.log(`Found ${approvedFlights.length} approved flights:`);
    approvedFlights.forEach(flight => {
      console.log(`- ${flight.id}: ${flight.origin_code} → ${flight.destination_code} (Status: ${flight.status})`);
    });

    // Test 3: Pending flights only
    console.log('\n=== Pending flights only ===');
    const pendingFlights = await query(`
      SELECT id, origin_code, destination_code, status
      FROM flights
      WHERE status = ?
    `, ['pending']);

    console.log(`Found ${pendingFlights.length} pending flights:`);
    pendingFlights.forEach(flight => {
      console.log(`- ${flight.id}: ${flight.origin_code} → ${flight.destination_code} (Status: ${flight.status})`);
    });

    console.log('\nDatabase test completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    db.close();
  }
}

runTests();