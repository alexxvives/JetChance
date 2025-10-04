-- Sample data for JetChance D1 database

-- Insert test users (using proper bcrypt hashes)
INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, role) 
VALUES 
  ('test-customer-1', 'test@example.com', '$2b$12$qVt8r7v0G.6PfT/ljpmm2.nQTgg.F02V5RTNMfrhpiOgOckpOOMiC', 'Test', 'User', 'customer'),
  ('test-operator-1', 'operator@example.com', '$2b$12$UYMN53DPe.XgPCur.jGk1uOpIH.des3kJP6gqrwPWedHeOcwAjhTC', 'Test', 'Operator', 'operator');

-- Insert test operator profile
INSERT OR REPLACE INTO operators (id, user_id, company_name, status) 
VALUES ('op-test-1', 'test-operator-1', 'Test Aviation Company', 'approved');

-- Insert sample flights
INSERT OR REPLACE INTO flights (
  id, operator_id, origin, destination, origin_code, destination_code,
  departure_time, arrival_time, aircraft_type, aircraft_image,
  price, original_price, seats_available, operator_name, duration,
  origin_lat, origin_lng, destination_lat, destination_lng, status
) VALUES 
  (1, 'op-test-1', 'Los Angeles', 'New York', 'LAX', 'JFK', 
   '2025-09-20 08:00:00', '2025-09-20 16:30:00', 'Gulfstream G650',
   'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800', 
   15000.00, 18000.00, 8, 'Test Aviation Company', '5h 30m',
   33.9425, -118.4081, 40.6413, -73.7781, 'active'),
   
  (2, 'op-test-1', 'New York', 'Miami', 'JFK', 'MIA',
   '2025-09-21 10:00:00', '2025-09-21 13:00:00', 'Cessna Citation X+',
   'https://images.unsplash.com/photo-1569629473203-79e57bb25498?w=800',
   8500.00, 10000.00, 6, 'Test Aviation Company', '3h 00m',
   40.6413, -73.7781, 25.7959, -80.2870, 'active'),
   
  (3, 'op-test-1', 'Miami', 'Las Vegas', 'MIA', 'LAS',
   '2025-09-22 14:00:00', '2025-09-22 17:30:00', 'Bombardier Global 7500',
   'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800',
   12500.00, 14000.00, 10, 'Test Aviation Company', '4h 30m',
   25.7959, -80.2870, 36.0840, -115.1537, 'active'),
   
  (4, 'op-test-1', 'Las Vegas', 'San Francisco', 'LAS', 'SFO',
   '2025-09-23 09:00:00', '2025-09-23 10:30:00', 'Embraer Phenom 300E',
   'https://images.unsplash.com/photo-1583829227760-9ff9eae26099?w=800',
   6500.00, 7500.00, 4, 'Test Aviation Company', '1h 30m',
   36.0840, -115.1537, 37.6213, -122.3790, 'active'),
   
  (5, 'op-test-1', 'San Francisco', 'Seattle', 'SFO', 'SEA',
   '2025-09-24 11:00:00', '2025-09-24 13:00:00', 'HondaJet Elite S',
   'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800',
   4500.00, 5000.00, 5, 'Test Aviation Company', '2h 00m',
   37.6213, -122.3790, 47.4502, -122.3088, 'active');