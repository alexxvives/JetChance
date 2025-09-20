// Clear flight data script - run this in browser console if needed
// This will clear all flight data from localStorage

console.log('Clearing flight data...');

// Clear localStorage
localStorage.removeItem('chancefly_mock_flights');

console.log('✅ All flight data cleared from localStorage');
console.log('The application will start fresh with no flights');
console.log('Operators can now create their own flights');