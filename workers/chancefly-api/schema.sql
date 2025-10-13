-- JetChance D1 Database Schema - Synced with Backend-- JetChance Database Schema - Optimized for Colombian Flight Booking MVP

-- ========================================================================-- ========================================================================

-- ⚠️  WARNING: DO NOT ADD COLUMNS WITHOUT EXPLICIT APPROVAL-- ⚠️  WARNING: DO NOT ADD COLUMNS WITHOUT EXPLICIT APPROVAL

-- This schema is optimized for MVP launch. Any additional columns must be:-- This schema is optimized for MVP launch in Colombian market

-- 1. Explicitly requested and justified for Colombian market-- ========================================================================

-- 2. Essential for core flight booking functionality  

-- 3. Not duplicating data available in other tables-- Users table - Authentication and basic user info

-- 4. Following the principle: "If it's not essential for MVP, don't add it"CREATE TABLE IF NOT EXISTS users (

-- ========================================================================  id TEXT PRIMARY KEY,                    -- Sequential: US0001, US0002, etc.

  email TEXT UNIQUE NOT NULL,

-- Users table - Authentication and basic user info only  password_hash TEXT NOT NULL,

-- Note: Names are stored in role-specific tables (customers.first_name/last_name, operators.company_name)  first_name TEXT NOT NULL,

CREATE TABLE IF NOT EXISTS users (  last_name TEXT NOT NULL,

  id TEXT PRIMARY KEY,                    -- Sequential: US00001, US00002, etc.  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator')),

  email TEXT UNIQUE NOT NULL,  created_at DATETIME DEFAULT CURRENT_TIMESTAMP

  password_hash TEXT NOT NULL,);

  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin', 'super-admin')),

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP-- Customers table - Customer profiles

);CREATE TABLE IF NOT EXISTS customers (

  id TEXT PRIMARY KEY,                    -- Sequential: CU0001, CU0002, etc.

-- Customers table - Customer profiles linked to users  user_id TEXT NOT NULL,

CREATE TABLE IF NOT EXISTS customers (  phone TEXT,

  id TEXT PRIMARY KEY,                    -- Sequential: CU00001, CU00002, etc.  document_number TEXT,

  user_id TEXT NOT NULL,  document_type TEXT DEFAULT 'CC',

  first_name TEXT,  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  last_name TEXT,  FOREIGN KEY (user_id) REFERENCES users (id)

  phone TEXT,);

  email_notifications INTEGER DEFAULT 0,  -- Opt-in for booking confirmations and flight updates (0=off, 1=on)

  sms_notifications INTEGER DEFAULT 0,    -- Opt-in for SMS alerts (0=off, 1=on)-- Operators table - Flight operators (simplified)

  marketing_emails INTEGER DEFAULT 0,     -- Opt-in for promotional offers and deals (0=off, 1=on)CREATE TABLE IF NOT EXISTS operators (

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  id TEXT PRIMARY KEY,                    -- Sequential: OP0001, OP0002, etc.

  FOREIGN KEY (user_id) REFERENCES users (id)  auth_user_id TEXT NOT NULL,

);  company_name TEXT NOT NULL,

  total_flights INTEGER DEFAULT 0,

-- Operators table - Flight operators (simplified for Colombian market)  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

CREATE TABLE IF NOT EXISTS operators (  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  id TEXT PRIMARY KEY,                    -- Sequential: OP00001, OP00002, etc.  FOREIGN KEY (auth_user_id) REFERENCES users (id)

  user_id TEXT NOT NULL,);

  company_name TEXT NOT NULL,

  total_flights INTEGER DEFAULT 0,       -- Tracks uploaded flights count-- Flights table - Available flights (optimized)

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,CREATE TABLE IF NOT EXISTS flights (

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  id TEXT PRIMARY KEY,                    -- Sequential: FL0001, FL0002, etc.

  FOREIGN KEY (user_id) REFERENCES users (id)  operator_id TEXT NOT NULL,

);  flight_number TEXT,

  origin_city TEXT NOT NULL,

-- Flights table - Available flights (complete structure with 20 columns)  destination_city TEXT NOT NULL,

CREATE TABLE IF NOT EXISTS flights (  origin_code TEXT NOT NULL,

  id TEXT PRIMARY KEY,                    -- Sequential: FL00001, FL00002, etc.  destination_code TEXT NOT NULL,

  operator_id TEXT NOT NULL,  departure_datetime DATETIME NOT NULL,

  aircraft_model TEXT,                   -- Aircraft model (e.g., "Gulfstream G650", "Cessna Citation X")  arrival_datetime DATETIME NOT NULL,

  images TEXT DEFAULT '[]',              -- JSON array of image URLs (non-localhost)  aircraft_name TEXT NOT NULL,

    aircraft_image_url TEXT,

  -- Route information  empty_leg_price REAL NOT NULL,

  origin_name TEXT NOT NULL,             -- Format: "Airport Name (CODE)"  currency TEXT DEFAULT 'COP',           -- Colombian Pesos

  origin_city TEXT NOT NULL,  available_seats INTEGER DEFAULT 1,

  origin_country TEXT NOT NULL,  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'cancelled')),

  destination_name TEXT NOT NULL,        -- Format: "Airport Name (CODE)"  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  destination_city TEXT NOT NULL,  FOREIGN KEY (operator_id) REFERENCES operators (id)

  destination_country TEXT NOT NULL,);

    FOREIGN KEY (operator_id) REFERENCES operators (id) ON DELETE CASCADE

  -- Schedule);

  departure_datetime DATETIME NOT NULL,

  arrival_datetime DATETIME,-- Create bookings table

  CREATE TABLE IF NOT EXISTS bookings (

  -- Pricing  id TEXT PRIMARY KEY,

  market_price REAL NOT NULL,            -- Market price for comparison  user_id TEXT NOT NULL,

  empty_leg_price REAL NOT NULL,        -- Actual selling price  flight_id INTEGER NOT NULL,

    passengers INTEGER NOT NULL DEFAULT 1,

  -- Availability  total_price DECIMAL(10, 2) NOT NULL,

  available_seats INTEGER NOT NULL,  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),

  total_seats INTEGER NOT NULL,          -- Total capacity  booking_reference TEXT UNIQUE NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Status and metadata  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  status TEXT DEFAULT 'pending' CHECK (status IN ('available', 'pending', 'partially booked', 'fully booked', 'cancelled')),  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

  description TEXT,  FOREIGN KEY (flight_id) REFERENCES flights (id) ON DELETE CASCADE

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,);

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Create refresh_tokens table

  FOREIGN KEY (operator_id) REFERENCES operators (id)CREATE TABLE IF NOT EXISTS refresh_tokens (

);  id TEXT PRIMARY KEY,

  user_id TEXT NOT NULL,

