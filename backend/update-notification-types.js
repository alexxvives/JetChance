const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'jetchance.db');
console.log('📍 Database path:', dbPath);

const db = new Database(dbPath);

try {
  console.log('🔄 Updating notification types based on titles...');
  
  // Get all notifications with type='general'
  const notifications = db.prepare('SELECT id, title, type FROM notifications WHERE type = ?').all('general');
  console.log(`📊 Found ${notifications.length} notifications with type='general'`);
  
  let updated = 0;
  const updateStmt = db.prepare('UPDATE notifications SET type = ? WHERE id = ?');
  
  notifications.forEach(notif => {
    let newType = 'general';
    
    // Map titles to types
    if (notif.title.includes('Flight Submitted') || notif.title.includes('Submitted for Review')) {
      newType = 'flight_submitted';
    } else if (notif.title.includes('Flight Approved')) {
      newType = 'flight_approved';
    } else if (notif.title.includes('Flight Declined') || notif.title.includes('not been approved')) {
      newType = 'flight_denied';
    } else if (notif.title.includes('Flight Deleted')) {
      newType = 'flight_deleted';
    } else if (notif.title.includes('Booking') || notif.title.includes('booking')) {
      newType = 'booking_confirmed';
    } else if (notif.title.includes('Payment')) {
      newType = 'payment_received';
    } else if (notif.title.includes('Operator Registration')) {
      newType = 'operator_registered';
    }
    
    if (newType !== 'general') {
      updateStmt.run(newType, notif.id);
      updated++;
      console.log(`   ✅ ${notif.id}: "${notif.title}" → type: ${newType}`);
    }
  });
  
  console.log(`\n✅ Updated ${updated} notifications`);
  console.log(`ℹ️  ${notifications.length - updated} notifications remain as 'general' type`);
  
  // Show sample of updated notifications
  const sample = db.prepare('SELECT id, title, type FROM notifications ORDER BY created_at DESC LIMIT 10').all();
  console.log('\n📋 Latest 10 notifications:');
  sample.forEach(notif => {
    console.log(`   - ${notif.id}: ${notif.title} (type: ${notif.type})`);
  });
  
} catch (error) {
  console.error('❌ Update failed:', error);
  process.exit(1);
} finally {
  db.close();
}
