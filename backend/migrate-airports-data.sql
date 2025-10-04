-- Airport Database Migration Script
-- Migrate hardcoded airports to database for better management

-- First, let's add all the hardcoded airports to the database
-- This script should be run once to populate the airports table

-- Major US Airports
INSERT OR IGNORE INTO airports (code, name, city, country, latitude, longitude, status, created_at) VALUES
-- Major US Commercial Airports
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 33.9425, -118.4081, 'approved', CURRENT_TIMESTAMP),
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 40.6413, -73.7781, 'approved', CURRENT_TIMESTAMP),
('LGA', 'LaGuardia Airport', 'New York', 'USA', 40.7769, -73.8740, 'approved', CURRENT_TIMESTAMP),
('EWR', 'Newark Liberty International Airport', 'Newark', 'USA', 40.6895, -74.1745, 'approved', CURRENT_TIMESTAMP),
('ORD', 'Chicago O\'Hare International Airport', 'Chicago', 'USA', 41.9742, -87.9073, 'approved', CURRENT_TIMESTAMP),
('MDW', 'Chicago Midway International Airport', 'Chicago', 'USA', 41.7868, -87.7522, 'approved', CURRENT_TIMESTAMP),
('MIA', 'Miami International Airport', 'Miami', 'USA', 25.7959, -80.2870, 'approved', CURRENT_TIMESTAMP),
('FLL', 'Fort Lauderdale-Hollywood International Airport', 'Fort Lauderdale', 'USA', 26.0742, -80.1506, 'approved', CURRENT_TIMESTAMP),
('PBI', 'Palm Beach International Airport', 'West Palm Beach', 'USA', 26.6832, -80.0956, 'approved', CURRENT_TIMESTAMP),
('LAS', 'Harry Reid International Airport', 'Las Vegas', 'USA', 36.0840, -115.1537, 'approved', CURRENT_TIMESTAMP),
('SFO', 'San Francisco International Airport', 'San Francisco', 'USA', 37.6213, -122.3790, 'approved', CURRENT_TIMESTAMP),
('SJC', 'Norman Y. Mineta San José International Airport', 'San Jose', 'USA', 37.3639, -121.9289, 'approved', CURRENT_TIMESTAMP),
('OAK', 'Oakland International Airport', 'Oakland', 'USA', 37.7214, -122.2208, 'approved', CURRENT_TIMESTAMP),

-- Private Jet Friendly Airports
('TEB', 'Teterboro Airport', 'Teterboro', 'USA', 40.8501, -74.0606, 'approved', CURRENT_TIMESTAMP),
('HPN', 'Westchester County Airport', 'White Plains', 'USA', 41.0669, -73.7076, 'approved', CURRENT_TIMESTAMP),
('VNY', 'Van Nuys Airport', 'Van Nuys', 'USA', 34.2098, -118.4885, 'approved', CURRENT_TIMESTAMP),
('BED', 'Laurence G. Hanscom Field', 'Bedford', 'USA', 42.4699, -71.2886, 'approved', CURRENT_TIMESTAMP),

-- Colombian Airports  
('BOG', 'El Dorado International Airport', 'Bogotá', 'Colombia', 4.7016, -74.1469, 'approved', CURRENT_TIMESTAMP),
('MDE', 'José María Córdova International Airport', 'Medellín', 'Colombia', 6.1645, -75.4231, 'approved', CURRENT_TIMESTAMP),
('CTG', 'Rafael Núñez International Airport', 'Cartagena', 'Colombia', 10.4424, -75.5130, 'approved', CURRENT_TIMESTAMP),
('CLO', 'Alfonso Bonilla Aragón International Airport', 'Cali', 'Colombia', 3.5430, -76.3816, 'approved', CURRENT_TIMESTAMP),
('BAQ', 'Ernesto Cortissoz International Airport', 'Barranquilla', 'Colombia', 10.8896, -74.7808, 'approved', CURRENT_TIMESTAMP),
('SMR', 'Simón Bolívar International Airport', 'Santa Marta', 'Colombia', 11.1196, -74.2306, 'approved', CURRENT_TIMESTAMP),

-- Mexican Airports
('MEX', 'Mexico City International Airport', 'Mexico City', 'Mexico', 19.4363, -99.0721, 'approved', CURRENT_TIMESTAMP),
('CUN', 'Cancún International Airport', 'Cancún', 'Mexico', 21.0365, -86.8771, 'approved', CURRENT_TIMESTAMP),
('GDL', 'Miguel Hidalgo y Costilla Guadalajara International Airport', 'Guadalajara', 'Mexico', 20.5218, -103.3112, 'approved', CURRENT_TIMESTAMP),
('MTY', 'Monterrey International Airport', 'Monterrey', 'Mexico', 25.7785, -100.1077, 'approved', CURRENT_TIMESTAMP),

-- Brazilian Airports
('GRU', 'São Paulo/Guarulhos International Airport', 'São Paulo', 'Brazil', -23.4356, -46.4731, 'approved', CURRENT_TIMESTAMP),
('GIG', 'Rio de Janeiro/Galeão International Airport', 'Rio de Janeiro', 'Brazil', -22.8099, -43.2505, 'approved', CURRENT_TIMESTAMP),

-- European Airports (High-demand private jet destinations)
('LHR', 'Heathrow Airport', 'London', 'UK', 51.4700, -0.4543, 'approved', CURRENT_TIMESTAMP),
('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 49.0097, 2.5479, 'approved', CURRENT_TIMESTAMP),
('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', 50.0264, 8.5434, 'approved', CURRENT_TIMESTAMP),
('ZUR', 'Zurich Airport', 'Zurich', 'Switzerland', 47.4647, 8.5492, 'approved', CURRENT_TIMESTAMP);

-- Update metadata
UPDATE airports SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_airports_status ON airports(status);
CREATE INDEX IF NOT EXISTS idx_airports_city ON airports(city);
CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);
CREATE INDEX IF NOT EXISTS idx_airports_code ON airports(code);
CREATE INDEX IF NOT EXISTS idx_airports_search ON airports(code, name, city);