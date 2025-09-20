// Debug script - Open browser console and paste this to check current data

console.log('=== FLIGHT DATA DEBUG ===');

// Check localStorage
const stored = localStorage.getItem('chancefly_mock_flights');
console.log('localStorage data:', stored);

if (stored) {
  try {
    const parsed = JSON.parse(stored);
    console.log('Parsed flights:', parsed);
    console.log('Number of flights:', parsed.length);
    
    if (parsed.length > 0) {
      console.log('Flight details:');
      parsed.forEach((flight, index) => {
        console.log(`Flight ${index + 1}:`, {
          id: flight.id,
          operatorId: flight.operatorId,
          origin: flight.origin,
          destination: flight.destination,
          bookings: flight.bookings
        });
      });
    }
  } catch (e) {
    console.error('Error parsing localStorage data:', e);
  }
} else {
  console.log('No localStorage data found');
}

console.log('=== END DEBUG ===');