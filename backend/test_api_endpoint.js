const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testOperatorFlights = async () => {
  const userId = 'USR007';
  const apiUrl = `http://localhost:4000/api/flights?user_id=${userId}`;
  
  console.log('🧪 Testing operator flights API...');
  console.log('📡 URL:', apiUrl);
  console.log('👤 User ID:', userId);
  
  try {
    const response = await fetch(apiUrl);
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Response data:', JSON.stringify(data, null, 2));
    
    if (data.flights) {
      console.log(`\n🎯 Found ${data.flights.length} flights for USR007`);
      data.flights.forEach(flight => {
        console.log(`   - ${flight.id}: ${flight.origin_city} → ${flight.destination_city} (${flight.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
};

testOperatorFlights();