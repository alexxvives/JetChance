const db = require('../config/database-sqlite');

const checkTables = async () => {
  try {
    const result = await db.query(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log('Existing tables:');
    result.rows.forEach(row => console.log(' -', row.name));
    
    // Check if migration tables exist
    const authUsersExists = result.rows.some(row => row.name === 'auth_users');
    console.log('\nMigration status:');
    console.log('auth_users table exists:', authUsersExists);
    
    if (authUsersExists) {
      console.log('\nClearing migration tables for fresh start...');
      await db.run('DROP TABLE IF EXISTS auth_users');
      await db.run('DROP TABLE IF EXISTS customers');
      await db.run('DROP TABLE IF EXISTS operators_new');
      await db.run('DROP VIEW IF EXISTS customer_users');
      await db.run('DROP VIEW IF EXISTS operator_users');
      console.log('✅ Migration tables cleared');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

checkTables();