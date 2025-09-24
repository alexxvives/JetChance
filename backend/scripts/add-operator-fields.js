const db = require('../config/database-sqlite');

const addOperatorFields = async () => {
  try {
    console.log('🚀 Adding operator fields to users table...');

    // Add company_name column if it doesn't exist
    try {
      await db.run(`ALTER TABLE users ADD COLUMN company_name TEXT`);
      console.log('✅ Added company_name column to users table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('✅ company_name column already exists');
      } else {
        throw error;
      }
    }

    // Add status column if it doesn't exist
    try {
      await db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'approved'`);
      console.log('✅ Added status column to users table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('✅ status column already exists');
      } else {
        throw error;
      }
    }

    // Add is_individual column if it doesn't exist
    try {
      await db.run(`ALTER TABLE users ADD COLUMN is_individual BOOLEAN DEFAULT false`);
      console.log('✅ Added is_individual column to users table');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('✅ is_individual column already exists');
      } else {
        throw error;
      }
    }

    console.log('✅ Operator fields migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  addOperatorFields()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addOperatorFields;