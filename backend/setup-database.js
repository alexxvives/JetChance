const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'jetchance.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const createDatabase = async () => {
  try {
    console.log('🚀 Creating database with sequential IDs...');
    
    const db = new Database(DB_PATH);
    
    // Create tables manually with proper structure
    console.log('📋 Creating tables...');
    
    // Users table with super-admin role
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin', 'super-admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created users table');
    
    // Customers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        document_number TEXT,
        document_type TEXT DEFAULT 'CC',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    console.log('✅ Created customers table');
    
    // Operators table
    db.exec(`
      CREATE TABLE IF NOT EXISTS operators (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        total_flights INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    console.log('✅ Created operators table');
    
    // Flights table
    db.exec(`
      CREATE TABLE IF NOT EXISTS flights (
        id TEXT PRIMARY KEY,
        operator_id TEXT NOT NULL,
        aircraft_model TEXT,
        images TEXT DEFAULT '[]',
        origin_name TEXT NOT NULL,
        origin_city TEXT NOT NULL,
        origin_country TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        destination_city TEXT NOT NULL,
        destination_country TEXT NOT NULL,
        departure_datetime DATETIME NOT NULL,
        arrival_datetime DATETIME,
        market_price REAL NOT NULL,
        empty_leg_price REAL NOT NULL,
        available_seats INTEGER NOT NULL,
        total_seats INTEGER NOT NULL,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'booked', 'cancelled')),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (operator_id) REFERENCES operators (id)
      )
    `);
    console.log('✅ Created flights table');
    
    // Bookings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        flight_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        total_passengers INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT,
        special_requests TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flight_id) REFERENCES flights (id),
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `);
    console.log('✅ Created bookings table');
    
    // Passengers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS passengers (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth DATE,
        document_type TEXT DEFAULT 'CC',
        document_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      )
    `);
    console.log('✅ Created passengers table');
    
    // Notifications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read_status BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    console.log('✅ Created notifications table');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    try {
      db.exec('CREATE INDEX IF NOT EXISTS idx_flights_search ON flights(origin_city, destination_city, departure_datetime, status)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_flights_operator ON flights(operator_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_bookings_flight ON bookings(flight_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_passengers_booking ON passengers(booking_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
      console.log('✅ Created indexes');
    } catch (error) {
      console.log('⚠️  Some indexes may already exist');
    }
    
    console.log('\n👤 Creating admin accounts...');
    
    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('password', 12);
    const superAdminPasswordHash = await bcrypt.hash('password', 12);
    
    // Create admin user
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, created_at) 
      VALUES ('US000001', 'admin@gmail.com', ?, 'admin', datetime('now'))
    `).run(adminPasswordHash);
    
    // Create customer profile for admin
    db.prepare(`
      INSERT INTO customers (id, user_id, created_at) 
      VALUES ('CU000001', 'US000001', datetime('now'))
    `).run();
    
    console.log('✅ Created admin@gmail.com with role: admin (ID: US000001)');
    
    // Create super admin user  
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, created_at) 
      VALUES ('US000002', 'superadmin@gmail.com', ?, 'super-admin', datetime('now'))
    `).run(superAdminPasswordHash);
    
    // Create customer profile for super admin
    db.prepare(`
      INSERT INTO customers (id, user_id, created_at) 
      VALUES ('CU000002', 'US000002', datetime('now'))
    `).run();
    
    console.log('✅ Created superadmin@gmail.com with role: super-admin (ID: US000002)');
    
    // Verify accounts were created
    const adminUser = db.prepare("SELECT id, email, role FROM users WHERE email = 'admin@gmail.com'").get();
    const superAdminUser = db.prepare("SELECT id, email, role FROM users WHERE email = 'superadmin@gmail.com'").get();
    
    console.log('\n🎉 Database created successfully!');
    console.log('\n📋 Admin Accounts Created:');
    console.log(`Admin: ${adminUser.email} (${adminUser.role}) - ID: ${adminUser.id}`);
    console.log(`Super Admin: ${superAdminUser.email} (${superAdminUser.role}) - ID: ${superAdminUser.id}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('admin@gmail.com / password');
    console.log('superadmin@gmail.com / password');
    
    // Show table counts
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('\n📊 Database Summary:');
    tables.forEach(table => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`${table.name}: ${count.count} rows`);
    });
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error creating database:', error);
  }
};

if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };