const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'jetchance.db');
console.log('📍 Database path:', dbPath);

const db = new Database(dbPath);

try {
  console.log('🔄 Starting notification type migration...');
  
  // Check if type column already exists
  const columns = db.prepare('PRAGMA table_info(notifications)').all();
  const hasTypeColumn = columns.some(col => col.name === 'type');
  
  if (hasTypeColumn) {
    console.log('✅ Type column already exists in notifications table');
  } else {
    console.log('📝 Adding type column to notifications table...');
    
    // Add type column with default value
    db.prepare(`
      ALTER TABLE notifications 
      ADD COLUMN type TEXT DEFAULT 'general'
    `).run();
    
    console.log('✅ Type column added successfully');
  }
  
  // Show current schema
  console.log('\n📋 Current notifications table schema:');
  columns.forEach(col => {
    console.log(`   - ${col.name}: ${col.type}${col.dflt_value ? ` (default: ${col.dflt_value})` : ''}`);
  });
  
  // Show sample notifications
  const sampleNotifications = db.prepare('SELECT * FROM notifications LIMIT 5').all();
  console.log('\n📊 Sample notifications:');
  sampleNotifications.forEach(notif => {
    console.log(`   - ${notif.id}: ${notif.title} (type: ${notif.type || 'NULL'})`);
  });
  
  console.log('\n✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
