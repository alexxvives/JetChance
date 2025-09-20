const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking JOIN relationships...');

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

async function checkJoins() {
  try {
    // Check flights
    console.log('\n=== Flights ===');
    const flights = await query('SELECT id, operator_id, aircraft_id FROM flights');
    console.log(`Found ${flights.length} flights:`);
    flights.forEach(f => console.log(`- ${f.id}: operator_id=${f.operator_id}, aircraft_id=${f.aircraft_id}`));

    // Check operators
    console.log('\n=== Operators ===');
    const operators = await query('SELECT id, company_name FROM operators');
    console.log(`Found ${operators.length} operators:`);
    operators.forEach(o => console.log(`- ${o.id}: ${o.company_name}`));

    // Check aircraft
    console.log('\n=== Aircraft ===');
    const aircraft = await query('SELECT id, aircraft_type, manufacturer, model FROM aircraft');
    console.log(`Found ${aircraft.length} aircraft:`);
    aircraft.forEach(a => console.log(`- ${a.id}: ${a.aircraft_type} ${a.manufacturer} ${a.model}`));

    // Test the JOIN for each flight
    console.log('\n=== Testing JOINs ===');
    for (const flight of flights) {
      try {
        const joinResult = await query(`
          SELECT f.id, o.company_name, a.aircraft_type
          FROM flights f
          JOIN aircraft a ON f.aircraft_id = a.id
          JOIN operators o ON f.operator_id = o.id
          WHERE f.id = ?
        `, [flight.id]);
        
        if (joinResult.length > 0) {
          console.log(`✅ ${flight.id}: ${joinResult[0].company_name} - ${joinResult[0].aircraft_type}`);
        } else {
          console.log(`❌ ${flight.id}: No matching aircraft or operator`);
        }
      } catch (err) {
        console.log(`❌ ${flight.id}: JOIN failed - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

checkJoins();