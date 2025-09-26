const { query, run, db } = require('./config/database-sqlite');

async function addEmailToBookings() {
  try {
    console.log('🔄 Adding contact_email column to bookings table...');
    
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(bookings)").all();
    const hasEmailColumn = tableInfo.some(column => column.name === 'contact_email');
    
    if (hasEmailColumn) {
      console.log('✅ contact_email column already exists in bookings table');
      return;
    }
    
    // Add the column
    const addColumnStmt = db.prepare(`
      ALTER TABLE bookings 
      ADD COLUMN contact_email TEXT
    `);
    addColumnStmt.run();
    
    // Update existing bookings with their user's email
    const updateStmt = db.prepare(`
      UPDATE bookings 
      SET contact_email = (
        SELECT u.email 
        FROM customers c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = bookings.customer_id
      )
      WHERE contact_email IS NULL
    `);
    const result = updateStmt.run();
    
    console.log(`✅ Successfully added contact_email column and updated ${result.changes} existing bookings`);
    
  } catch (error) {
    console.error('❌ Error adding email to bookings:', error);
  }
}

// Run the migration
addEmailToBookings();