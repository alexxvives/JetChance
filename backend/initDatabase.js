const db = require('./config/database-sqlite');

// Database initialization script
async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');

    // Create users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator')),
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
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create flights table
    await db.run(`
      CREATE TABLE IF NOT EXISTS flights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operator_id TEXT NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        origin_code TEXT NOT NULL,
        destination_code TEXT NOT NULL,
        departure_time DATETIME NOT NULL,
        arrival_time DATETIME NOT NULL,
        aircraft_type TEXT NOT NULL,
        aircraft_image TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        seats_available INTEGER NOT NULL,
        operator_name TEXT NOT NULL,
        duration TEXT NOT NULL,
        origin_lat REAL,
        origin_lng REAL,
        destination_lat REAL,
        destination_lng REAL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (operator_id) REFERENCES operators (id) ON DELETE CASCADE
      )
    `);

    // Create bookings table
    await db.run(`
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
      )
    `);

    // Create refresh_tokens table
    await db.run(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully');

    // Check if we need to seed some sample data
    const operatorCount = await db.query('SELECT COUNT(*) as count FROM operators');
    if (operatorCount.rows[0].count === 0) {
      console.log('Seeding sample operator data...');
      
      // Create sample operators for existing flights
      const sampleOperators = [
        { id: 'op-jetlux', name: 'JetLux', company: 'JetLux Aviation' },
        { id: 'op-skyelite', name: 'SkyElite', company: 'SkyElite Charter' },
        { id: 'op-luxair', name: 'LuxAir', company: 'LuxAir Services' }
      ];

      for (const op of sampleOperators) {
        await db.run(
          'INSERT OR IGNORE INTO operators (id, user_id, company_name, status) VALUES (?, ?, ?, ?)',
          [op.id, 'system-' + op.id, op.company, 'approved']
        );
      }
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Initialization script completed');
    process.exit(0);
  });
}

module.exports = { initializeDatabase };