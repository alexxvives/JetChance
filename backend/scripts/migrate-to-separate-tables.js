const db = require('../config/database-sqlite');

const migrateToSeparateUserTables = async () => {
  try {
    console.log('🚀 Starting migration to separate user tables...');

    // Step 1: Create new tables
    console.log('Creating new table structure...');
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('customer', 'operator', 'admin', 'super-admin')),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        email_verification_token TEXT,
        password_reset_token TEXT,
        password_reset_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
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
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS operators_new (
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
      )
    `);

    // Step 2: Migrate existing data
    console.log('Migrating existing user data...');

    // Get all existing users
    const users = await db.query('SELECT * FROM users');
    
    for (const user of users.rows) {
      // Insert into auth_users (shared fields)
      await db.run(`
        INSERT INTO auth_users (
          id, email, password_hash, phone, role, is_active, 
          email_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id, user.email, user.password_hash, user.phone, user.role,
        user.is_active, user.email_verified, user.created_at, user.updated_at
      ]);

      // Insert into role-specific table
      if (user.role === 'customer') {
        const customerId = 'cust_' + user.id;
        await db.run(`
          INSERT INTO customers (
            id, auth_user_id, first_name, last_name, date_of_birth,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          customerId, user.id, user.first_name, user.last_name, 
          user.date_of_birth, user.created_at, user.updated_at
        ]);
      } else if (user.role === 'operator') {
        const operatorId = 'op_' + user.id;
        await db.run(`
          INSERT INTO operators_new (
            id, auth_user_id, company_name, is_individual, status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          operatorId, user.id, user.company_name || 'Unknown Company', 
          user.is_individual || false, user.status || 'approved',
          user.created_at, user.updated_at
        ]);
      } else if (user.role === 'admin' || user.role === 'super-admin') {
        // For now, admins don't need a separate table - they only use auth_users
        console.log(`Admin user ${user.email} migrated to auth_users only`);
      }
    }

    // Step 3: Update foreign key references
    console.log('Updating foreign key references...');
    
    // Update flights table to reference new operators table
    // First add a temporary column
    await db.run('ALTER TABLE flights ADD COLUMN new_operator_id TEXT');
    
    // Update the new column with mapped operator IDs
    const flights = await db.query('SELECT id, operator_id FROM flights');
    for (const flight of flights.rows) {
      const newOperatorId = 'op_' + flight.operator_id;
      await db.run('UPDATE flights SET new_operator_id = ? WHERE id = ?', 
        [newOperatorId, flight.id]);
    }

    // Step 4: Create views for backward compatibility
    console.log('Creating compatibility views...');
    
    await db.run(`
      CREATE VIEW customer_users AS
      SELECT 
        au.id as id,
        au.email,
        au.phone,
        au.role,
        au.is_active,
        au.email_verified,
        au.created_at,
        au.updated_at,
        c.first_name,
        c.last_name,
        c.date_of_birth
      FROM auth_users au
      JOIN customers c ON au.id = c.auth_user_id
      WHERE au.role = 'customer'
    `);

    await db.run(`
      CREATE VIEW operator_users AS
      SELECT 
        au.id as id,
        au.email,
        au.phone,
        au.role,
        au.is_active,
        au.email_verified,
        au.created_at,
        au.updated_at,
        o.company_name,
        o.is_individual,
        o.status,
        o.logo_url,
        o.total_flights
      FROM auth_users au
      JOIN operators_new o ON au.id = o.auth_user_id
      WHERE au.role = 'operator'
    `);

    console.log('✅ Migration completed successfully!');
    console.log('⚠️  Next steps:');
    console.log('   1. Update application code to use new table structure');
    console.log('   2. Test thoroughly with new schema');
    console.log('   3. Drop old users table when confident: DROP TABLE users;');
    console.log('   4. Rename operators_new to operators');
    console.log('   5. Update flights table foreign key');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

if (require.main === module) {
  migrateToSeparateUserTables()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToSeparateUserTables };