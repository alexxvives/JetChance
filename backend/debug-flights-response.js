const http = require('http');

console.log('🧪 Testing flights endpoint with full response...');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/flights?page=1&limit=1',
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
      console.log('📋 Full response:');
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
});

req.end();