const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'jetchance.db');
const db = new Database(dbPath);

// City coordinates organized by country-city for accurate matching
const CITY_COORDINATES = {
  // Colombia (CO)
  'CO-BOGOTÁ': { lat: 4.7110, lng: -74.0721 },
  'CO-BOGOTA': { lat: 4.7110, lng: -74.0721 },
  'CO-MEDELLÍN': { lat: 6.2442, lng: -75.5812 },
  'CO-MEDELLIN': { lat: 6.2442, lng: -75.5812 },
  'CO-CALI': { lat: 3.4516, lng: -76.5320 },
  'CO-BARRANQUILLA': { lat: 10.9639, lng: -74.7964 },
  'CO-CARTAGENA': { lat: 10.3910, lng: -75.4794 },
  'CO-BUCARAMANGA': { lat: 7.1253, lng: -73.1198 },
  'CO-PEREIRA': { lat: 4.8133, lng: -75.6961 },
  'CO-CUCUTA': { lat: 7.8939, lng: -72.5078 },
  'CO-IBAGUE': { lat: 4.4389, lng: -75.2322 },
  'CO-SANTA MARTA': { lat: 11.2408, lng: -74.1990 },
  'CO-VILLAVICENCIO': { lat: 4.1420, lng: -73.6266 },
  'CO-PASTO': { lat: 1.2136, lng: -77.2811 },
  'CO-MONTERÍA': { lat: 8.7479, lng: -75.8814 },
  'CO-VALLEDUPAR': { lat: 10.4731, lng: -73.2532 },
  'CO-MANIZALES': { lat: 5.0703, lng: -75.5138 },
  'CO-NEIVA': { lat: 2.9273, lng: -75.2819 },
  'CO-ARMENIA': { lat: 4.5339, lng: -75.6811 },
  
  // Venezuela (VE)
  'VE-CARACAS': { lat: 10.4806, lng: -66.9036 },
  'VE-MARACAIBO': { lat: 10.6316, lng: -71.6419 },
  'VE-VALENCIA': { lat: 10.1620, lng: -68.0077 },
  'VE-BARQUISIMETO': { lat: 10.0647, lng: -69.3570 },
  'VE-SAN CRISTÓBAL': { lat: 7.7669, lng: -72.2252 },
  'VE-SAN CRISTOBAL': { lat: 7.7669, lng: -72.2252 },
  
  // USA (US or USA)
  'US-MIAMI': { lat: 25.7617, lng: -80.1918 },
  'USA-MIAMI': { lat: 25.7617, lng: -80.1918 },
  'US-NEW YORK': { lat: 40.7128, lng: -74.0060 },
  'USA-NEW YORK': { lat: 40.7128, lng: -74.0060 },
  'US-LOS ANGELES': { lat: 34.0522, lng: -118.2437 },
  'USA-LOS ANGELES': { lat: 34.0522, lng: -118.2437 },
  'US-CHICAGO': { lat: 41.8781, lng: -87.6298 },
  'USA-CHICAGO': { lat: 41.8781, lng: -87.6298 },
  'US-HOUSTON': { lat: 29.7604, lng: -95.3698 },
  'USA-HOUSTON': { lat: 29.7604, lng: -95.3698 },
  'US-ATLANTA': { lat: 33.7490, lng: -84.3880 },
  'USA-ATLANTA': { lat: 33.7490, lng: -84.3880 },
  'US-BOSTON': { lat: 42.3601, lng: -71.0589 },
  'USA-BOSTON': { lat: 42.3601, lng: -71.0589 },
  'US-SEATTLE': { lat: 47.6062, lng: -122.3321 },
  'USA-SEATTLE': { lat: 47.6062, lng: -122.3321 },
  'US-SAN FRANCISCO': { lat: 37.7749, lng: -122.4194 },
  'USA-SAN FRANCISCO': { lat: 37.7749, lng: -122.4194 },
  'US-LAS VEGAS': { lat: 36.1699, lng: -115.1398 },
  'USA-LAS VEGAS': { lat: 36.1699, lng: -115.1398 },
  'US-DALLAS': { lat: 32.7767, lng: -96.7970 },
  'USA-DALLAS': { lat: 32.7767, lng: -96.7970 },
  
  // Mexico (MX)
  'MX-MEXICO CITY': { lat: 19.4326, lng: -99.1332 },
  'MX-CANCUN': { lat: 21.1619, lng: -86.8515 },
  'MX-GUADALAJARA': { lat: 20.6597, lng: -103.3496 },
  'MX-MONTERREY': { lat: 25.6866, lng: -100.3161 },
  
  // Spain (ES)
  'ES-MADRID': { lat: 40.4168, lng: -3.7038 },
  'ES-BARCELONA': { lat: 41.3874, lng: 2.1686 },
  'ES-VALENCIA': { lat: 39.4699, lng: -0.3763 },
  'ES-SEVILLA': { lat: 37.3891, lng: -5.9845 },
  
  // Argentina (AR)
  'AR-BUENOS AIRES': { lat: -34.6037, lng: -58.3816 },
  'AR-CÓRDOBA': { lat: -31.4201, lng: -64.1888 },
  'AR-CORDOBA': { lat: -31.4201, lng: -64.1888 },
  'AR-ROSARIO': { lat: -32.9442, lng: -60.6505 },
  'AR-MENDOZA': { lat: -32.8895, lng: -68.8458 }
};

console.log('🔍 Searching for airports without coordinates...\n');

// Get all airports without coordinates
const airportsWithoutCoords = db.prepare(`
  SELECT * FROM airports 
  WHERE latitude IS NULL OR longitude IS NULL
`).all();

console.log(`Found ${airportsWithoutCoords.length} airports without coordinates\n`);

let updatedCount = 0;
let skippedCount = 0;

airportsWithoutCoords.forEach(airport => {
  const cityKey = airport.city.toUpperCase().trim();
  const countryKey = airport.country.toUpperCase().trim();
  const fullKey = `${countryKey}-${cityKey}`;
  
  const coords = CITY_COORDINATES[fullKey];
  
  if (coords) {
    db.prepare(`
      UPDATE airports 
      SET latitude = ?, longitude = ? 
      WHERE id = ?
    `).run(coords.lat, coords.lng, airport.id);
    
    console.log(`✅ Updated ${airport.code} (${airport.city}, ${airport.country}) with coordinates: ${coords.lat}, ${coords.lng}`);
    updatedCount++;
  } else {
    console.log(`⚠️  Skipped ${airport.code} (${airport.city}, ${airport.country}) - no coordinates found for ${fullKey}`);
    skippedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⚠️  Skipped: ${skippedCount}`);
console.log(`   📍 Total: ${airportsWithoutCoords.length}`);

db.close();
