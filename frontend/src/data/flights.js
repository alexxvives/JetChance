// Shared flight data for the application
export const flights = [
  {
    id: 1,
    origin: 'Los Angeles',
    destination: 'New York',
    originCode: 'LAX',
    destinationCode: 'JFK',
    departure_time: '2025-09-20T14:00:00',
    arrival_time: '2025-09-20T22:30:00',
    aircraft_type: 'Gulfstream G650',
    aircraft_image: 'https://images.unsplash.com/photo-1640622300473-977435c38c04?w=600&h=300&fit=crop&crop=center',
    price: 8500,
    seats_available: 12,
    original_price: 34000,
    operator: 'JetLux',
    duration: '5h 30m',
    coordinates: {
      origin: { lat: 34.0522, lng: -118.2437 },
      destination: { lat: 40.7128, lng: -74.0060 }
    },
    images: [
      'https://images.unsplash.com/photo-1640622300473-977435c38c04?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583829552760-6d6c840a54bb?w=800&h=600&fit=crop&crop=center'
    ]
  },
  {
    id: 2,
    origin: 'Miami',
    destination: 'Chicago',
    originCode: 'MIA',
    destinationCode: 'ORD',
    departure_time: '2025-09-22T09:00:00',
    arrival_time: '2025-09-22T12:15:00',
    aircraft_type: 'Bombardier Global 6000',
    aircraft_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop&crop=center',
    price: 6200,
    seats_available: 14,
    original_price: 28000,
    operator: 'SkyElite',
    duration: '3h 15m',
    coordinates: {
      origin: { lat: 25.7617, lng: -80.1918 },
      destination: { lat: 41.8781, lng: -87.6298 }
    },
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1640622300473-977435c38c04?w=800&h=600&fit=crop&crop=center'
    ]
  },
  {
    id: 3,
    origin: 'Las Vegas',
    destination: 'San Francisco',
    originCode: 'LAS',
    destinationCode: 'SFO',
    departure_time: '2025-09-21T16:30:00',
    arrival_time: '2025-09-21T17:45:00',
    aircraft_type: 'Citation X',
    aircraft_image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&h=300&fit=crop&crop=center',
    price: 4200,
    seats_available: 8,
    original_price: 18000,
    operator: 'WestJet Elite',
    duration: '1h 15m',
    coordinates: {
      origin: { lat: 36.1699, lng: -115.1398 },
      destination: { lat: 37.7749, lng: -122.4194 }
    }
  },
  {
    id: 4,
    origin: 'Denver',
    destination: 'Phoenix',
    originCode: 'DEN',
    destinationCode: 'PHX',
    departure_time: '2025-09-23T11:00:00',
    arrival_time: '2025-09-23T12:30:00',
    aircraft_type: 'Hawker 900XP',
    aircraft_image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&h=300&fit=crop&crop=center',
    price: 3800,
    seats_available: 10,
    original_price: 16500,
    operator: 'Mountain Air',
    duration: '1h 30m',
    coordinates: {
      origin: { lat: 39.7392, lng: -104.9903 },
      destination: { lat: 33.4484, lng: -112.0740 }
    }
  },
  {
    id: 5,
    origin: 'Seattle',
    destination: 'Los Angeles',
    originCode: 'SEA',
    destinationCode: 'LAX',
    departure_time: '2025-09-24T08:00:00',
    arrival_time: '2025-09-24T10:45:00',
    aircraft_type: 'Embraer Legacy 600',
    aircraft_image: 'https://images.unsplash.com/photo-1583829552760-6d6c840a54bb?w=600&h=300&fit=crop&crop=center',
    price: 5500,
    seats_available: 13,
    original_price: 24000,
    operator: 'Pacific Jets',
    duration: '2h 45m',
    coordinates: {
      origin: { lat: 47.6062, lng: -122.3321 },
      destination: { lat: 34.0522, lng: -118.2437 }
    }
  },
  {
    id: 6,
    origin: 'Austin',
    destination: 'Nashville',
    originCode: 'AUS',
    destinationCode: 'BNA',
    departure_time: '2025-09-25T13:30:00',
    arrival_time: '2025-09-25T16:00:00',
    aircraft_type: 'King Air 350',
    aircraft_image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=300&fit=crop&crop=center',
    price: 2900,
    seats_available: 11,
    original_price: 14000,
    operator: 'Southern Sky',
    duration: '2h 30m',
    coordinates: {
      origin: { lat: 30.2672, lng: -97.7431 },
      destination: { lat: 36.1627, lng: -86.7816 }
    }
  }
];