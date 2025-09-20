// Quick test script to add a flight to localStorage
const testFlight = {
  id: 999,
  origin: 'Test City',
  destination: 'Test Destination',
  originCode: 'TST',
  destinationCode: 'DST',
  departureTime: '2025-09-25T14:00:00',
  arrivalTime: '2025-09-25T16:30:00',
  aircraftType: 'Test Aircraft',
  price: 1500,
  originalPrice: 5000,
  seatsAvailable: 8,
  duration: '2h 30m',
  status: 'active',
  bookings: 0,
  operatorId: '3',
  description: 'Test flight created for debugging',
  createdAt: new Date().toISOString(),
  aircraft_image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop&crop=center',
  images: []
};

// Get existing flights
const existing = JSON.parse(localStorage.getItem('chancefly_mock_flights') || '[]');
existing.push(testFlight);
localStorage.setItem('chancefly_mock_flights', JSON.stringify(existing));

console.log('Test flight added to localStorage');
console.log('Total flights in storage:', existing.length);