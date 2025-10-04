const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'jetchance.db');
const db = new Database(dbPath);

console.log('🚀 Starting airport migration...');

// Essential airports for JetChance
const airports = [
  // Major US Airports
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081 },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781 },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.2870 },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'USA', lat: 36.0840, lng: -115.1537 },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', lat: 37.6213, lng: -122.3790 },
  { code: 'ORD', name: 'Chicago O\'Hare International Airport', city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073 },
  
  // Private Jet Friendly
  { code: 'TEB', name: 'Teterboro Airport', city: 'Teterboro', country: 'USA', lat: 40.8501, lng: -74.0606 },
  { code: 'VNY', name: 'Van Nuys Airport', city: 'Van Nuys', country: 'USA', lat: 34.2098, lng: -118.4885 },
  
  // Colombian Airports (Priority for JetChance)
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', lat: 4.7016, lng: -74.1469 },
  { code: 'MDE', name: 'José María Córdova International Airport', city: 'Medellín', country: 'Colombia', lat: 6.1645, lng: -75.4231 },
  { code: 'CTG', name: 'Rafael Núñez International Airport', city: 'Cartagena', country: 'Colombia', lat: 10.4424, lng: -75.5130 },
  { code: 'CLO', name: 'Alfonso Bonilla Aragón International Airport', city: 'Cali', country: 'Colombia', lat: 3.5430, lng: -76.3816 },
  { code: 'BAQ', name: 'Ernesto Cortissoz International Airport', city: 'Barranquilla', country: 'Colombia', lat: 10.8896, lng: -74.7808 },
  { code: 'SMR', name: 'Simón Bolívar International Airport', city: 'Santa Marta', country: 'Colombia', lat: 11.1196, lng: -74.2306 },
  
  // Mexican Airports (High demand routes)
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lng: -99.0721 },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', lat: 21.0365, lng: -86.8771 },
  { code: 'GDL', name: 'Miguel Hidalgo y Costilla Guadalajara International Airport', city: 'Guadalajara', country: 'Mexico', lat: 20.5218, lng: -103.3112 },
  
  // Brazilian Airports
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731 },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.8099, lng: -43.2505 },
  
  // European (Popular private jet destinations)
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543 },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4647, lng: 8.5492 }
];

// Prepare insert statement
const insertAirport = db.prepare(`
  INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) 
  VALUES (?, ?, ?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP)
`);

// Insert airports
let inserted = 0;
let skipped = 0;

airports.forEach(airport => {
  try {
    const result = insertAirport.run(
      airport.code, 
      airport.name, 
      airport.city, 
      airport.country, 
      airport.lat, 
      airport.lng
    );
    
    if (result.changes > 0) {
      inserted++;
      console.log(`✅ Added: ${airport.code} - ${airport.name} (${airport.city})`);
    } else {
      skipped++;
      console.log(`⚠️  Skipped: ${airport.code} - Already exists`);
    }
  } catch (error) {
    console.error(`❌ Error adding ${airport.code}:`, error.message);
  }
});

// Create indexes for performance
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_airports_status ON airports(status);
    CREATE INDEX IF NOT EXISTS idx_airports_city ON airports(city);
    CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);
    CREATE INDEX IF NOT EXISTS idx_airports_code ON airports(code);
  `);
  console.log('📊 Created database indexes for performance');
} catch (error) {
  console.error('❌ Error creating indexes:', error.message);
}

// Verify results
const totalCount = db.prepare('SELECT COUNT(*) as count FROM airports').get().count;
const approvedCount = db.prepare('SELECT COUNT(*) as count FROM airports WHERE status = ?').get('approved').count;

console.log('\n🎯 Migration Results:');
console.log(`   📝 Inserted: ${inserted} new airports`);
console.log(`   ⚠️  Skipped: ${skipped} existing airports`);
console.log(`   📊 Total airports: ${totalCount}`);
console.log(`   ✅ Approved: ${approvedCount}`);

// Show sample cities available
const cities = db.prepare('SELECT DISTINCT city FROM airports WHERE status = ? ORDER BY city').all('approved');
console.log('\n🏙️ Available cities:', cities.map(c => c.city).join(', '));

db.close();
console.log('\n🚀 Airport migration completed successfully!');