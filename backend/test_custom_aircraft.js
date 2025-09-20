const { spawn } = require('child_process');
const path = require('path');

// Start the server first
console.log('🚀 Starting backend server...');
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit'
});

// Wait a bit for server to start
setTimeout(async () => {
  const flightData = {
    aircraftType: "Cessna Citation X+",
    originCode: "LAX",
    destinationCode: "SFO", 
    departureDateTime: "2025-09-21T10:00:00Z",
    originalPrice: 5000,
    emptyLegPrice: 3000,
    totalSeats: 6,
    originName: "Los Angeles",
    destinationName: "San Francisco",
    description: "Test flight with custom aircraft"
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVTUjAwOSIsInJvbGUiOiJzdXBlci1hZG1pbiIsImlhdCI6MTczNDM2NDA5MywiZXhwIjoyMDQ5NzI0MDkzfQ.EGRVJhXJW1-8S1Zx8xTt7_JmTjcOJhb3WgpPRZgfGlM'
  };

  try {
    console.log('\n=== Testing Flight Creation with Custom Aircraft ===');
    console.log('Aircraft Type:', flightData.aircraftType);
    
    const response = await fetch('http://localhost:4000/api/flights', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(flightData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Flight created successfully:');
    console.log('Flight ID:', result.flight.id);
    console.log('Aircraft Name:', result.flight.aircraftName);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    // Test getting flights to see if aircraft name shows correctly
    console.log('\n=== Testing Flight Retrieval ===');
    const flightsResponse = await fetch('http://localhost:4000/api/flights', {
      headers: { 'Authorization': headers.Authorization }
    });
    
    if (flightsResponse.ok) {
      const flightsData = await flightsResponse.json();
      console.log('Retrieved flights:');
      flightsData.flights.forEach((flight, index) => {
        console.log(`${index + 1}. ${flight.id}: ${flight.aircraft?.name || flight.aircraft_name || 'No aircraft name'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill();
    process.exit(0);
  }
}, 3000);