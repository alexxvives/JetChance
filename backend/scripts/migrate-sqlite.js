const db = require('../config/database-sqlite');

const createTables = async () => {
  try {
    console.log('🚀 Starting SQLite database migration...');

    // Create users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create operators table
    await db.run(`
      CREATE TABLE IF NOT EXISTS operators (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_registration TEXT,
        operating_license TEXT,
        insurance_policy TEXT,
        website_url TEXT,
        description TEXT,
        logo_url TEXT,
        status TEXT DEFAULT 'pending',
        rating REAL DEFAULT 0.0,
        total_flights INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create aircraft table
    await db.run(`
      CREATE TABLE IF NOT EXISTS aircraft (
        id TEXT PRIMARY KEY,
        operator_id TEXT NOT NULL,
        tail_number TEXT UNIQUE NOT NULL,
        aircraft_type TEXT NOT NULL,
        manufacturer TEXT NOT NULL,
        model TEXT NOT NULL,
        year_manufactured INTEGER,
        max_passengers INTEGER NOT NULL,
        max_range_nm INTEGER,
        cruise_speed_kts INTEGER,
        description TEXT,
        images TEXT DEFAULT '[]',
        amenities TEXT DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (operator_id) REFERENCES operators (id)
      )
    `);

    // Create flights table (empty-leg flights)
    await db.run(`
      CREATE TABLE IF NOT EXISTS flights (
        id TEXT PRIMARY KEY,
        operator_id TEXT NOT NULL,
        aircraft_id TEXT NOT NULL,
        flight_number TEXT,
        
        -- Route information
        origin_code TEXT NOT NULL,
        origin_name TEXT NOT NULL,
        origin_city TEXT NOT NULL,
        origin_country TEXT NOT NULL,
        destination_code TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        destination_city TEXT NOT NULL,
        destination_country TEXT NOT NULL,
        
        -- Schedule
        departure_datetime DATETIME NOT NULL,
        arrival_datetime DATETIME,
        estimated_duration_minutes INTEGER,
        
        -- Pricing
        original_price REAL NOT NULL,
        empty_leg_price REAL NOT NULL,
        discount_percentage INTEGER,
        currency TEXT DEFAULT 'USD',
        
        -- Availability
        available_seats INTEGER NOT NULL,
        max_passengers INTEGER NOT NULL,
        booking_deadline DATETIME,
        
        -- Status and metadata
        status TEXT DEFAULT 'available',
        visibility TEXT DEFAULT 'public',
        description TEXT,
        special_instructions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (operator_id) REFERENCES operators (id),
        FOREIGN KEY (aircraft_id) REFERENCES aircraft (id)
      )
    `);

    // Create bookings table
    await db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        flight_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        booking_reference TEXT UNIQUE NOT NULL,
        
        -- Passenger details
        total_passengers INTEGER NOT NULL,
        passenger_details TEXT, -- JSON string
        
        -- Pricing
        total_amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        payment_status TEXT DEFAULT 'pending',
        payment_method TEXT,
        payment_intent_id TEXT,
        
        -- Special requests
        special_requests TEXT,
        catering_requests TEXT,
        ground_transportation TEXT,
        
        -- Status and timestamps
        status TEXT DEFAULT 'pending',
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        confirmation_date DATETIME,
        cancellation_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (flight_id) REFERENCES flights (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create passengers table
    await db.run(`
      CREATE TABLE IF NOT EXISTS passengers (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth DATE,
        passport_number TEXT,
        nationality TEXT,
        seat_preference TEXT,
        dietary_restrictions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      )
    `);

    console.log('✅ All tables created successfully!');
    console.log('🎯 Database migration completed!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Generate UUID-like IDs for SQLite
    const generateId = () => 'id_' + Math.random().toString(36).substr(2, 9);

    // Sample operators
    const operator1Id = generateId();
    const operator2Id = generateId();
    
    // Sample users
    const user1Id = generateId();
    const user2Id = generateId();

    // Insert sample users
    await db.run(`
      INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role) 
      VALUES 
      (?, 'operator1@example.com', '$2a$10$hash1', 'John', 'Smith', 'operator'),
      (?, 'operator2@example.com', '$2a$10$hash2', 'Sarah', 'Johnson', 'operator')
    `, [user1Id, user2Id]);

    // Insert sample operators
    await db.run(`
      INSERT OR IGNORE INTO operators (id, user_id, company_name, description, status, rating, total_flights) 
      VALUES 
      (?, ?, 'Elite Aviation', 'Premium private jet services with global coverage', 'approved', 4.8, 150),
      (?, ?, 'Sky Luxury Charter', 'Luxury aircraft charter with personalized service', 'approved', 4.9, 200)
    `, [operator1Id, user1Id, operator2Id, user2Id]);

    // Sample aircraft
    const aircraft1Id = generateId();
    const aircraft2Id = generateId();
    const aircraft3Id = generateId();

    await db.run(`
      INSERT OR IGNORE INTO aircraft (
        id, operator_id, tail_number, aircraft_type, manufacturer, model, 
        year_manufactured, max_passengers, max_range_nm, cruise_speed_kts, description
      ) VALUES 
      (?, ?, 'N123EA', 'Heavy Jet', 'Gulfstream', 'G650', 2020, 14, 7000, 516, 'Ultra-long-range business jet with exceptional comfort'),
      (?, ?, 'N456SL', 'Mid-Size Jet', 'Cessna', 'Citation XLS+', 2019, 12, 2100, 441, 'Versatile mid-size jet perfect for regional travel'),
      (?, ?, 'N789EA', 'Light Jet', 'Embraer', 'Phenom 300', 2021, 8, 1800, 464, 'Modern light jet with advanced avionics')
    `, [aircraft1Id, operator1Id, aircraft2Id, operator2Id, aircraft3Id, operator1Id]);

    // Sample flights
    const flight1Id = generateId();
    const flight2Id = generateId();
    const flight3Id = generateId();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await db.run(`
      INSERT OR IGNORE INTO flights (
        id, operator_id, aircraft_id, flight_number,
        origin_code, origin_name, origin_city, origin_country,
        destination_code, destination_name, destination_city, destination_country,
        departure_datetime, estimated_duration_minutes,
        original_price, empty_leg_price, discount_percentage,
        available_seats, max_passengers, status
      ) VALUES 
      (?, ?, ?, 'ELA001', 'LAX', 'Los Angeles International', 'Los Angeles', 'USA', 'JFK', 'John F. Kennedy International', 'New York', 'USA', ?, 360, 45000, 8500, 81, 14, 14, 'available'),
      (?, ?, ?, 'SLC002', 'MIA', 'Miami International', 'Miami', 'USA', 'LAS', 'Las Vegas McCarran', 'Las Vegas', 'USA', ?, 240, 25000, 6200, 75, 12, 12, 'available'),
      (?, ?, ?, 'ELA003', 'DFW', 'Dallas/Fort Worth International', 'Dallas', 'USA', 'SFO', 'San Francisco International', 'San Francisco', 'USA', ?, 180, 18000, 4500, 75, 8, 8, 'available')
    `, [
      flight1Id, operator1Id, aircraft1Id, tomorrow.toISOString(),
      flight2Id, operator2Id, aircraft2Id, nextWeek.toISOString(),
      flight3Id, operator1Id, aircraft3Id, tomorrow.toISOString()
    ]);

    console.log('✅ Sample data inserted successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Run migration if called directly
if (require.main === module) {
  createTables()
    .then(() => seedDatabase())
    .then(() => {
      console.log('🎉 Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables, seedDatabase };