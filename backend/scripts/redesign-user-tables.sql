-- Redesigned database schema with separate user type tables
-- This eliminates role-specific columns in a shared table

-- Base authentication table (minimal shared fields only)
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'operator', 'admin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer-specific data
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  address TEXT,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT true,
  notification_marketing BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auth_user_id) REFERENCES auth_users (id) ON DELETE CASCADE
);

-- Operator-specific data
CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  is_individual BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  logo_url TEXT,
  total_flights INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auth_user_id) REFERENCES auth_users (id) ON DELETE CASCADE
);

-- Admin-specific data (if needed in future)
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  permissions TEXT, -- JSON array of permissions
  department TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auth_user_id) REFERENCES auth_users (id) ON DELETE CASCADE
);

-- Update foreign key references in other tables
-- Flights table - keep reference to operators table
-- Bookings table - now needs to handle both customers and operators
ALTER TABLE bookings ADD COLUMN customer_id TEXT REFERENCES customers(id);
ALTER TABLE bookings ADD COLUMN operator_id TEXT REFERENCES operators(id);
-- Add constraint to ensure one or the other is set
ALTER TABLE bookings ADD CONSTRAINT check_user_type 
  CHECK ((customer_id IS NOT NULL AND operator_id IS NULL) OR 
         (customer_id IS NULL AND operator_id IS NOT NULL));

-- Notifications can reference auth_users since all user types get notifications
-- This table can stay as is, referencing auth_users(id)

-- Views for easy querying (combines auth + specific data)
CREATE VIEW customer_users AS
SELECT 
  au.id as auth_user_id,
  au.email,
  au.phone,
  au.role,
  au.is_active,
  au.email_verified,
  au.created_at as auth_created_at,
  c.id as customer_id,
  c.first_name,
  c.last_name,
  c.date_of_birth,
  c.address,
  c.notification_email,
  c.notification_sms,
  c.notification_marketing,
  c.created_at,
  c.updated_at
FROM auth_users au
JOIN customers c ON au.id = c.auth_user_id
WHERE au.role = 'customer';

CREATE VIEW operator_users AS
SELECT 
  au.id as auth_user_id,
  au.email,
  au.phone,
  au.role,
  au.is_active,
  au.email_verified,
  au.created_at as auth_created_at,
  o.id as operator_id,
  o.company_name,
  o.is_individual,
  o.status,
  o.logo_url,
  o.total_flights,
  o.created_at,
  o.updated_at
FROM auth_users au
JOIN operators o ON au.id = o.auth_user_id
WHERE au.role = 'operator';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_role ON auth_users(role);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user ON customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_operators_auth_user ON operators(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status);