-- Bookings table - Flight bookings (simplified structure)  token TEXT NOT NULL,

CREATE TABLE IF NOT EXISTS bookings (  expires_at DATETIME NOT NULL,

  id TEXT PRIMARY KEY,                    -- Sequential: BK00001, BK00002, etc. (also serves as booking reference)  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  flight_id TEXT NOT NULL,  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE

  customer_id TEXT NOT NULL,             -- Only customers can book flights);

  contact_email TEXT NOT NULL,           -- Contact email for this booking (can differ from user email)

  total_passengers INTEGER NOT NULL,-- Create indexes for better performance

  total_amount REAL NOT NULL,CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  payment_method TEXT,                   -- Credit card, bank transfer, etc.CREATE INDEX IF NOT EXISTS idx_flights_origin_destination ON flights(origin, destination);

  special_requests TEXT,CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
  FOREIGN KEY (flight_id) REFERENCES flights (id),
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

-- Passengers table - Passenger details for bookings (essential info only)
CREATE TABLE IF NOT EXISTS passengers (
  id TEXT PRIMARY KEY,                    -- Sequential: PS00001, PS00002, etc.
  booking_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  document_type TEXT DEFAULT 'CC',       -- Colombian document types: CC, CE, PA
  document_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings (id)
);

-- Notifications table - System notifications (essential only)  
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,                    -- Sequential: NT00001, NT00002, etc.
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',            -- Type of notification: flight_submitted, flight_approved, flight_denied, flight_deleted, booking_confirmed, payment_received, operator_registered
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Airports table - Airport database with approval system
CREATE TABLE IF NOT EXISTS airports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  created_by INTEGER,
  reviewed_by INTEGER,
  reviewed_at DATETIME
);

