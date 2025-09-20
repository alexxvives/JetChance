const db = require('./config/database-sqlite');

async function testFlightQuery() {
  try {
    console.log('=== Testing exact API query logic ===');
    
    // Simulate the exact parameters from the API call
    const passengers = 1;
    const statusFilter = 'approved';
    
    let whereConditions = [];
    let params = [];

    // Status filtering
    if (statusFilter) {
      whereConditions.push(`f.status = ?`);
      params.push(statusFilter);
    }

    // Passenger capacity filter  
    whereConditions.push(`f.available_seats >= ?`);
    params.push(parseInt(passengers));
    
    console.log('Where conditions:', whereConditions);
    console.log('Parameters:', params);
    
    const orderBy = `f.departure_datetime ASC`;
    const limit = 20;
    const offset = 0;
    
    // The exact query from the API
    const query = `
      SELECT 
        f.id,
        f.flight_number,
        f.origin_code,
        f.origin_name,
        f.origin_city,
        f.origin_country,
        f.destination_code,
        f.destination_name,
        f.destination_city,
        f.destination_country,
        f.departure_datetime,
        f.arrival_datetime,
        f.estimated_duration_minutes,
        f.original_price,
        f.empty_leg_price,
        f.currency,
        f.max_passengers,
        f.available_seats,
        f.status,
        f.description,
        a.aircraft_type,
        a.manufacturer,
        a.model,
        a.max_passengers as aircraft_max_passengers,
        a.images,
        a.amenities,
        o.company_name as operator_name
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      JOIN operators o ON f.operator_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);
    
    console.log('\n=== Final Query ===');
    console.log(query);
    console.log('\n=== Final Params ===');
    console.log(params);
    
    const result = await db.query(query, params);
    
    console.log('\n=== Results ===');
    console.log(`Found ${result.rows.length} flights:`);
    result.rows.forEach(flight => {
      console.log(`- ${flight.id}: ${flight.origin_code} → ${flight.destination_code} (${flight.status}) - Available: ${flight.available_seats}`);
    });
    
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error(error);
  }
}

testFlightQuery();