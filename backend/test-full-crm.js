const { query, run, db } = require('./config/database-sqlite');

console.log('=== TESTING FULL CRM QUERY ===');

try {
  const fullQuery = `
    SELECT 
      b.*,
      f.origin_city,
      f.destination_city,
      f.origin_name,
      f.destination_name,
      f.departure_datetime,
      f.arrival_datetime,
      f.aircraft_model as aircraft_name,
      o.company_name as operator_name,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      u.email as customer_email
    FROM bookings b
    JOIN flights f ON b.flight_id = f.id
    JOIN operators o ON f.operator_id = o.id
    JOIN customers c ON b.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    ORDER BY b.created_at DESC
  `;

  console.log('Running full CRM query...');
  const result = db.prepare(fullQuery).all();
  console.log('CRM Query Result:', JSON.stringify(result, null, 2));

  // Also test passenger query
  console.log('\nTesting passenger query...');
  const passengerQuery = `
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.date_of_birth,
      p.document_type,
      p.document_number
    FROM passengers p
    WHERE p.booking_id = ?
    ORDER BY p.first_name, p.last_name
  `;
  
  const passengers = db.prepare(passengerQuery).all('BK000001');
  console.log('Passengers for BK000001:', JSON.stringify(passengers, null, 2));

} catch (error) {
  console.error('Full query error:', error.message);
  console.error('Stack:', error.stack);
}