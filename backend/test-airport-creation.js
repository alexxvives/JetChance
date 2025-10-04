const Database = require('better-sqlite3');
const db = new Database('./jetchance.db');

console.log('=== CREATING TEST AIRPORT WITH REAL OPERATOR ===');

// Try with a unique airport code
const insertAirport = db.prepare(`
  INSERT INTO airports (code, name, city, country, latitude, longitude, status, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

try {
  const result = insertAirport.run(
    'TST',
    'Test Airport for Operator',
    'Test City',
    'USA',
    40.7128,
    -74.0060,
    'pending',
    'US000004'  // operator user
  );
  console.log('Test airport created successfully:', result);
} catch (error) {
  console.log('Error creating airport:', error.message);
  // Try with different code if TST exists
  try {
    const result2 = insertAirport.run(
      'TST2',
      'Test Airport for Operator 2',
      'Test City 2',
      'USA',
      40.7128,
      -74.0060,
      'pending',
      'US000004'  // operator user
    );
    console.log('Test airport 2 created successfully:', result2);
  } catch (error2) {
    console.log('Error creating airport 2:', error2.message);
  }
}

// Now check pending airports query
const query = db.prepare(`
  SELECT 
    a.*,
    u.email as creator_email,
    u.role as creator_role,
    o.company_name as operator_company_name
  FROM airports a
  LEFT JOIN users u ON CAST(a.created_by AS TEXT) = u.id
  LEFT JOIN operators o ON u.id = o.user_id
  WHERE a.status = 'pending'
  ORDER BY a.created_at DESC
`);

const pendingAirports = query.all();
console.log('\n=== PENDING AIRPORTS WITH OPERATOR INFO ===');
console.log(JSON.stringify(pendingAirports, null, 2));

db.close();