/**
 * Quick script to check notification preferences in the database
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'jetchance.db');
console.log('📁 Database path:', path.resolve(dbPath));

const db = new Database(dbPath);

try {
  console.log('\n📊 ===== CUSTOMER NOTIFICATION PREFERENCES =====\n');
  
  // Get all customers with their notification preferences
  const customers = db.prepare(`
    SELECT 
      c.id as customer_id,
      c.user_id,
      c.first_name,
      c.last_name,
      c.email_notifications,
      c.sms_notifications,
      c.marketing_emails,
      u.email
    FROM customers c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.id
  `).all();

  if (customers.length === 0) {
    console.log('No customers found in database.');
  } else {
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.first_name || 'N/A'} ${customer.last_name || 'N/A'} (${customer.email})`);
      console.log(`   Customer ID: ${customer.customer_id}`);
      console.log(`   User ID: ${customer.user_id}`);
      console.log(`   Email Notifications: ${customer.email_notifications} (${customer.email_notifications === 1 ? '✅ ON' : '❌ OFF'})`);
      console.log(`   SMS Notifications: ${customer.sms_notifications} (${customer.sms_notifications === 1 ? '✅ ON' : '❌ OFF'})`);
      console.log(`   Marketing Emails: ${customer.marketing_emails} (${customer.marketing_emails === 1 ? '✅ ON' : '❌ OFF'})`);
      console.log('');
    });
  }

  console.log('===== END =====\n');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
