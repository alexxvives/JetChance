-- JetChance Database Schema - Optimized for Colombian Flight Booking MVP
-- ========================================================================
-- ⚠️  WARNING: DO NOT ADD COLUMNS WITHOUT EXPLICIT APPROVAL
-- This schema is optimized for MVP launch in Colombian market
-- ========================================================================

-- Users table - Authentication and basic user info
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- Sequential: US0001, US0002, etc.
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers table - Customer profiles
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,                    -- Sequential: CU0001, CU0002, etc.
  user_id TEXT NOT NULL,
  phone TEXT,
  document_number TEXT,
  document_type TEXT DEFAULT 'CC',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Operators table - Flight operators (simplified)
CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,                    -- Sequential: OP0001, OP0002, etc.
  auth_user_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  total_flights INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auth_user_id) REFERENCES users (id)
);

-- Flights table - Available flights (optimized)
CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,                    -- Sequential: FL0001, FL0002, etc.
  operator_id TEXT NOT NULL,
  flight_number TEXT,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  origin_code TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  departure_datetime DATETIME NOT NULL,
  arrival_datetime DATETIME NOT NULL,
  aircraft_name TEXT NOT NULL,
  aircraft_image_url TEXT,
  empty_leg_price REAL NOT NULL,
  currency TEXT DEFAULT 'COP',           -- Colombian Pesos
  available_seats INTEGER DEFAULT 1,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (operator_id) REFERENCES operators (id)
);
  FOREIGN KEY (operator_id) REFERENCES operators (id) ON DELETE CASCADE
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  flight_id INTEGER NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  booking_reference TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (flight_id) REFERENCES flights (id) ON DELETE CASCADE
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_flights_origin_destination ON flights(origin, destination);
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);