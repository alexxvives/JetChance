const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'jetchance.db'));

console.log('=== CHECKING AIRPORT BBB ===\n');

const airport = db.prepare(`
  SELECT * FROM airports WHERE code = ?
`).get('BBB');

if (airport) {
  console.log('Airport found:');
  console.log(JSON.stringify(airport, null, 2));
} else {
  console.log('❌ Airport BBB not found in database');
}

console.log('\n=== ALL AIRPORTS WITH CITY SAN CRISTÓBAL ===\n');

const sanCristobalAirports = db.prepare(`
  SELECT * FROM airports WHERE city LIKE '%San Cristóbal%' OR city LIKE '%San Cristobal%'
`).all();

sanCristobalAirports.forEach(a => {
  console.log(JSON.stringify(a, null, 2));
  console.log('---');
});

console.log('\n=== CHECKING FLIGHT FL000008 ===\n');

const flight = db.prepare(`
  SELECT * FROM flights WHERE flight_id = ?
`).get('FL000008');

if (flight) {
  console.log('Flight found:');
  console.log(JSON.stringify(flight, null, 2));
} else {
  console.log('❌ Flight FL000008 not found');
}

db.close();
