const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'jetchance.db');
const db = new Database(dbPath);

console.log('🚀 Starting comprehensive Americas airport migration...');
console.log('🎯 Focus: South of USA → Central America → South America');
console.log('⭐ Priority: Mexico & Colombia airports');

// Comprehensive Americas airports - South of USA down to South America
const airports = [
  // =========================================
  // 🇺🇸 SOUTHERN USA - Private Jet Hubs
  // =========================================
  
  // Florida - Major Private Jet Destinations
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.2870 },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', country: 'USA', lat: 26.0742, lng: -80.1506 },
  { code: 'PBI', name: 'Palm Beach International Airport', city: 'West Palm Beach', country: 'USA', lat: 26.6832, lng: -80.0956 },
  { code: 'OPF', name: 'Miami-Opa Locka Executive Airport', city: 'Opa-locka', country: 'USA', lat: 25.9070, lng: -80.2784 },
  { code: 'TMB', name: 'Miami Executive Airport', city: 'Miami', country: 'USA', lat: 25.6479, lng: -80.4328 },
  { code: 'FXE', name: 'Fort Lauderdale Executive Airport', city: 'Fort Lauderdale', country: 'USA', lat: 26.1973, lng: -80.1707 },
  { code: 'BCT', name: 'Boca Raton Airport', city: 'Boca Raton', country: 'USA', lat: 26.3784, lng: -80.1077 },
  { code: 'TPA', name: 'Tampa International Airport', city: 'Tampa', country: 'USA', lat: 27.9755, lng: -82.5332 },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'USA', lat: 28.4294, lng: -81.3089 },
  { code: 'JAX', name: 'Jacksonville International Airport', city: 'Jacksonville', country: 'USA', lat: 30.4941, lng: -81.6878 },
  
  // Texas - Border Region & Business Hubs
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', lat: 32.8968, lng: -97.0380 },
  { code: 'DAL', name: 'Dallas Love Field', city: 'Dallas', country: 'USA', lat: 32.8471, lng: -96.8518 },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'USA', lat: 29.9844, lng: -95.3414 },
  { code: 'HOU', name: 'William P. Hobby Airport', city: 'Houston', country: 'USA', lat: 29.6454, lng: -95.2789 },
  { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', country: 'USA', lat: 30.1975, lng: -97.6664 },
  { code: 'SAT', name: 'San Antonio International Airport', city: 'San Antonio', country: 'USA', lat: 29.5337, lng: -98.4698 },
  { code: 'ELP', name: 'El Paso International Airport', city: 'El Paso', country: 'USA', lat: 31.8072, lng: -106.3781 },
  { code: 'MAF', name: 'Midland International Air and Space Port', city: 'Midland', country: 'USA', lat: 31.9425, lng: -102.2019 },
  
  // California - Southern & Business Aviation
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081 },
  { code: 'BUR', name: 'Hollywood Burbank Airport', city: 'Burbank', country: 'USA', lat: 34.2007, lng: -118.3585 },
  { code: 'LGB', name: 'Long Beach Airport', city: 'Long Beach', country: 'USA', lat: 33.8177, lng: -118.1516 },
  { code: 'SNA', name: 'John Wayne Airport', city: 'Orange County', country: 'USA', lat: 33.6762, lng: -117.8682 },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', country: 'USA', lat: 32.7336, lng: -117.1897 },
  { code: 'VNY', name: 'Van Nuys Airport', city: 'Van Nuys', country: 'USA', lat: 34.2098, lng: -118.4885 },
  { code: 'CRQ', name: 'McClellan-Palomar Airport', city: 'Carlsbad', country: 'USA', lat: 33.1283, lng: -117.2803 },
  
  // Arizona & Nevada - Business Aviation
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'USA', lat: 33.4343, lng: -112.0118 },
  { code: 'SDL', name: 'Scottsdale Airport', city: 'Scottsdale', country: 'USA', lat: 33.6229, lng: -111.9107 },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'USA', lat: 36.0840, lng: -115.1537 },
  { code: 'HND', name: 'Henderson Executive Airport', city: 'Henderson', country: 'USA', lat: 35.9728, lng: -115.1343 },
  
  // =========================================
  // 🇲🇽 MEXICO - PRIORITY COVERAGE
  // =========================================
  
  // Major International Airports
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lng: -99.0721 },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', lat: 21.0365, lng: -86.8771 },
  { code: 'GDL', name: 'Miguel Hidalgo y Costilla Guadalajara International Airport', city: 'Guadalajara', country: 'Mexico', lat: 20.5218, lng: -103.3112 },
  { code: 'MTY', name: 'Monterrey International Airport', city: 'Monterrey', country: 'Mexico', lat: 25.7785, lng: -100.1077 },
  { code: 'TIJ', name: 'Tijuana International Airport', city: 'Tijuana', country: 'Mexico', lat: 32.5411, lng: -116.9700 },
  { code: 'PVR', name: 'Puerto Vallarta International Airport', city: 'Puerto Vallarta', country: 'Mexico', lat: 20.6801, lng: -105.2544 },
  { code: 'SJD', name: 'Los Cabos International Airport', city: 'Los Cabos', country: 'Mexico', lat: 23.1518, lng: -109.7721 },
  { code: 'MZT', name: 'Mazatlán International Airport', city: 'Mazatlán', country: 'Mexico', lat: 23.1614, lng: -106.2659 },
  { code: 'ACA', name: 'Acapulco International Airport', city: 'Acapulco', country: 'Mexico', lat: 16.7571, lng: -99.7540 },
  { code: 'CZM', name: 'Cozumel International Airport', city: 'Cozumel', country: 'Mexico', lat: 20.5224, lng: -86.9256 },
  
  // Business & Regional Airports
  { code: 'HUX', name: 'Bahías de Huatulco International Airport', city: 'Huatulco', country: 'Mexico', lat: 15.7753, lng: -96.2628 },
  { code: 'OAX', name: 'Xoxocotlán International Airport', city: 'Oaxaca', country: 'Mexico', lat: 17.0006, lng: -96.7267 },
  { code: 'VSA', name: 'Carlos Rovirosa Pérez International Airport', city: 'Villahermosa', country: 'Mexico', lat: 17.9970, lng: -92.8175 },
  { code: 'MID', name: 'Manuel Crescencio Rejón International Airport', city: 'Mérida', country: 'Mexico', lat: 20.9370, lng: -89.6577 },
  { code: 'QRO', name: 'Querétaro Intercontinental Airport', city: 'Querétaro', country: 'Mexico', lat: 20.6173, lng: -100.1857 },
  { code: 'BJX', name: 'Bajío International Airport', city: 'León/Bajío', country: 'Mexico', lat: 21.0056, lng: -101.4810 },
  { code: 'MLM', name: 'Morelia International Airport', city: 'Morelia', country: 'Mexico', lat: 19.8497, lng: -101.0250 },
  { code: 'AGU', name: 'Aguascalientes International Airport', city: 'Aguascalientes', country: 'Mexico', lat: 21.7056, lng: -102.3178 },
  { code: 'ZCL', name: 'Zacatecas International Airport', city: 'Zacatecas', country: 'Mexico', lat: 22.8971, lng: -102.6869 },
  { code: 'SLP', name: 'San Luis Potosí International Airport', city: 'San Luis Potosí', country: 'Mexico', lat: 22.2543, lng: -100.9307 },
  { code: 'TAM', name: 'Tampico International Airport', city: 'Tampico', country: 'Mexico', lat: 22.2964, lng: -97.8659 },
  { code: 'VER', name: 'Veracruz International Airport', city: 'Veracruz', country: 'Mexico', lat: 19.1459, lng: -96.1873 },
  { code: 'CJS', name: 'Abraham González International Airport', city: 'Ciudad Juárez', country: 'Mexico', lat: 31.6361, lng: -106.4289 },
  { code: 'CUL', name: 'Culiacán International Airport', city: 'Culiacán', country: 'Mexico', lat: 24.7644, lng: -107.4747 },
  { code: 'LAP', name: 'La Paz International Airport', city: 'La Paz', country: 'Mexico', lat: 24.0727, lng: -110.3623 },
  { code: 'LTO', name: 'Loreto International Airport', city: 'Loreto', country: 'Mexico', lat: 25.9892, lng: -111.3479 },
  { code: 'ZIH', name: 'Ixtapa-Zihuatanejo International Airport', city: 'Zihuatanejo', country: 'Mexico', lat: 17.6016, lng: -101.4603 },
  { code: 'URG', name: 'Uruguayana Airport', city: 'Uruapan', country: 'Mexico', lat: 19.3967, lng: -102.0390 },
  
  // =========================================
  // 🇨🇴 COLOMBIA - PRIORITY COVERAGE  
  // =========================================
  
  // Major International Airports
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', lat: 4.7016, lng: -74.1469 },
  { code: 'MDE', name: 'José María Córdova International Airport', city: 'Medellín', country: 'Colombia', lat: 6.1645, lng: -75.4231 },
  { code: 'CTG', name: 'Rafael Núñez International Airport', city: 'Cartagena', country: 'Colombia', lat: 10.4424, lng: -75.5130 },
  { code: 'CLO', name: 'Alfonso Bonilla Aragón International Airport', city: 'Cali', country: 'Colombia', lat: 3.5430, lng: -76.3816 },
  { code: 'BAQ', name: 'Ernesto Cortissoz International Airport', city: 'Barranquilla', country: 'Colombia', lat: 10.8896, lng: -74.7808 },
  { code: 'SMR', name: 'Simón Bolívar International Airport', city: 'Santa Marta', country: 'Colombia', lat: 11.1196, lng: -74.2306 },
  
  // Regional & Business Airports
  { code: 'BGA', name: 'Palonegro International Airport', city: 'Bucaramanga', country: 'Colombia', lat: 7.1265, lng: -73.1848 },
  { code: 'PEI', name: 'Matecaña International Airport', city: 'Pereira', country: 'Colombia', lat: 4.8127, lng: -75.7395 },
  { code: 'ARM', name: 'El Edén International Airport', city: 'Armenia', country: 'Colombia', lat: 4.4528, lng: -75.7669 },
  { code: 'NVA', name: 'Benito Salas Airport', city: 'Neiva', country: 'Colombia', lat: 2.9515, lng: -75.2939 },
  { code: 'MZL', name: 'La Nubia Airport', city: 'Manizales', country: 'Colombia', lat: 5.0296, lng: -75.4647 },
  { code: 'APO', name: 'Antonio Roldán Betancourt Airport', city: 'Apartadó', country: 'Colombia', lat: 7.8120, lng: -76.7343 },
  { code: 'RCH', name: 'Almirante Padilla Airport', city: 'Riohacha', country: 'Colombia', lat: 11.5262, lng: -72.9260 },
  { code: 'ADZ', name: 'Gustavo Rojas Pinilla International Airport', city: 'San Andrés', country: 'Colombia', lat: 12.5836, lng: -81.7112 },
  { code: 'CUC', name: 'Camilo Daza International Airport', city: 'Cúcuta', country: 'Colombia', lat: 7.9276, lng: -72.5115 },
  { code: 'UIB', name: 'El Caraño Airport', city: 'Quibdó', country: 'Colombia', lat: 5.6908, lng: -76.6411 },
  { code: 'VVC', name: 'Vanguardia Airport', city: 'Villavicencio', country: 'Colombia', lat: 4.1687, lng: -73.6137 },
  { code: 'EYP', name: 'El Yopal Airport', city: 'Yopal', country: 'Colombia', lat: 5.3191, lng: -72.3840 },
  { code: 'IBE', name: 'Perales Airport', city: 'Ibagué', country: 'Colombia', lat: 4.4214, lng: -75.1525 },
  { code: 'PSO', name: 'Antonio Nariño Airport', city: 'Pasto', country: 'Colombia', lat: 1.3963, lng: -77.2915 },
  { code: 'FLA', name: 'Gustavo Artunduaga Paredes Airport', city: 'Florencia', country: 'Colombia', lat: 1.5892, lng: -75.5644 },
  { code: 'LET', name: 'Alfredo Vásquez Cobo International Airport', city: 'Leticia', country: 'Colombia', lat: -4.1935, lng: -69.9432 },
  { code: 'MVP', name: 'Fabio Alberto León Bentley Airport', city: 'Mitú', country: 'Colombia', lat: 1.2536, lng: -70.2339 },
  
  // =========================================
  // 🌎 CENTRAL AMERICA
  // =========================================
  
  // Guatemala
  { code: 'GUA', name: 'La Aurora International Airport', city: 'Guatemala City', country: 'Guatemala', lat: 14.5833, lng: -90.5275 },
  { code: 'FRS', name: 'Mundo Maya International Airport', city: 'Flores', country: 'Guatemala', lat: 16.9139, lng: -89.8663 },
  
  // Belize
  { code: 'BZE', name: 'Philip S. W. Goldson International Airport', city: 'Belize City', country: 'Belize', lat: 17.5394, lng: -88.3081 },
  
  // El Salvador
  { code: 'SAL', name: 'Monseñor Óscar Arnulfo Romero International Airport', city: 'San Salvador', country: 'El Salvador', lat: 13.4409, lng: -89.0558 },
  
  // Honduras
  { code: 'TGU', name: 'Toncontín International Airport', city: 'Tegucigalpa', country: 'Honduras', lat: 14.0608, lng: -87.2172 },
  { code: 'SAP', name: 'Ramón Villeda Morales International Airport', city: 'San Pedro Sula', country: 'Honduras', lat: 15.4526, lng: -87.9236 },
  { code: 'RTB', name: 'Juan Manuel Gálvez International Airport', city: 'Roatán', country: 'Honduras', lat: 16.3168, lng: -86.5230 },
  
  // Nicaragua
  { code: 'MGA', name: 'Augusto C. Sandino International Airport', city: 'Managua', country: 'Nicaragua', lat: 12.1415, lng: -86.1681 },
  
  // Costa Rica
  { code: 'SJO', name: 'Juan Santamaría International Airport', city: 'San José', country: 'Costa Rica', lat: 9.9939, lng: -84.2088 },
  { code: 'LIR', name: 'Daniel Oduber Quirós International Airport', city: 'Liberia', country: 'Costa Rica', lat: 10.5933, lng: -85.5444 },
  
  // Panama
  { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama', lat: 9.0714, lng: -79.3835 },
  { code: 'PAC', name: 'Marcos A. Gelabert International Airport', city: 'Panama City', country: 'Panama', lat: 8.9734, lng: -79.5556 },
  
  // =========================================
  // 🏝️ CARIBBEAN
  // =========================================
  
  // Bahamas
  { code: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau', country: 'Bahamas', lat: 25.0389, lng: -77.4661 },
  { code: 'FPO', name: 'Grand Bahama International Airport', city: 'Freeport', country: 'Bahamas', lat: 26.5587, lng: -78.6955 },
  
  // Cuba
  { code: 'HAV', name: 'José Martí International Airport', city: 'Havana', country: 'Cuba', lat: 23.1133, lng: -82.4086 },
  { code: 'VRA', name: 'Juan Gualberto Gómez Airport', city: 'Varadero', country: 'Cuba', lat: 23.0344, lng: -81.4353 },
  
  // Jamaica
  { code: 'KIN', name: 'Norman Manley International Airport', city: 'Kingston', country: 'Jamaica', lat: 17.9357, lng: -76.7875 },
  { code: 'MBJ', name: 'Sangster International Airport', city: 'Montego Bay', country: 'Jamaica', lat: 18.5037, lng: -77.9133 },
  
  // Dominican Republic
  { code: 'SDQ', name: 'Las Américas International Airport', city: 'Santo Domingo', country: 'Dominican Republic', lat: 18.4297, lng: -69.6689 },
  { code: 'PUJ', name: 'Punta Cana International Airport', city: 'Punta Cana', country: 'Dominican Republic', lat: 18.5674, lng: -68.3634 },
  { code: 'STI', name: 'Cibao International Airport', city: 'Santiago', country: 'Dominican Republic', lat: 19.4061, lng: -70.6042 },
  
  // Puerto Rico
  { code: 'SJU', name: 'Luis Muñoz Marín International Airport', city: 'San Juan', country: 'Puerto Rico', lat: 18.4394, lng: -66.0018 },
  
  // =========================================
  // 🇧🇷 BRAZIL
  // =========================================
  
  // Major International Airports
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731 },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.8099, lng: -43.2505 },
  { code: 'BSB', name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil', lat: -15.8711, lng: -47.9172 },
  { code: 'CGH', name: 'São Paulo/Congonhas Airport', city: 'São Paulo', country: 'Brazil', lat: -23.6266, lng: -46.6554 },
  { code: 'SDU', name: 'Santos Dumont Airport', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9105, lng: -43.1631 },
  { code: 'SSA', name: 'Salvador Bahia Airport', city: 'Salvador', country: 'Brazil', lat: -12.9108, lng: -38.3308 },
  { code: 'FOR', name: 'Fortaleza International Airport', city: 'Fortaleza', country: 'Brazil', lat: -3.7763, lng: -38.5327 },
  { code: 'REC', name: 'Recife International Airport', city: 'Recife', country: 'Brazil', lat: -8.1264, lng: -34.9236 },
  { code: 'BEL', name: 'Belém International Airport', city: 'Belém', country: 'Brazil', lat: -1.3792, lng: -48.4761 },
  { code: 'MAO', name: 'Manaus Eduardo Gomes International Airport', city: 'Manaus', country: 'Brazil', lat: -3.0386, lng: -60.0497 },
  
  // =========================================
  // 🇦🇷 ARGENTINA
  // =========================================
  
  { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina', lat: -34.8222, lng: -58.5358 },
  { code: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', country: 'Argentina', lat: -34.5592, lng: -58.4156 },
  { code: 'COR', name: 'Córdoba Airport', city: 'Córdoba', country: 'Argentina', lat: -31.3236, lng: -64.2080 },
  { code: 'MDZ', name: 'Governor Francisco Gabrielli International Airport', city: 'Mendoza', country: 'Argentina', lat: -32.8317, lng: -68.7928 },
  { code: 'IGR', name: 'Cataratas del Iguazú International Airport', city: 'Puerto Iguazú', country: 'Argentina', lat: -25.7372, lng: -54.4735 },
  { code: 'BRC', name: 'San Carlos de Bariloche Airport', city: 'San Carlos de Bariloche', country: 'Argentina', lat: -41.1511, lng: -71.1575 },
  
  // =========================================
  // 🇨🇱 CHILE
  // =========================================
  
  { code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', lat: -33.3928, lng: -70.7856 },
  { code: 'IPC', name: 'Mataveri International Airport', city: 'Easter Island', country: 'Chile', lat: -27.1648, lng: -109.4219 },
  
  // =========================================
  // 🇵🇪 PERU
  // =========================================
  
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', lat: -12.0219, lng: -77.1143 },
  { code: 'CUZ', name: 'Alejandro Velasco Astete International Airport', city: 'Cusco', country: 'Peru', lat: -13.5358, lng: -71.9389 },
  { code: 'AQP', name: 'Alfredo Rodríguez Ballón International Airport', city: 'Arequipa', country: 'Peru', lat: -16.3411, lng: -71.5830 },
  
  // =========================================
  // 🇪🇨 ECUADOR
  // =========================================
  
  { code: 'UIO', name: 'Mariscal Sucre International Airport', city: 'Quito', country: 'Ecuador', lat: -0.1292, lng: -78.3575 },
  { code: 'GYE', name: 'José Joaquín de Olmedo International Airport', city: 'Guayaquil', country: 'Ecuador', lat: -2.1574, lng: -79.8836 },
  { code: 'GPS', name: 'Seymour Airport', city: 'Galápagos', country: 'Ecuador', lat: -0.4536, lng: -90.2659 },
  
  // =========================================
  // 🇻🇪 VENEZUELA
  // =========================================
  
  { code: 'CCS', name: 'Simón Bolívar International Airport', city: 'Caracas', country: 'Venezuela', lat: 10.6013, lng: -66.9911 },
  { code: 'MAR', name: 'La Chinita International Airport', city: 'Maracaibo', country: 'Venezuela', lat: 10.5583, lng: -71.7278 },
  
  // =========================================
  // 🇺🇾 URUGUAY
  // =========================================
  
  { code: 'MVD', name: 'Carrasco International Airport', city: 'Montevideo', country: 'Uruguay', lat: -34.8384, lng: -56.0308 },
  
  // =========================================
  // 🇵🇾 PARAGUAY
  // =========================================
  
  { code: 'ASU', name: 'Silvio Pettirossi International Airport', city: 'Asunción', country: 'Paraguay', lat: -25.2400, lng: -57.5194 },
  
  // =========================================
  // 🇧🇴 BOLIVIA
  // =========================================
  
  { code: 'LPB', name: 'El Alto International Airport', city: 'La Paz', country: 'Bolivia', lat: -16.5133, lng: -68.1925 },
  { code: 'VVI', name: 'Viru Viru International Airport', city: 'Santa Cruz', country: 'Bolivia', lat: -17.6448, lng: -63.1356 }
];

console.log(`📊 Preparing to insert ${airports.length} airports across the Americas...`);

// Prepare insert statement
const insertAirport = db.prepare(`
  INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) 
  VALUES (?, ?, ?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP)
`);

// Insert airports with detailed logging
let inserted = 0;
let skipped = 0;
const insertedByCountry = {};

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
      insertedByCountry[airport.country] = (insertedByCountry[airport.country] || 0) + 1;
      
      // Highlight priority countries
      const flag = airport.country === 'Mexico' ? '🇲🇽⭐' : 
                   airport.country === 'Colombia' ? '🇨🇴⭐' : 
                   '✅';
      console.log(`${flag} Added: ${airport.code} - ${airport.name} (${airport.city}, ${airport.country})`);
    } else {
      skipped++;
      console.log(`⚠️  Skipped: ${airport.code} - Already exists (${airport.city}, ${airport.country})`);
    }
  } catch (error) {
    console.error(`❌ Error adding ${airport.code}:`, error.message);
  }
});

// Create additional indexes for the expanded dataset
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_airports_region ON airports(country, city);
    CREATE INDEX IF NOT EXISTS idx_airports_location ON airports(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_airports_search_full ON airports(code, name, city, country);
  `);
  console.log('📊 Created additional database indexes for Americas coverage');
} catch (error) {
  console.error('❌ Error creating indexes:', error.message);
}

// Comprehensive results
const totalCount = db.prepare('SELECT COUNT(*) as count FROM airports').get().count;
const approvedCount = db.prepare('SELECT COUNT(*) as count FROM airports WHERE status = ?').get('approved').count;

// Country breakdown
const countryStats = db.prepare(`
  SELECT country, COUNT(*) as count 
  FROM airports 
  WHERE status = 'approved' 
  GROUP BY country 
  ORDER BY count DESC
`).all();

console.log('\n🎯 COMPREHENSIVE AMERICAS MIGRATION RESULTS:');
console.log('='.repeat(50));
console.log(`📝 New airports inserted: ${inserted}`);
console.log(`⚠️  Existing airports skipped: ${skipped}`);
console.log(`📊 Total airports in database: ${totalCount}`);
console.log(`✅ Total approved airports: ${approvedCount}`);

console.log('\n🌎 NEW AIRPORTS BY COUNTRY:');
Object.entries(insertedByCountry)
  .sort((a, b) => b[1] - a[1])
  .forEach(([country, count]) => {
    const flag = country === 'Mexico' ? '🇲🇽⭐' : 
                 country === 'Colombia' ? '🇨🇴⭐' : 
                 country === 'USA' ? '🇺🇸' :
                 country === 'Brazil' ? '🇧🇷' :
                 country === 'Argentina' ? '🇦🇷' : '🌎';
    console.log(`   ${flag} ${country}: +${count} airports`);
  });

console.log('\n🏆 TOTAL COVERAGE BY COUNTRY:');
countryStats.forEach(stat => {
  const flag = stat.country === 'Mexico' ? '🇲🇽⭐' : 
               stat.country === 'Colombia' ? '🇨🇴⭐' : 
               stat.country === 'USA' ? '🇺🇸' :
               stat.country === 'Brazil' ? '🇧🇷' :
               stat.country === 'Argentina' ? '🇦🇷' : '🌎';
  console.log(`   ${flag} ${stat.country}: ${stat.count} airports`);
});

// Show major cities with multiple airports
const multiAirportCities = db.prepare(`
  SELECT city, country, COUNT(*) as airport_count, GROUP_CONCAT(code) as codes
  FROM airports 
  WHERE status = 'approved' 
  GROUP BY city, country 
  HAVING COUNT(*) > 1
  ORDER BY airport_count DESC
`).all();

if (multiAirportCities.length > 0) {
  console.log('\n🏙️ CITIES WITH MULTIPLE AIRPORTS:');
  multiAirportCities.forEach(city => {
    console.log(`   ${city.city}, ${city.country}: ${city.airport_count} airports (${city.codes})`);
  });
}

db.close();
console.log('\n🚀 Americas airport migration completed successfully!');
console.log('🎯 Your JetChance platform now has comprehensive coverage of the Americas!');
console.log('⭐ Special focus on Mexico and Colombia as requested!');