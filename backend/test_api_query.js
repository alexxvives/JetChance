const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'chancefly.db');
const db = new sqlite3.Database(dbPath);

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
};

async function testApiQuery() {
  try {
    console.log('Testing API query with status=pending...');
    
    // Simulate the API query for super-admin with status=pending
    let whereConditions = [];
    let params = [];
    
    // Status filtering - for super-admin with status=pending
    const statusFilter = 'pending';
    if (statusFilter) {
      whereConditions.push(`f.status = ?`);
      params.push(statusFilter);
    }
    
    // Add default condition if no conditions exist
    if (whereConditions.length === 0) {
      whereConditions.push('1=1');
    }
    
    const orderBy = `f.departure_datetime ASC`;
    const limit = 10;
    const offset = 0;
    
    const mainQuery = `
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

    params.push(limit, offset);
    
    console.log('Query:', mainQuery);
    console.log('Params:', params);
    
    const result = await query(mainQuery, params);
    
    console.log(`\nFound ${result.rows.length} flights:`);
    result.rows.forEach(flight => {
      console.log(`- ${flight.id}: ${flight.origin_code} → ${flight.destination_code} (${flight.status})`);
    });
    
    console.log('\n✅ Query executed successfully!');
    
  } catch (error) {
    console.error('❌ Query failed:', error);
  } finally {
    db.close();
  }
}

testApiQuery();