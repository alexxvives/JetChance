-- JetChance Database Schema - Optimized for Colombian Flight Booking MVP
-- ========================================================================
-- ⚠️  WARNING: DO NOT ADD COLUMNS WITHOUT EXPLICIT APPROVAL
-- This schema is optimized for MVP launch. Any additional columns must be:
-- 1. Explicitly requested and justified for Colombian market
-- 2. Essential for core flight booking functionality  
-- 3. Not duplicating data available in other tables
-- 4. Following the principle: "If it's not essential for MVP, don't add it"
-- ========================================================================

-- Users table - Authentication and basic user info only
-- Note: Names are stored in role-specific tables (customers.first_name/last_name, operators.company_name)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- Sequential: US00001, US00002, etc.
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin', 'super-admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers table - Customer profiles linked to users
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,                    -- Sequential: CU00001, CU00002, etc.
  user_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email_notifications INTEGER DEFAULT 0,  -- Opt-in for booking confirmations and flight updates (0=off, 1=on)
  sms_notifications INTEGER DEFAULT 0,    -- Opt-in for SMS alerts (0=off, 1=on)
  marketing_emails INTEGER DEFAULT 0,     -- Opt-in for promotional offers and deals (0=off, 1=on)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Operators table - Flight operators (simplified for Colombian market)
CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,                    -- Sequential: OP00001, OP00002, etc.
  user_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  total_flights INTEGER DEFAULT 0,       -- Tracks uploaded flights count
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Flights table - Available flights (complete structure with 20 columns)
CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,                    -- Sequential: FL00001, FL00002, etc.
  operator_id TEXT NOT NULL,
  aircraft_model TEXT,                   -- Aircraft model (e.g., "Gulfstream G650", "Cessna Citation X")
  images TEXT DEFAULT '[]',              -- JSON array of image URLs (non-localhost)
  
  -- Route information
  origin_name TEXT NOT NULL,             -- Format: "Airport Name (CODE)"
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination_name TEXT NOT NULL,        -- Format: "Airport Name (CODE)"
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  
  -- Schedule
  departure_datetime DATETIME NOT NULL,
  arrival_datetime DATETIME,
  
  -- Pricing
  market_price REAL NOT NULL,            -- Market price for comparison
  empty_leg_price REAL NOT NULL,        -- Actual selling price
  
  -- Availability
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,          -- Total capacity
  
  -- Status and metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('available', 'pending', 'partially booked', 'fully booked', 'cancelled')),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (operator_id) REFERENCES operators (id)
);

-- Bookings table - Flight bookings (simplified structure)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,                    -- Sequential: BK00001, BK00002, etc. (also serves as booking reference)
  flight_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,             -- Only customers can book flights
  contact_email TEXT NOT NULL,           -- Contact email for this booking (can differ from user email)
  total_passengers INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  payment_method TEXT,                   -- Credit card, bank transfer, etc.
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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