-- Quotes table - Store quote requests from landing page
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type TEXT NOT NULL CHECK (service_type IN ('full-charter', 'empty-leg')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  departure TEXT NOT NULL,
  destination TEXT NOT NULL,
  date TEXT NOT NULL,
  passengers INTEGER NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  seen_at DATETIME DEFAULT NULL  -- When admin viewed this quote
);

-- ========================================================================
-- INDEXES for Performance (Colombian market specific)
-- ========================================================================

-- Flight search optimization
CREATE INDEX IF NOT EXISTS idx_flights_search ON flights(origin_city, destination_city, departure_datetime, status);
CREATE INDEX IF NOT EXISTS idx_flights_operator ON flights(operator_id);

-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);

-- Booking operations
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight ON bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_passengers_booking ON passengers(booking_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Airports
CREATE INDEX IF NOT EXISTS idx_airports_status ON airports(status);
CREATE INDEX IF NOT EXISTS idx_airports_city ON airports(city);
CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);
CREATE INDEX IF NOT EXISTS idx_airports_code ON airports(code);

-- ========================================================================
-- REMOVED TABLES (Previously existed, now eliminated for MVP simplicity)
-- ========================================================================
-- ❌ aircraft - Merged into flights.aircraft_name (no separate aircraft management needed)
-- ❌ refresh_tokens - Using stateless JWT (no database storage needed)
-- ❌ payments - Merged into bookings table (one booking = one payment for MVP simplicity)  

-- ========================================================================
-- REMOVED COLUMNS (Previously existed, now eliminated to prevent over-engineering)
-- ========================================================================
-- ❌ flights: 29+ columns removed (origin_code, destination_code, original_price, discount_percentage, 
--     max_passengers, booking_deadline, visibility, special_instructions, currency, estimated_duration_minutes, etc.)
-- ❌ bookings: Removed currency (get from flight), passenger details (in passengers table)
-- ❌ payments: Removed transaction_id (id serves as transaction ref), currency, status, customer data
-- ❌ passengers: Removed seat_preference, dietary_restrictions (over-engineering for MVP)
-- ❌ operators: Removed is_individual, status, logo_url (not needed for Colombian launch)
-- ❌ users: Removed phone field (moved to customers table)
-- ❌ customers: Cleaned and simplified for essential profile data only

-- ========================================================================
-- COLOMBIAN MARKET OPTIMIZATIONS
-- ========================================================================
-- ✅ Currency: Default COP (Colombian Pesos) 
-- ✅ Document types: Colombian ID standards
-- ✅ Simplified approval: No operator approval process for MVP
-- ✅ Essential data only: Focus on core flight booking functionality
-- ✅ Sequential IDs: Clean, professional ID format (US0001, FL0001, etc.)

-- ========================================================================
-- MVP PRINCIPLES APPLIED
-- ========================================================================
-- 1. ✅ Single source of truth (no data duplication)
-- 2. ✅ Essential functionality only (removed nice-to-have features)  
-- 3. ✅ Colombian market focused (COP currency, local requirements)
-- 4. ✅ Clean relationships (proper foreign keys, no orphaned data)
-- 5. ✅ Performance optimized (strategic indexes for flight search)
-- 6. ✅ Scalable foundation (can add features post-MVP based on user feedback)
