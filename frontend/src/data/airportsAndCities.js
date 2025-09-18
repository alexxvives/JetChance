// Comprehensive airport and city data for the application
export const airports = [
  // Major US Airports
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', country: 'USA' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'NY', country: 'USA' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', state: 'NY', country: 'USA' },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', state: 'NJ', country: 'USA' },
  { code: 'ORD', name: 'Chicago O\'Hare International Airport', city: 'Chicago', state: 'IL', country: 'USA' },
  { code: 'MDW', name: 'Chicago Midway International Airport', city: 'Chicago', state: 'IL', country: 'USA' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', state: 'FL', country: 'USA' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', state: 'FL', country: 'USA' },
  { code: 'PBI', name: 'Palm Beach International Airport', city: 'West Palm Beach', state: 'FL', country: 'USA' },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'NV', country: 'USA' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'CA', country: 'USA' },
  { code: 'SJC', name: 'Norman Y. Mineta San José International Airport', city: 'San Jose', state: 'CA', country: 'USA' },
  { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'CA', country: 'USA' },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'WA', country: 'USA' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'CO', country: 'USA' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'AZ', country: 'USA' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'TX', country: 'USA' },
  { code: 'DAL', name: 'Dallas Love Field', city: 'Dallas', state: 'TX', country: 'USA' },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', state: 'TX', country: 'USA' },
  { code: 'HOU', name: 'William P. Hobby Airport', city: 'Houston', state: 'TX', country: 'USA' },
  { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', state: 'TX', country: 'USA' },
  { code: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'TN', country: 'USA' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'GA', country: 'USA' },
  { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', state: 'NC', country: 'USA' },
  { code: 'RDU', name: 'Raleigh-Durham International Airport', city: 'Raleigh', state: 'NC', country: 'USA' },
  { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', state: 'DC', country: 'USA' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', state: 'DC', country: 'USA' },
  { code: 'BWI', name: 'Baltimore/Washington International Thurgood Marshall Airport', city: 'Baltimore', state: 'MD', country: 'USA' },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', state: 'MA', country: 'USA' },
  { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', state: 'PA', country: 'USA' },
  { code: 'MSP', name: 'Minneapolis-St. Paul International Airport', city: 'Minneapolis', state: 'MN', country: 'USA' },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', state: 'MI', country: 'USA' },
  { code: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', state: 'OH', country: 'USA' },
  { code: 'CMH', name: 'John Glenn Columbus International Airport', city: 'Columbus', state: 'OH', country: 'USA' },
  { code: 'CVG', name: 'Cincinnati/Northern Kentucky International Airport', city: 'Cincinnati', state: 'OH', country: 'USA' },
  { code: 'IND', name: 'Indianapolis International Airport', city: 'Indianapolis', state: 'IN', country: 'USA' },
  { code: 'STL', name: 'St. Louis Lambert International Airport', city: 'St. Louis', state: 'MO', country: 'USA' },
  { code: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', state: 'MO', country: 'USA' },
  { code: 'OMA', name: 'Eppley Airfield', city: 'Omaha', state: 'NE', country: 'USA' },
  { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', state: 'LA', country: 'USA' },
  { code: 'MEM', name: 'Memphis International Airport', city: 'Memphis', state: 'TN', country: 'USA' },
  { code: 'LIT', name: 'Bill and Hillary Clinton National Airport', city: 'Little Rock', state: 'AR', country: 'USA' },
  { code: 'TUL', name: 'Tulsa International Airport', city: 'Tulsa', state: 'OK', country: 'USA' },
  { code: 'OKC', name: 'Will Rogers World Airport', city: 'Oklahoma City', state: 'OK', country: 'USA' },
  { code: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', state: 'NM', country: 'USA' },
  { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', state: 'UT', country: 'USA' },
  { code: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'OR', country: 'USA' },
  { code: 'BUR', name: 'Hollywood Burbank Airport', city: 'Burbank', state: 'CA', country: 'USA' },
  { code: 'LGB', name: 'Long Beach Airport', city: 'Long Beach', state: 'CA', country: 'USA' },
  { code: 'SNA', name: 'John Wayne Airport', city: 'Orange County', state: 'CA', country: 'USA' },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'CA', country: 'USA' },
  { code: 'SMF', name: 'Sacramento International Airport', city: 'Sacramento', state: 'CA', country: 'USA' },
  { code: 'RNO', name: 'Reno-Tahoe International Airport', city: 'Reno', state: 'NV', country: 'USA' },
  
  // Private Jet Friendly Airports
  { code: 'TEB', name: 'Teterboro Airport', city: 'Teterboro', state: 'NJ', country: 'USA' },
  { code: 'HPN', name: 'Westchester County Airport', city: 'White Plains', state: 'NY', country: 'USA' },
  { code: 'VNY', name: 'Van Nuys Airport', city: 'Van Nuys', state: 'CA', country: 'USA' },
  { code: 'BED', name: 'Laurence G. Hanscom Field', city: 'Bedford', state: 'MA', country: 'USA' },
  { code: 'PWK', name: 'Chicago Executive Airport', city: 'Wheeling', state: 'IL', country: 'USA' },
  { code: 'FRG', name: 'Republic Airport', city: 'Farmingdale', state: 'NY', country: 'USA' },
  { code: 'ISP', name: 'MacArthur Airport', city: 'Islip', state: 'NY', country: 'USA' },
  { code: 'OPF', name: 'Miami-Opa Locka Executive Airport', city: 'Opa-locka', state: 'FL', country: 'USA' },
  { code: 'FXE', name: 'Fort Lauderdale Executive Airport', city: 'Fort Lauderdale', state: 'FL', country: 'USA' },
  { code: 'TMB', name: 'Miami Executive Airport', city: 'Miami', state: 'FL', country: 'USA' },
  { code: 'APA', name: 'Centennial Airport', city: 'Englewood', state: 'CO', country: 'USA' },
  { code: 'SDL', name: 'Scottsdale Airport', city: 'Scottsdale', state: 'AZ', country: 'USA' },
  { code: 'FFZ', name: 'Falcon Field Airport', city: 'Mesa', state: 'AZ', country: 'USA' },
  
  // International Airports (Popular Destinations)
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', state: 'ON', country: 'Canada' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', state: 'BC', country: 'Canada' },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', state: 'QC', country: 'Canada' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', state: '', country: 'UK' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', state: '', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', state: '', country: 'France' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', state: '', country: 'Germany' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', state: '', country: 'Netherlands' },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', state: '', country: 'Switzerland' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', state: '', country: 'Switzerland' },
  { code: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau', state: '', country: 'Bahamas' },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', state: '', country: 'Mexico' },
  { code: 'SJD', name: 'Los Cabos International Airport', city: 'Los Cabos', state: '', country: 'Mexico' },
  { code: 'PVR', name: 'Puerto Vallarta International Airport', city: 'Puerto Vallarta', state: '', country: 'Mexico' }
];

// Extract unique cities for city search
export const cities = airports.reduce((acc, airport) => {
  const key = `${airport.city}, ${airport.state ? airport.state + ', ' : ''}${airport.country}`;
  if (!acc.find(city => city.key === key)) {
    acc.push({
      key,
      city: airport.city,
      state: airport.state,
      country: airport.country,
      airports: []
    });
  }
  const cityEntry = acc.find(city => city.key === key);
  cityEntry.airports.push(airport);
  return acc;
}, []);

// Helper functions
export const searchAirports = (query, limit = 10) => {
  if (!query || query.length < 1) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return airports
    .filter(airport => 
      airport.code.toLowerCase().includes(lowercaseQuery) ||
      airport.name.toLowerCase().includes(lowercaseQuery) ||
      airport.city.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, limit);
};

export const searchCities = (query, limit = 10) => {
  if (!query || query.length < 1) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return cities
    .filter(city => 
      city.city.toLowerCase().includes(lowercaseQuery) ||
      city.state?.toLowerCase().includes(lowercaseQuery) ||
      city.country.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, limit);
};

export const getAirportByCode = (code) => {
  return airports.find(airport => airport.code.toLowerCase() === code.toLowerCase());
};

export const getCityAirports = (cityName) => {
  return airports.filter(airport => 
    airport.city.toLowerCase() === cityName.toLowerCase()
  );
};