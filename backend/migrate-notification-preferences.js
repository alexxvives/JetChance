/**
 * Migration: Add notification preference columns to customers table
 * 
 * Adds three boolean columns for managing customer notification preferences:
 * - email_notifications: Booking confirmations, flight updates, account info (opt-in)
 * - sms_notifications: Time-sensitive alerts via SMS (opt-in)
 * - marketing_emails: Promotional offers and deals (opt-in)
 * 
 * All default to FALSE to comply with GDPR/CAN-SPAM (opt-in required for marketing)
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'jetchance.db');
const db = new Database(dbPath);

try {
  console.log('🚀 Starting notification preferences migration...\n');

  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(customers)").all();
  const existingColumns = tableInfo.map(col => col.name);
  
  console.log('📋 Current customers table columns:', existingColumns.join(', '));

  const columnsToAdd = [
    { name: 'email_notifications', exists: existingColumns.includes('email_notifications') },
    { name: 'sms_notifications', exists: existingColumns.includes('sms_notifications') },
    { name: 'marketing_emails', exists: existingColumns.includes('marketing_emails') }
  ];

  let changesNeeded = false;

  // Add missing columns
  for (const column of columnsToAdd) {
    if (!column.exists) {
      console.log(`\n➕ Adding column: ${column.name}`);
      db.prepare(`
        ALTER TABLE customers 
        ADD COLUMN ${column.name} INTEGER DEFAULT 0
      `).run();
      console.log(`   ✅ Column ${column.name} added (default: FALSE/0)`);
      changesNeeded = true;
    } else {
      console.log(`\n⏭️  Column ${column.name} already exists, skipping`);
    }
  }

  if (changesNeeded) {
    console.log('\n✨ Migration completed successfully!');
    console.log('\n📊 New customers table structure:');
    const newTableInfo = db.prepare("PRAGMA table_info(customers)").all();
    newTableInfo.forEach(col => {
      console.log(`   - ${col.name}: ${col.type}${col.dflt_value ? ` (default: ${col.dflt_value})` : ''}`);
    });

    // Count existing customers
    const customerCount = db.prepare("SELECT COUNT(*) as count FROM customers").get();
    console.log(`\n👥 Total customers in database: ${customerCount.count}`);
    console.log('   Note: All existing customers will have notifications set to FALSE (opt-in required)');
  } else {
    console.log('\n✅ All columns already exist. No changes needed.');
  }

} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
  console.log('\n🔒 Database connection closed.');
}
