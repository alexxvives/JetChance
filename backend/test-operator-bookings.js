const { query, run, db } = require('./config/database-sqlite');

const testOperatorBookings = async () => {
  try {
    console.log('=== TESTING OPERATOR BOOKINGS QUERY ===');
    
    // First get an operator
    const operators = await query('SELECT * FROM operators LIMIT 1');
    if (operators.rows.length === 0) {
      console.log('No operators found');
      return;
    }
    
    const operator = operators.rows[0];
    console.log(`Testing with operator: ${operator.id} - ${operator.company_name}`);
    
    // Run the same query as the API
    const result = await query(`
      SELECT 
        b.*,
        f.origin_city,
        f.destination_city,
        f.origin_name,
        f.destination_name,
        f.departure_datetime,
        f.arrival_datetime,
        f.aircraft_model as aircraft_name,
        f.available_seats,
        f.total_seats,
        'COP' as currency,
        c.first_name || ' ' || c.last_name as customer_name,
        c.phone as customer_phone
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      JOIN customers c ON b.customer_id = c.id
      WHERE f.operator_id = ?
      ORDER BY b.created_at DESC
    `, [operator.id]);
    
    if (result.rows.length === 0) {
      console.log('No bookings found for this operator');
    } else {
      console.log(`Found ${result.rows.length} bookings:`);
      result.rows.forEach((booking, index) => {
        console.log(`${index + 1}. Booking ${booking.id}:`);
        console.log(`   Flight ID: ${booking.flight_id}`);
        console.log(`   Aircraft: ${booking.aircraft_name}`);
        console.log(`   Available Seats: ${booking.available_seats}`);
        console.log(`   Total Seats: ${booking.total_seats}`);
        console.log(`   ---`);
      });
    }
    
  } catch (error) {
    console.error('Error testing operator bookings:', error);
  }
};

testOperatorBookings();