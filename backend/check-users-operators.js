const Database = require('better-sqlite3');
const db = new Database('jetchance.db');

console.log('=== CHECKING USERS AND OPERATORS ===');

try {
  // Check users
  console.log('\n=== USERS IN DATABASE ===');
  const users = db.prepare('SELECT id, email, role FROM users LIMIT 10').all();
  console.log('Users:', users);

  // Check operators
  console.log('\n=== OPERATORS IN DATABASE ===');
  const operators = db.prepare('SELECT * FROM operators LIMIT 10').all();
  console.log('Operators:', operators);

  // Check if we can find the user who created airports
  console.log('\n=== CHECKING AIRPORT CREATION FLOW ===');
  
  // Let's see if there's a pattern in user IDs
  if (users.length > 0) {
    console.log('Sample user ID format:', typeof users[0].id, users[0].id);
  }

  // Check if any airports have a valid created_by
  const airportsWithCreator = db.prepare('SELECT * FROM airports WHERE created_by IS NOT NULL LIMIT 5').all();
  console.log('Airports with creators:', airportsWithCreator);

  // Try to manually create a test airport with a real user
  if (users.length > 0 && operators.length > 0) {
    const testUser = users.find(u => u.role === 'operator');
    if (testUser) {
      console.log('\n=== CREATING TEST AIRPORT WITH REAL USER ===');
      console.log('Using operator user:', testUser);
      
      // Insert a test airport with the real user ID
      const insertResult = db.prepare(`
        INSERT INTO airports (code, name, city, country, latitude, longitude, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run('TEST', 'Test Airport with Operator', 'Test City', 'CO', 4.6097, -74.0817, testUser.id);
      
      console.log('Insert result:', insertResult);
      
      // Now test our query with this new airport
      const testQuery = db.prepare(`
        SELECT 
          a.*,
          u.email as created_by_email,
          o.company_name as operator_company_name
        FROM airports a 
        LEFT JOIN users u ON CAST(a.created_by AS TEXT) = u.id 
        LEFT JOIN operators o ON u.id = o.user_id
        WHERE a.code = 'TEST'
      `).get();
      
      console.log('Test query result:', testQuery);
    }
  }

} catch(error) {
  console.error('Database error:', error.message);
}

db.close();