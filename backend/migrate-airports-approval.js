const Database = require('better-sqlite3');
const path = require('path');

// Database migration to add airport approval system
const dbPath = path.join(__dirname, 'jetchance.db');
const db = new Database(dbPath);

console.log('🔄 Starting airport approval system migration...');

try {
  // First, check if the columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(airports)").all();
  const hasStatusColumn = tableInfo.some(col => col.name === 'status');
  
  if (!hasStatusColumn) {
    console.log('📝 Adding new columns to airports table...');
    
    // Add new columns
    db.exec(`
      ALTER TABLE airports ADD COLUMN status TEXT DEFAULT 'pending';
      ALTER TABLE airports ADD COLUMN created_by INTEGER;
      ALTER TABLE airports ADD COLUMN reviewed_by INTEGER;
      ALTER TABLE airports ADD COLUMN reviewed_at DATETIME;
    `);
    
    // Update existing airports to approved status
    const updateExisting = db.prepare(`
      UPDATE airports 
      SET status = 'approved' 
      WHERE status = 'pending'
    `);
    const result = updateExisting.run();
    
    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Updated ${result.changes} existing airports to 'approved' status`);
  } else {
    console.log('✅ Airport approval system columns already exist');
  }
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}