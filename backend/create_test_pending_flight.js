const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./chancefly.db');

// Insert a test pending flight
const testFlight = {
    id: 'FL999999',
    operator_id: 'OP009',
    aircraft_id: 'AC001',
    flight_number: 'TEST001',
    origin_code: 'LAX',
    origin_name: 'Los Angeles',
    origin_city: 'Los Angeles',
    origin_country: 'US',
    destination_code: 'MIA',
    destination_name: 'Miami',
    destination_city: 'Miami', 
    destination_country: 'US',
    departure_datetime: '2025-09-25T15:00',
    arrival_datetime: '2025-09-26T02:00',
    estimated_duration_minutes: 420,
    original_price: 8000,
    empty_leg_price: 800,
    available_seats: 8,
    max_passengers: 8,
    status: 'pending', // This should NOT be visible to customers
    description: 'Test pending flight - should be hidden from customers'
};

const insertQuery = `
    INSERT INTO flights (
        id, operator_id, aircraft_id, flight_number,
        origin_code, origin_name, origin_city, origin_country,
        destination_code, destination_name, destination_city, destination_country,
        departure_datetime, arrival_datetime, estimated_duration_minutes,
        original_price, empty_leg_price, available_seats, max_passengers,
        status, description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`;

db.run(insertQuery, [
    testFlight.id,
    testFlight.operator_id,
    testFlight.aircraft_id,
    testFlight.flight_number,
    testFlight.origin_code,
    testFlight.origin_name,
    testFlight.origin_city,
    testFlight.origin_country,
    testFlight.destination_code,
    testFlight.destination_name,
    testFlight.destination_city,
    testFlight.destination_country,
    testFlight.departure_datetime,
    testFlight.arrival_datetime,
    testFlight.estimated_duration_minutes,
    testFlight.original_price,
    testFlight.empty_leg_price,
    testFlight.available_seats,
    testFlight.max_passengers,
    testFlight.status,
    testFlight.description
], function(err) {
    if (err) {
        console.error('Error creating test flight:', err);
    } else {
        console.log(`✅ Created test pending flight: ${testFlight.id}`);
        console.log(`   Route: ${testFlight.origin_code} → ${testFlight.destination_code}`);
        console.log(`   Status: ${testFlight.status} (should be HIDDEN from customers)`);
    }
    
    db.close();
});