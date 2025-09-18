const db = require('../config/database');

const createTables = async () => {
  try {
    // Enable UUID extension
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin')),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        profile_image_url VARCHAR(500),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create operators table
    await db.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        company_registration VARCHAR(100),
        operating_license VARCHAR(100),
        insurance_policy VARCHAR(100),
        website_url VARCHAR(255),
        description TEXT,
        logo_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_flights INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create aircraft table
    await db.query(`
      CREATE TABLE IF NOT EXISTS aircraft (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
        tail_number VARCHAR(20) UNIQUE NOT NULL,
        aircraft_type VARCHAR(100) NOT NULL,
        manufacturer VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year_manufactured INTEGER,
        max_passengers INTEGER NOT NULL,
        max_range_nm INTEGER,
        cruise_speed_kts INTEGER,
        cabin_height_ft DECIMAL(4,2),
        cabin_width_ft DECIMAL(4,2),
        cabin_length_ft DECIMAL(4,2),
        baggage_capacity_cuft INTEGER,
        description TEXT,
        images JSONB DEFAULT '[]',
        amenities JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create flights table (empty-leg flights)
    await db.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        operator_id UUID NOT NULL REFERENCES operators(id),
        aircraft_id UUID NOT NULL REFERENCES aircraft(id),
        flight_number VARCHAR(20),
        
        -- Route information
        origin_code VARCHAR(4) NOT NULL,
        origin_name VARCHAR(255) NOT NULL,
        origin_city VARCHAR(100) NOT NULL,
        origin_country VARCHAR(100) NOT NULL,
        destination_code VARCHAR(4) NOT NULL,
        destination_name VARCHAR(255) NOT NULL,
        destination_city VARCHAR(100) NOT NULL,
        destination_country VARCHAR(100) NOT NULL,
        
        -- Schedule
        departure_datetime TIMESTAMP NOT NULL,
        arrival_datetime TIMESTAMP,
        estimated_duration_minutes INTEGER,
        
        -- Pricing
        original_price DECIMAL(10,2) NOT NULL,
        empty_leg_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        
        -- Availability
        total_seats INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        min_passengers INTEGER DEFAULT 1,
        
        -- Flight details
        flight_type VARCHAR(20) DEFAULT 'empty_leg' CHECK (flight_type IN ('empty_leg', 'shared', 'charter')),
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'departed', 'completed', 'cancelled')),
        
        -- Additional information
        catering_available BOOLEAN DEFAULT false,
        ground_transport_available BOOLEAN DEFAULT false,
        wifi_available BOOLEAN DEFAULT false,
        pets_allowed BOOLEAN DEFAULT false,
        smoking_allowed BOOLEAN DEFAULT false,
        
        -- Flexibility
        flexible_departure BOOLEAN DEFAULT false,
        flexible_destination BOOLEAN DEFAULT false,
        max_delay_minutes INTEGER DEFAULT 30,
        
        -- Metadata
        description TEXT,
        special_requirements TEXT,
        cancellation_policy TEXT,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Indexes for search performance
        CONSTRAINT valid_seats CHECK (available_seats <= total_seats),
        CONSTRAINT valid_pricing CHECK (empty_leg_price <= original_price),
        CONSTRAINT future_departure CHECK (departure_datetime > NOW())
      )
    `);

    // Create bookings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_reference VARCHAR(20) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id),
        flight_id UUID NOT NULL REFERENCES flights(id),
        
        -- Booking details
        passenger_count INTEGER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        
        -- Status tracking
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled', 'refunded')),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
        
        -- Payment information
        payment_method VARCHAR(20),
        payment_intent_id VARCHAR(255),
        stripe_session_id VARCHAR(255),
        
        -- Special requests
        special_requests TEXT,
        catering_requests TEXT,
        ground_transport_required BOOLEAN DEFAULT false,
        
        -- Timestamps
        booking_date TIMESTAMP DEFAULT NOW(),
        payment_date TIMESTAMP,
        confirmation_date TIMESTAMP,
        cancellation_date TIMESTAMP,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT positive_passengers CHECK (passenger_count > 0),
        CONSTRAINT positive_amount CHECK (total_amount > 0)
      )
    `);

    // Create passengers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS passengers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth DATE,
        nationality VARCHAR(100),
        passport_number VARCHAR(50),
        passport_expiry DATE,
        dietary_requirements TEXT,
        mobility_assistance BOOLEAN DEFAULT false,
        seat_preference VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create reviews table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_id UUID NOT NULL REFERENCES bookings(id),
        user_id UUID NOT NULL REFERENCES users(id),
        operator_id UUID NOT NULL REFERENCES operators(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT,
        service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
        aircraft_rating INTEGER CHECK (aircraft_rating >= 1 AND aircraft_rating <= 5),
        value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
        is_verified BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(booking_id) -- One review per booking
      )
    `);

    // Create notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await db.query('CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_datetime)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_flights_origin_dest ON flights(origin_code, destination_code)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_flights_price ON flights(empty_leg_price)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_bookings_flight ON bookings(flight_id)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status)');

    console.log('✅ All database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

// Function to seed initial data
const seedData = async () => {
  try {
    // Check if admin user exists
    const adminCheck = await db.query('SELECT id FROM users WHERE email = $1', ['admin@chancefly.com']);
    
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      await db.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['admin@chancefly.com', hashedPassword, 'System', 'Administrator', 'admin', true, true]);
      
      console.log('✅ Admin user created');
    }

    // Add sample flight data for testing
    const operatorCheck = await db.query('SELECT id FROM operators LIMIT 1');
    
    if (operatorCheck.rows.length === 0) {
      // Create a sample operator for testing
      const operatorUser = await db.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, ['operator@jetfly.com', await require('bcryptjs').hash('Operator123!', 12), 'Jet', 'Operator', 'operator', true, true]);

      const operator = await db.query(`
        INSERT INTO operators (user_id, company_name, description, status, rating)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [operatorUser.rows[0].id, 'JetFly Aviation', 'Premium private jet operator', 'approved', 4.8]);

      // Create sample aircraft
      const aircraft = await db.query(`
        INSERT INTO aircraft (operator_id, tail_number, aircraft_type, manufacturer, model, max_passengers, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [operator.rows[0].id, 'N123JF', 'Light Jet', 'Cessna', 'Citation CJ3+', 8, true]);

      // Create sample flights
      const sampleFlights = [
        {
          origin: ['KLAX', 'Los Angeles International', 'Los Angeles', 'United States'],
          destination: ['KLAS', 'McCarran International', 'Las Vegas', 'United States'],
          departure: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          original_price: 15000,
          empty_leg_price: 8500,
        },
        {
          origin: ['KJFK', 'John F. Kennedy International', 'New York', 'United States'],
          destination: ['KMIA', 'Miami International', 'Miami', 'United States'],
          departure: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          original_price: 22000,
          empty_leg_price: 12800,
        }
      ];

      for (const flight of sampleFlights) {
        await db.query(`
          INSERT INTO flights (
            operator_id, aircraft_id, origin_code, origin_name, origin_city, origin_country,
            destination_code, destination_name, destination_city, destination_country,
            departure_datetime, original_price, empty_leg_price, total_seats, available_seats
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          operator.rows[0].id, aircraft.rows[0].id, ...flight.origin, ...flight.destination,
          flight.departure, flight.original_price, flight.empty_leg_price, 8, 8
        ]);
      }

      console.log('✅ Sample data seeded successfully');
    }

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

module.exports = {
  createTables,
  seedData,
};

// If called directly, run the migration
if (require.main === module) {
  createTables()
    .then(() => seedData())
    .then(() => {
      console.log('✅ Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}