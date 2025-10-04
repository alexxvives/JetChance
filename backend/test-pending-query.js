const Database = require('better-sqlite3');
const db = new Database('jetchance.db');

console.log('=== TESTING PENDING AIRPORTS QUERY ===');

try {
  const pendingAirports = db.prepare(`
    SELECT 
      a.*,
      u.email as created_by_email,
      o.company_name as operator_company_name
    FROM airports a 
    LEFT JOIN users u ON CAST(a.created_by AS TEXT) = u.id 
    LEFT JOIN operators o ON u.id = o.user_id
    WHERE a.status = 'pending' 
    ORDER BY a.created_at DESC
  `).all();
  
  console.log('Query executed successfully!');
  console.log('Results:', pendingAirports);
  
  if (pendingAirports.length > 0) {
    console.log('\nFirst airport details:');
    console.log('- Code:', pendingAirports[0].code);
    console.log('- Name:', pendingAirports[0].name);
    console.log('- Created by:', pendingAirports[0].created_by);
    console.log('- Email:', pendingAirports[0].created_by_email);
    console.log('- Company:', pendingAirports[0].operator_company_name);
  }
  
} catch(error) {
  console.error('Query failed:', error.message);
}

db.close();