const db = require('../config/database-sqlite');

const removeOperatorFields = async () => {
  try {
    console.log('🚀 Removing unnecessary fields from operators table...');

    // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
    console.log('Creating new operators table with simplified structure...');

    // Create new table with only the fields we want to keep
    await db.run(`
      CREATE TABLE IF NOT EXISTS operators_new (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        logo_url TEXT,
        total_flights INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Copy data from old table to new table (only the fields we're keeping)
    await db.run(`
      INSERT INTO operators_new (id, user_id, company_name, logo_url, total_flights, created_at, updated_at)
      SELECT id, user_id, company_name, logo_url, total_flights, created_at, updated_at
      FROM operators
    `);

    // Drop the old table
    await db.run('DROP TABLE operators');

    // Rename the new table to the original name
    await db.run('ALTER TABLE operators_new RENAME TO operators');

    console.log('✅ Successfully removed fields from operators table:');
    console.log('   - company_registration');
    console.log('   - operating_license');
    console.log('   - insurance_policy');
    console.log('   - website_url');
    console.log('   - description');
    console.log('   - status');
    console.log('   - rating');
    
    console.log('✅ Kept fields:');
    console.log('   - id, user_id, company_name, logo_url, total_flights, created_at, updated_at');

    console.log('✅ Operators table cleanup completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  removeOperatorFields()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = removeOperatorFields;