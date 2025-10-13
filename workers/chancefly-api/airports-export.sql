-- Airport Data Export for JetChance D1
-- Exported: 2025-10-08T17:24:37.318Z
-- Total airports: 142
-- ========================================================================
-- This file contains all airports from the production database
-- Run with: wrangler d1 execute jetchance_db --file=./airports-export.sql
-- ========================================================================


-- Argentina (6 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('AEP', 'Jorge Newbery Airfield', 'Buenos Aires', 'Argentina', -34.5592, -58.4156, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('EZE', 'Ezeiza International Airport', 'Buenos Aires', 'Argentina', -34.8222, -58.5358, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('COR', 'Córdoba Airport', 'Córdoba', 'Argentina', -31.3236, -64.208, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MDZ', 'Governor Francisco Gabrielli International Airport', 'Mendoza', 'Argentina', -32.8317, -68.7928, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('IGR', 'Cataratas del Iguazú International Airport', 'Puerto Iguazú', 'Argentina', -25.7372, -54.4735, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BRC', 'San Carlos de Bariloche Airport', 'San Carlos de Bariloche', 'Argentina', -41.1511, -71.1575, 'approved', CURRENT_TIMESTAMP);

-- Bahamas (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('FPO', 'Grand Bahama International Airport', 'Freeport', 'Bahamas', 26.5587, -78.6955, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('NAS', 'Lynden Pindling International Airport', 'Nassau', 'Bahamas', 25.0389, -77.4661, 'approved', CURRENT_TIMESTAMP);

-- Belize (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BZE', 'Philip S. W. Goldson International Airport', 'Belize City', 'Belize', 17.5394, -88.3081, 'approved', CURRENT_TIMESTAMP);

-- Bolivia (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LPB', 'El Alto International Airport', 'La Paz', 'Bolivia', -16.5133, -68.1925, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('VVI', 'Viru Viru International Airport', 'Santa Cruz', 'Bolivia', -17.6448, -63.1356, 'approved', CURRENT_TIMESTAMP);

-- Brazil (10 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BEL', 'Belém International Airport', 'Belém', 'Brazil', -1.3792, -48.4761, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BSB', 'Brasília International Airport', 'Brasília', 'Brazil', -15.8711, -47.9172, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('FOR', 'Fortaleza International Airport', 'Fortaleza', 'Brazil', -3.7763, -38.5327, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MAO', 'Manaus Eduardo Gomes International Airport', 'Manaus', 'Brazil', -3.0386, -60.0497, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('REC', 'Recife International Airport', 'Recife', 'Brazil', -8.1264, -34.9236, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('GIG', 'Rio de Janeiro/Galeão International Airport', 'Rio de Janeiro', 'Brazil', -22.8099, -43.2505, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SDU', 'Santos Dumont Airport', 'Rio de Janeiro', 'Brazil', -22.9105, -43.1631, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SSA', 'Salvador Bahia Airport', 'Salvador', 'Brazil', -12.9108, -38.3308, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CGH', 'São Paulo/Congonhas Airport', 'São Paulo', 'Brazil', -23.6266, -46.6554, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('GRU', 'São Paulo/Guarulhos International Airport', 'São Paulo', 'Brazil', -23.4356, -46.4731, 'approved', CURRENT_TIMESTAMP);

-- Chile (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('IPC', 'Mataveri International Airport', 'Easter Island', 'Chile', -27.1648, -109.4219, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SCL', 'Arturo Merino Benítez International Airport', 'Santiago', 'Chile', -33.3928, -70.7856, 'approved', CURRENT_TIMESTAMP);

-- Colombia (23 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('APO', 'Antonio Roldán Betancourt Airport', 'Apartadó', 'Colombia', 7.812, -76.7343, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ARM', 'El Edén International Airport', 'Armenia', 'Colombia', 4.4528, -75.7669, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BAQ', 'Ernesto Cortissoz International Airport', 'Barranquilla', 'Colombia', 10.8896, -74.7808, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BOG', 'El Dorado International Airport', 'Bogotá', 'Colombia', 4.7016, -74.1469, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BGA', 'Palonegro International Airport', 'Bucaramanga', 'Colombia', 7.1265, -73.1848, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CLO', 'Alfonso Bonilla Aragón International Airport', 'Cali', 'Colombia', 3.543, -76.3816, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CTG', 'Rafael Núñez International Airport', 'Cartagena', 'Colombia', 10.4424, -75.513, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CUC', 'Camilo Daza International Airport', 'Cúcuta', 'Colombia', 7.9276, -72.5115, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('FLA', 'Gustavo Artunduaga Paredes Airport', 'Florencia', 'Colombia', 1.5892, -75.5644, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('IBE', 'Perales Airport', 'Ibagué', 'Colombia', 4.4214, -75.1525, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LET', 'Alfredo Vásquez Cobo International Airport', 'Leticia', 'Colombia', -4.1935, -69.9432, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MZL', 'La Nubia Airport', 'Manizales', 'Colombia', 5.0296, -75.4647, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MDE', 'José María Córdova International Airport', 'Medellín', 'Colombia', 6.1645, -75.4231, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MVP', 'Fabio Alberto León Bentley Airport', 'Mitú', 'Colombia', 1.2536, -70.2339, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('NVA', 'Benito Salas Airport', 'Neiva', 'Colombia', 2.9515, -75.2939, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PSO', 'Antonio Nariño Airport', 'Pasto', 'Colombia', 1.3963, -77.2915, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PEI', 'Matecaña International Airport', 'Pereira', 'Colombia', 4.8127, -75.7395, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('UIB', 'El Caraño Airport', 'Quibdó', 'Colombia', 5.6908, -76.6411, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('RCH', 'Almirante Padilla Airport', 'Riohacha', 'Colombia', 11.5262, -72.926, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ADZ', 'Gustavo Rojas Pinilla International Airport', 'San Andrés', 'Colombia', 12.5836, -81.7112, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SMR', 'Simón Bolívar International Airport', 'Santa Marta', 'Colombia', 11.1196, -74.2306, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('VVC', 'Vanguardia Airport', 'Villavicencio', 'Colombia', 4.1687, -73.6137, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('EYP', 'El Yopal Airport', 'Yopal', 'Colombia', 5.3191, -72.384, 'approved', CURRENT_TIMESTAMP);

-- Costa Rica (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LIR', 'Daniel Oduber Quirós International Airport', 'Liberia', 'Costa Rica', 10.5933, -85.5444, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SJO', 'Juan Santamaría International Airport', 'San José', 'Costa Rica', 9.9939, -84.2088, 'approved', CURRENT_TIMESTAMP);

-- Cuba (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('HAV', 'José Martí International Airport', 'Havana', 'Cuba', 23.1133, -82.4086, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('VRA', 'Juan Gualberto Gómez Airport', 'Varadero', 'Cuba', 23.0344, -81.4353, 'approved', CURRENT_TIMESTAMP);

-- Dominican Republic (3 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PUJ', 'Punta Cana International Airport', 'Punta Cana', 'Dominican Republic', 18.5674, -68.3634, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('STI', 'Cibao International Airport', 'Santiago', 'Dominican Republic', 19.4061, -70.6042, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SDQ', 'Las Américas International Airport', 'Santo Domingo', 'Dominican Republic', 18.4297, -69.6689, 'approved', CURRENT_TIMESTAMP);

-- Ecuador (3 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('GPS', 'Seymour Airport', 'Galápagos', 'Ecuador', -0.4536, -90.2659, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('GYE', 'José Joaquín de Olmedo International Airport', 'Guayaquil', 'Ecuador', -2.1574, -79.8836, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('UIO', 'Mariscal Sucre International Airport', 'Quito', 'Ecuador', -0.1292, -78.3575, 'approved', CURRENT_TIMESTAMP);

-- El Salvador (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SAL', 'Monseñor Óscar Arnulfo Romero International Airport', 'San Salvador', 'El Salvador', 13.4409, -89.0558, 'approved', CURRENT_TIMESTAMP);

-- France (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 49.0097, 2.5479, 'approved', CURRENT_TIMESTAMP);

-- Guatemala (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('FRS', 'Mundo Maya International Airport', 'Flores', 'Guatemala', 16.9139, -89.8663, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('GUA', 'La Aurora International Airport', 'Guatemala City', 'Guatemala', 14.5833, -90.5275, 'approved', CURRENT_TIMESTAMP);

-- Honduras (3 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('RTB', 'Juan Manuel Gálvez International Airport', 'Roatán', 'Honduras', 16.3168, -86.523, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SAP', 'Ramón Villeda Morales International Airport', 'San Pedro Sula', 'Honduras', 15.4526, -87.9236, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('TGU', 'Toncontín International Airport', 'Tegucigalpa', 'Honduras', 14.0608, -87.2172, 'approved', CURRENT_TIMESTAMP);

-- Jamaica (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('KIN', 'Norman Manley International Airport', 'Kingston', 'Jamaica', 17.9357, -76.7875, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MBJ', 'Sangster International Airport', 'Montego Bay', 'Jamaica', 18.5037, -77.9133, 'approved', CURRENT_TIMESTAMP);

-- Mexico (29 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ACA', 'Acapulco International Airport', 'Acapulco', 'Mexico', 16.7571, -99.754, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('AGU', 'Aguascalientes International Airport', 'Aguascalientes', 'Mexico', 21.7056, -102.3178, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CUN', 'Cancún International Airport', 'Cancún', 'Mexico', 21.0365, -86.8771, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CJS', 'Abraham González International Airport', 'Ciudad Juárez', 'Mexico', 31.6361, -106.4289, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CZM', 'Cozumel International Airport', 'Cozumel', 'Mexico', 20.5224, -86.9256, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CUL', 'Culiacán International Airport', 'Culiacán', 'Mexico', 24.7644, -107.4747, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('GDL', 'Miguel Hidalgo y Costilla Guadalajara International Airport', 'Guadalajara', 'Mexico', 20.5218, -103.3112, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('HUX', 'Bahías de Huatulco International Airport', 'Huatulco', 'Mexico', 15.7753, -96.2628, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LAP', 'La Paz International Airport', 'La Paz', 'Mexico', 24.0727, -110.3623, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BJX', 'Bajío International Airport', 'León/Bajío', 'Mexico', 21.0056, -101.481, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LTO', 'Loreto International Airport', 'Loreto', 'Mexico', 25.9892, -111.3479, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SJD', 'Los Cabos International Airport', 'Los Cabos', 'Mexico', 23.1518, -109.7721, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MZT', 'Mazatlán International Airport', 'Mazatlán', 'Mexico', 23.1614, -106.2659, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('AAA', 'Airport_name', 'Mexico City', 'Mexico', 19.4326, -99.1332, 'pending', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MEX', 'Mexico City International Airport', 'Mexico City', 'Mexico', 19.4363, -99.0721, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MTY', 'Monterrey International Airport', 'Monterrey', 'Mexico', 25.7785, -100.1077, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MLM', 'Morelia International Airport', 'Morelia', 'Mexico', 19.8497, -101.025, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MID', 'Manuel Crescencio Rejón International Airport', 'Mérida', 'Mexico', 20.937, -89.6577, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('OAX', 'Xoxocotlán International Airport', 'Oaxaca', 'Mexico', 17.0006, -96.7267, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PVR', 'Puerto Vallarta International Airport', 'Puerto Vallarta', 'Mexico', 20.6801, -105.2544, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('QRO', 'Querétaro Intercontinental Airport', 'Querétaro', 'Mexico', 20.6173, -100.1857, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SLP', 'San Luis Potosí International Airport', 'San Luis Potosí', 'Mexico', 22.2543, -100.9307, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('TAM', 'Tampico International Airport', 'Tampico', 'Mexico', 22.2964, -97.8659, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('TIJ', 'Tijuana International Airport', 'Tijuana', 'Mexico', 32.5411, -116.97, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('URG', 'Uruguayana Airport', 'Uruapan', 'Mexico', 19.3967, -102.039, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('VER', 'Veracruz International Airport', 'Veracruz', 'Mexico', 19.1459, -96.1873, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('VSA', 'Carlos Rovirosa Pérez International Airport', 'Villahermosa', 'Mexico', 17.997, -92.8175, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ZCL', 'Zacatecas International Airport', 'Zacatecas', 'Mexico', 22.8971, -102.6869, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ZIH', 'Ixtapa-Zihuatanejo International Airport', 'Zihuatanejo', 'Mexico', 17.6016, -101.4603, 'approved', CURRENT_TIMESTAMP);

-- Nicaragua (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MGA', 'Augusto C. Sandino International Airport', 'Managua', 'Nicaragua', 12.1415, -86.1681, 'approved', CURRENT_TIMESTAMP);

-- Panama (2 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PAC', 'Marcos A. Gelabert International Airport', 'Panama City', 'Panama', 8.9734, -79.5556, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PTY', 'Tocumen International Airport', 'Panama City', 'Panama', 9.0714, -79.3835, 'approved', CURRENT_TIMESTAMP);

-- Paraguay (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ASU', 'Silvio Pettirossi International Airport', 'Asunción', 'Paraguay', -25.24, -57.5194, 'approved', CURRENT_TIMESTAMP);

-- Peru (3 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('AQP', 'Alfredo Rodríguez Ballón International Airport', 'Arequipa', 'Peru', -16.3411, -71.583, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CUZ', 'Alejandro Velasco Astete International Airport', 'Cusco', 'Peru', -13.5358, -71.9389, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LIM', 'Jorge Chávez International Airport', 'Lima', 'Peru', -12.0219, -77.1143, 'approved', CURRENT_TIMESTAMP);

-- Puerto Rico (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SJU', 'Luis Muñoz Marín International Airport', 'San Juan', 'Puerto Rico', 18.4394, -66.0018, 'approved', CURRENT_TIMESTAMP);

-- Switzerland (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ZUR', 'Zurich Airport', 'Zurich', 'Switzerland', 47.4647, 8.5492, 'approved', CURRENT_TIMESTAMP);

-- UK (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LHR', 'Heathrow Airport', 'London', 'UK', 51.47, -0.4543, 'approved', CURRENT_TIMESTAMP);

-- USA (34 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('AUS', 'Austin-Bergstrom International Airport', 'Austin', 'USA', 30.1975, -97.6664, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BCT', 'Boca Raton Airport', 'Boca Raton', 'USA', 26.3784, -80.1077, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BUR', 'Hollywood Burbank Airport', 'Burbank', 'USA', 34.2007, -118.3585, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CRQ', 'McClellan-Palomar Airport', 'Carlsbad', 'USA', 33.1283, -117.2803, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ORD', 'Chicago O''Hare International Airport', 'Chicago', 'USA', 41.9742, -87.9073, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('DAL', 'Dallas Love Field', 'Dallas', 'USA', 32.8471, -96.8518, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('DFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'USA', 32.8968, -97.038, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('ELP', 'El Paso International Airport', 'El Paso', 'USA', 31.8072, -106.3781, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('FLL', 'Fort Lauderdale-Hollywood International Airport', 'Fort Lauderdale', 'USA', 26.0742, -80.1506, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('FXE', 'Fort Lauderdale Executive Airport', 'Fort Lauderdale', 'USA', 26.1973, -80.1707, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('HND', 'Henderson Executive Airport', 'Henderson', 'USA', 35.9728, -115.1343, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('HOU', 'William P. Hobby Airport', 'Houston', 'USA', 29.6454, -95.2789, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('IAH', 'George Bush Intercontinental Airport', 'Houston', 'USA', 29.9844, -95.3414, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('JAX', 'Jacksonville International Airport', 'Jacksonville', 'USA', 30.4941, -81.6878, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LAS', 'Harry Reid International Airport', 'Las Vegas', 'USA', 36.084, -115.1537, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LGB', 'Long Beach Airport', 'Long Beach', 'USA', 33.8177, -118.1516, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 33.9425, -118.4081, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MIA', 'Miami International Airport', 'Miami', 'USA', 25.7959, -80.287, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('TMB', 'Miami Executive Airport', 'Miami', 'USA', 25.6479, -80.4328, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MAF', 'Midland International Air and Space Port', 'Midland', 'USA', 31.9425, -102.2019, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 40.6413, -73.7781, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('OPF', 'Miami-Opa Locka Executive Airport', 'Opa-locka', 'USA', 25.907, -80.2784, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SNA', 'John Wayne Airport', 'Orange County', 'USA', 33.6762, -117.8682, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MCO', 'Orlando International Airport', 'Orlando', 'USA', 28.4294, -81.3089, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PHX', 'Phoenix Sky Harbor International Airport', 'Phoenix', 'USA', 33.4343, -112.0118, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SAT', 'San Antonio International Airport', 'San Antonio', 'USA', 29.5337, -98.4698, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SAN', 'San Diego International Airport', 'San Diego', 'USA', 32.7336, -117.1897, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SFO', 'San Francisco International Airport', 'San Francisco', 'USA', 37.6213, -122.379, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('SDL', 'Scottsdale Airport', 'Scottsdale', 'USA', 33.6229, -111.9107, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('TPA', 'Tampa International Airport', 'Tampa', 'USA', 27.9755, -82.5332, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('TST', 'Test Airport for Operator', 'Test City', 'USA', 15.98668, -76.030776, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('TEB', 'Teterboro Airport', 'Teterboro', 'USA', 40.8501, -74.0606, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('VNY', 'Van Nuys Airport', 'Van Nuys', 'USA', 34.2098, -118.4885, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('PBI', 'Palm Beach International Airport', 'West Palm Beach', 'USA', 26.6832, -80.0956, 'approved', CURRENT_TIMESTAMP);

-- Uruguay (1 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MVD', 'Carrasco International Airport', 'Montevideo', 'Uruguay', -34.8384, -56.0308, 'approved', CURRENT_TIMESTAMP);

-- Venezuela (3 airports)
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('CCS', 'Simón Bolívar International Airport', 'Caracas', 'Venezuela', 10.6013, -66.9911, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('MAR', 'La Chinita International Airport', 'Maracaibo', 'Venezuela', 10.5583, -71.7278, 'approved', CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES ('BBB', 'Airport name', 'San Cristóbal', 'Venezuela', 7.7669, -72.2252, 'pending', CURRENT_TIMESTAMP);

-- ========================================================================
-- Export complete: 142 airports
-- Distribution by country:
--   Argentina: 6 airports
--   Bahamas: 2 airports
--   Belize: 1 airports
--   Bolivia: 2 airports
--   Brazil: 10 airports
--   Chile: 2 airports
--   Colombia: 23 airports
--   Costa Rica: 2 airports
--   Cuba: 2 airports
--   Dominican Republic: 3 airports
--   Ecuador: 3 airports
--   El Salvador: 1 airports
--   France: 1 airports
--   Guatemala: 2 airports
--   Honduras: 3 airports
--   Jamaica: 2 airports
--   Mexico: 29 airports
--   Nicaragua: 1 airports
--   Panama: 2 airports
--   Paraguay: 1 airports
--   Peru: 3 airports
--   Puerto Rico: 1 airports
--   Switzerland: 1 airports
--   UK: 1 airports
--   USA: 34 airports
--   Uruguay: 1 airports
--   Venezuela: 3 airports
-- ========================================================================
