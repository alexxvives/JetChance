const http = require('http');

console.log('🧪 Testing flights endpoint...');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/flights?page=1&limit=3',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Flights endpoint working!');
        console.log(`📊 Found ${response.pagination.total} total flights`);
        console.log(`📄 Showing ${response.flights.length} flights on this page`);
        if (response.flights.length > 0) {
          console.log('🛩️ Sample flight:');
          const flight = response.flights[0];
          console.log(`   - ${flight.flight_number}: ${flight.origin_city} → ${flight.destination_city}`);
          console.log(`   - Operator: ${flight.operator_name}`);
          console.log(`   - Price: ${flight.empty_leg_price} ${flight.currency}`);
        }
      } else {
        console.log(`❌ Error ${res.statusCode}:`, response);
      }
    } catch (e) {
      console.log('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
});

req.end();