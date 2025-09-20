const sqlite3 = require('sqlite3').verbose();
const SimpleIDGenerator = require('../utils/idGenerator');

// Script to convert existing UUID-based IDs to simple IDs
async function simplifyDatabaseIds() {
  const db = new sqlite3.Database('./chancefly.db');
  
  console.log('🔄 Starting ID simplification process...');
  
  try {
    // First, let's update the table schemas to remove UUID constraints
    await runQuery(db, 'PRAGMA foreign_keys = OFF');
    
    // Create new tables with simple ID structure
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS users_new (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'customer',
        is_active BOOLEAN DEFAULT 1,
        email_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now')),
        company_name TEXT,
        status TEXT DEFAULT 'approved'
      )
    `);
    
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS operators_new (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT,
        company_registration TEXT,
        operating_license TEXT,
        insurance_policy TEXT,
        website_url TEXT,
        description TEXT,
        logo_url TEXT,
        status TEXT DEFAULT 'pending',
        rating REAL DEFAULT 0.0,
        total_flights INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `);
    
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS aircraft_new (
        id TEXT PRIMARY KEY,
        operator_id TEXT NOT NULL,
        aircraft_type TEXT NOT NULL,
        manufacturer TEXT,
        model TEXT,
        year_manufactured INTEGER,
        registration_number TEXT,
        max_passengers INTEGER NOT NULL,
        cruise_speed_kmh INTEGER,
        range_km INTEGER,
        images TEXT,
        amenities TEXT,
        hourly_rate DECIMAL(10,2),
        availability_status TEXT DEFAULT 'available',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `);
    
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS flights_new (
        id TEXT PRIMARY KEY,
        operator_id TEXT NOT NULL,
        aircraft_id TEXT NOT NULL,
        flight_number TEXT,
        origin_code TEXT NOT NULL,
        origin_name TEXT,
        origin_city TEXT,
        origin_country TEXT,
        destination_code TEXT NOT NULL,
        destination_name TEXT,
        destination_city TEXT,
        destination_country TEXT,
        departure_datetime DATETIME NOT NULL,
        arrival_datetime DATETIME,
        estimated_duration_minutes INTEGER,
        actual_departure_datetime DATETIME,
        actual_arrival_datetime DATETIME,
        original_price DECIMAL(10,2),
        empty_leg_price DECIMAL(10,2),
        available_seats INTEGER NOT NULL,
        max_passengers INTEGER,
        booking_deadline DATETIME,
        status TEXT DEFAULT 'pending',
        description TEXT,
        special_requirements TEXT,
        catering_available BOOLEAN DEFAULT 0,
        ground_transport_available BOOLEAN DEFAULT 0,
        wifi_available BOOLEAN DEFAULT 0,
        pets_allowed BOOLEAN DEFAULT 0,
        smoking_allowed BOOLEAN DEFAULT 0,
        flexible_departure BOOLEAN DEFAULT 0,
        flexible_destination BOOLEAN DEFAULT 0,
        max_delay_minutes INTEGER DEFAULT 30,
        cancellation_policy TEXT,
        currency TEXT DEFAULT 'USD',
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `);
    
    // Migrate existing data with new simple IDs
    console.log('📋 Migrating users...');
    const users = await runQuery(db, 'SELECT * FROM users');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const newId = `USR${String(i + 1).padStart(3, '0')}`;
      await runQuery(db, `
        INSERT INTO users_new (id, email, password_hash, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at, company_name, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newId, user.email, user.password_hash, user.first_name, user.last_name, user.phone, user.role, user.is_active, user.email_verified, user.created_at, user.updated_at, user.company_name, user.status]);
      
      // Store mapping for operators and flights
      user.newId = newId;
    }
    
    console.log('🏢 Migrating operators...');
    const operators = await runQuery(db, 'SELECT * FROM operators');
    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const newId = `OP${String(i + 1).padStart(3, '0')}`;
      
      // Find the new user ID
      const matchingUser = users.find(u => u.id === operator.user_id);
      const newUserId = matchingUser ? matchingUser.newId : operator.user_id;
      
      await runQuery(db, `
        INSERT INTO operators_new (id, user_id, company_name, company_registration, operating_license, insurance_policy, website_url, description, logo_url, status, rating, total_flights, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newId, newUserId, operator.company_name, operator.company_registration, operator.operating_license, operator.insurance_policy, operator.website_url, operator.description, operator.logo_url, operator.status, operator.rating, operator.total_flights, operator.created_at, operator.updated_at]);
      
      operator.newId = newId;
      operator.newUserId = newUserId;
    }
    
    console.log('✈️ Migrating aircraft...');
    const aircraft = await runQuery(db, 'SELECT * FROM aircraft');
    for (let i = 0; i < aircraft.length; i++) {
      const ac = aircraft[i];
      const newId = `AC${String(i + 1).padStart(3, '0')}`;
      
      // Find the new operator ID
      const matchingOperator = operators.find(op => op.id === ac.operator_id);
      const newOperatorId = matchingOperator ? matchingOperator.newId : ac.operator_id;
      
      await runQuery(db, `
        INSERT INTO aircraft_new (id, operator_id, aircraft_type, manufacturer, model, year_manufactured, registration_number, max_passengers, cruise_speed_kmh, range_km, images, amenities, hourly_rate, availability_status, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newId, newOperatorId, ac.aircraft_type, ac.manufacturer, ac.model, ac.year_manufactured, ac.registration_number, ac.max_passengers, ac.cruise_speed_kmh, ac.range_km, ac.images, ac.amenities, ac.hourly_rate, ac.availability_status, ac.is_active, ac.created_at, ac.updated_at]);
      
      ac.newId = newId;
    }
    
    console.log('🚁 Migrating flights...');
    const flights = await runQuery(db, 'SELECT * FROM flights');
    for (let i = 0; i < flights.length; i++) {
      const flight = flights[i];
      const newId = `FL${String(i + 1).padStart(3, '0')}`;
      
      // Find the new operator and aircraft IDs
      const matchingOperator = operators.find(op => op.id === flight.operator_id);
      const newOperatorId = matchingOperator ? matchingOperator.newId : flight.operator_id;
      
      const matchingAircraft = aircraft.find(ac => ac.id === flight.aircraft_id);
      const newAircraftId = matchingAircraft ? matchingAircraft.newId : flight.aircraft_id;
      
      await runQuery(db, `
        INSERT INTO flights_new (id, operator_id, aircraft_id, flight_number, origin_code, origin_name, origin_city, origin_country, destination_code, destination_name, destination_city, destination_country, departure_datetime, arrival_datetime, estimated_duration_minutes, actual_departure_datetime, actual_arrival_datetime, original_price, empty_leg_price, available_seats, max_passengers, booking_deadline, status, description, special_requirements, catering_available, ground_transport_available, wifi_available, pets_allowed, smoking_allowed, flexible_departure, flexible_destination, max_delay_minutes, cancellation_policy, currency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newId, newOperatorId, newAircraftId, flight.flight_number, flight.origin_code, flight.origin_name, flight.origin_city, flight.origin_country, flight.destination_code, flight.destination_name, flight.destination_city, flight.destination_country, flight.departure_datetime, flight.arrival_datetime, flight.estimated_duration_minutes, flight.actual_departure_datetime, flight.actual_arrival_datetime, flight.original_price, flight.empty_leg_price, flight.available_seats, flight.max_passengers, flight.booking_deadline, flight.status, flight.description, flight.special_requirements, flight.catering_available, flight.ground_transport_available, flight.wifi_available, flight.pets_allowed, flight.smoking_allowed, flight.flexible_departure, flight.flexible_destination, flight.max_delay_minutes, flight.cancellation_policy, flight.currency, flight.created_at, flight.updated_at]);
    }
    
    // Replace old tables with new ones
    console.log('🔄 Replacing tables...');
    await runQuery(db, 'DROP TABLE IF EXISTS users');
    await runQuery(db, 'DROP TABLE IF EXISTS operators');
    await runQuery(db, 'DROP TABLE IF EXISTS aircraft');
    await runQuery(db, 'DROP TABLE IF EXISTS flights');
    
    await runQuery(db, 'ALTER TABLE users_new RENAME TO users');
    await runQuery(db, 'ALTER TABLE operators_new RENAME TO operators');
    await runQuery(db, 'ALTER TABLE aircraft_new RENAME TO aircraft');
    await runQuery(db, 'ALTER TABLE flights_new RENAME TO flights');
    
    await runQuery(db, 'PRAGMA foreign_keys = ON');
    
    console.log('✅ ID simplification completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length} migrated to USR001-USR${String(users.length).padStart(3, '0')}`);
    console.log(`   - Operators: ${operators.length} migrated to OP001-OP${String(operators.length).padStart(3, '0')}`);
    console.log(`   - Aircraft: ${aircraft.length} migrated to AC001-AC${String(aircraft.length).padStart(3, '0')}`);
    console.log(`   - Flights: ${flights.length} migrated to FL001-FL${String(flights.length).padStart(3, '0')}`);
    
  } catch (error) {
    console.error('❌ Error during ID simplification:', error);
  } finally {
    db.close();
  }
}

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

// Run the migration
if (require.main === module) {
  simplifyDatabaseIds();
}

module.exports = simplifyDatabaseIds;