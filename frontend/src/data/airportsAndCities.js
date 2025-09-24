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
  
  // Mexico - Major Airports
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', state: '', country: 'Mexico' },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', state: '', country: 'Mexico' },
  { code: 'GDL', name: 'Miguel Hidalgo y Costilla Guadalajara International Airport', city: 'Guadalajara', state: '', country: 'Mexico' },
  { code: 'MTY', name: 'Monterrey International Airport', city: 'Monterrey', state: '', country: 'Mexico' },
  { code: 'TIJ', name: 'Tijuana International Airport', city: 'Tijuana', state: '', country: 'Mexico' },
  { code: 'SJD', name: 'Los Cabos International Airport', city: 'Los Cabos', state: '', country: 'Mexico' },
  { code: 'PVR', name: 'Puerto Vallarta International Airport', city: 'Puerto Vallarta', state: '', country: 'Mexico' },
  { code: 'CZM', name: 'Cozumel International Airport', city: 'Cozumel', state: '', country: 'Mexico' },
  { code: 'MZT', name: 'Mazatlán International Airport', city: 'Mazatlán', state: '', country: 'Mexico' },
  { code: 'ACA', name: 'Acapulco International Airport', city: 'Acapulco', state: '', country: 'Mexico' },
  { code: 'HUX', name: 'Bahías de Huatulco International Airport', city: 'Huatulco', state: '', country: 'Mexico' },
  { code: 'OAX', name: 'Xoxocotlán International Airport', city: 'Oaxaca', state: '', country: 'Mexico' },
  { code: 'VSA', name: 'Carlos Rovirosa Pérez International Airport', city: 'Villahermosa', state: '', country: 'Mexico' },
  { code: 'MID', name: 'Manuel Crescencio Rejón International Airport', city: 'Mérida', state: '', country: 'Mexico' },
  { code: 'QRO', name: 'Querétaro Intercontinental Airport', city: 'Querétaro', state: '', country: 'Mexico' },
  { code: 'BJX', name: 'Bajío International Airport', city: 'León/Bajío', state: '', country: 'Mexico' },
  { code: 'CUL', name: 'Culiacán International Airport', city: 'Culiacán', state: '', country: 'Mexico' },
  { code: 'LAP', name: 'La Paz International Airport', city: 'La Paz', state: '', country: 'Mexico' },
  { code: 'ZIH', name: 'Ixtapa-Zihuatanejo International Airport', city: 'Ixtapa-Zihuatanejo', state: '', country: 'Mexico' },

  // Colombia - Major Airports
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', state: '', country: 'Colombia' },
  { code: 'MDE', name: 'José María Córdova International Airport', city: 'Medellín', state: '', country: 'Colombia' },
  { code: 'CTG', name: 'Rafael Núñez International Airport', city: 'Cartagena', state: '', country: 'Colombia' },
  { code: 'CLO', name: 'Alfonso Bonilla Aragón International Airport', city: 'Cali', state: '', country: 'Colombia' },
  { code: 'BAQ', name: 'Ernesto Cortissoz International Airport', city: 'Barranquilla', state: '', country: 'Colombia' },
  { code: 'SMR', name: 'Simón Bolívar International Airport', city: 'Santa Marta', state: '', country: 'Colombia' },
  { code: 'BGA', name: 'Palonegro International Airport', city: 'Bucaramanga', state: '', country: 'Colombia' },
  { code: 'PEI', name: 'Matecaña International Airport', city: 'Pereira', state: '', country: 'Colombia' },
  { code: 'ADZ', name: 'Gustavo Rojas Pinilla International Airport', city: 'San Andrés', state: '', country: 'Colombia' },
  { code: 'CUC', name: 'Camilo Daza International Airport', city: 'Cúcuta', state: '', country: 'Colombia' },
  { code: 'UIB', name: 'El Caraño Airport', city: 'Quibdó', state: '', country: 'Colombia' },
  { code: 'VVC', name: 'Vanguardia Airport', city: 'Villavicencio', state: '', country: 'Colombia' },
  { code: 'EYP', name: 'El Yopal Airport', city: 'Yopal', state: '', country: 'Colombia' },
  { code: 'IBE', name: 'Perales Airport', city: 'Ibagué', state: '', country: 'Colombia' },
  { code: 'NVA', name: 'Benito Salas Airport', city: 'Neiva', state: '', country: 'Colombia' },
  { code: 'MZL', name: 'La Nubia Airport', city: 'Manizales', state: '', country: 'Colombia' },
  { code: 'APO', name: 'Antonio Roldán Betancourt Airport', city: 'Apartadó', state: '', country: 'Colombia' },
  { code: 'RCH', name: 'Almirante Padilla Airport', city: 'Riohacha', state: '', country: 'Colombia' },

  // Brazil - Major Airports
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', state: '', country: 'Brazil' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', state: '', country: 'Brazil' },
  { code: 'BSB', name: 'Brasília International Airport', city: 'Brasília', state: '', country: 'Brazil' },
  { code: 'FOR', name: 'Fortaleza International Airport', city: 'Fortaleza', state: '', country: 'Brazil' },
  { code: 'REC', name: 'Recife/Guararapes International Airport', city: 'Recife', state: '', country: 'Brazil' },
  { code: 'SSA', name: 'Salvador Deputado Luís Eduardo Magalhães International Airport', city: 'Salvador', state: '', country: 'Brazil' },
  { code: 'BEL', name: 'Val de Cans International Airport', city: 'Belém', state: '', country: 'Brazil' },
  { code: 'MAO', name: 'Eduardo Gomes International Airport', city: 'Manaus', state: '', country: 'Brazil' },
  { code: 'CGH', name: 'São Paulo/Congonhas Airport', city: 'São Paulo', state: '', country: 'Brazil' },
  { code: 'SDU', name: 'Santos Dumont Airport', city: 'Rio de Janeiro', state: '', country: 'Brazil' },

  // Argentina - Major Airports
  { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', state: '', country: 'Argentina' },
  { code: 'AEP', name: 'Jorge Newbery Airfield', city: 'Buenos Aires', state: '', country: 'Argentina' },
  { code: 'COR', name: 'Córdoba Airport', city: 'Córdoba', state: '', country: 'Argentina' },
  { code: 'MDZ', name: 'Governor Francisco Gabrielli International Airport', city: 'Mendoza', state: '', country: 'Argentina' },
  { code: 'IGR', name: 'Cataratas del Iguazú International Airport', city: 'Puerto Iguazú', state: '', country: 'Argentina' },
  { code: 'BRC', name: 'San Carlos de Bariloche Airport', city: 'San Carlos de Bariloche', state: '', country: 'Argentina' },
  { code: 'FTE', name: 'El Calafate Airport', city: 'El Calafate', state: '', country: 'Argentina' },

  // Chile - Major Airports
  { code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', state: '', country: 'Chile' },
  { code: 'IPC', name: 'Mataveri International Airport', city: 'Easter Island', state: '', country: 'Chile' },
  { code: 'CCP', name: 'Carriel Sur International Airport', city: 'Concepción', state: '', country: 'Chile' },
  { code: 'ARI', name: 'Chacalluta International Airport', city: 'Arica', state: '', country: 'Chile' },
  { code: 'IQQ', name: 'Diego Aracena International Airport', city: 'Iquique', state: '', country: 'Chile' },
  { code: 'ANF', name: 'Andrés Sabella Gálvez International Airport', city: 'Antofagasta', state: '', country: 'Chile' },
  { code: 'CJC', name: 'El Loa Airport', city: 'Calama', state: '', country: 'Chile' },
  { code: 'LSC', name: 'La Florida Airport', city: 'La Serena', state: '', country: 'Chile' },
  { code: 'PMC', name: 'El Tepual Airport', city: 'Puerto Montt', state: '', country: 'Chile' },
  { code: 'PUQ', name: 'Presidente Carlos Ibáñez del Campo International Airport', city: 'Punta Arenas', state: '', country: 'Chile' },

  // Peru - Major Airports
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', state: '', country: 'Peru' },
  { code: 'CUZ', name: 'Alejandro Velasco Astete International Airport', city: 'Cusco', state: '', country: 'Peru' },
  { code: 'AQP', name: 'Alfredo Rodríguez Ballón International Airport', city: 'Arequipa', state: '', country: 'Peru' },
  { code: 'TRU', name: 'Capitán FAP Carlos Martínez de Pinillos International Airport', city: 'Trujillo', state: '', country: 'Peru' },
  { code: 'PIU', name: 'Capitán FAP Guillermo Concha Iberico International Airport', city: 'Piura', state: '', country: 'Peru' },
  { code: 'IQT', name: 'Coronel FAP Francisco Secada Vignetta International Airport', city: 'Iquitos', state: '', country: 'Peru' },

  // Ecuador - Major Airports
  { code: 'UIO', name: 'Mariscal Sucre International Airport', city: 'Quito', state: '', country: 'Ecuador' },
  { code: 'GYE', name: 'José Joaquín de Olmedo International Airport', city: 'Guayaquil', state: '', country: 'Ecuador' },
  { code: 'GPS', name: 'Seymour Airport', city: 'Galápagos', state: '', country: 'Ecuador' },
  { code: 'CUE', name: 'Mariscal Lamar International Airport', city: 'Cuenca', state: '', country: 'Ecuador' },

  // Venezuela - Major Airports
  { code: 'CCS', name: 'Simón Bolívar International Airport', city: 'Caracas', state: '', country: 'Venezuela' },
  { code: 'MAR', name: 'La Chinita International Airport', city: 'Maracaibo', state: '', country: 'Venezuela' },
  { code: 'VLN', name: 'Arturo Michelena International Airport', city: 'Valencia', state: '', country: 'Venezuela' },
  { code: 'BLA', name: 'General José Antonio Anzoátegui International Airport', city: 'Barcelona', state: '', country: 'Venezuela' },

  // Central America - Major Airports
  { code: 'GUA', name: 'La Aurora International Airport', city: 'Guatemala City', state: '', country: 'Guatemala' },
  { code: 'SAL', name: 'Monseñor Óscar Arnulfo Romero International Airport', city: 'San Salvador', state: '', country: 'El Salvador' },
  { code: 'TGU', name: 'Toncontín International Airport', city: 'Tegucigalpa', state: '', country: 'Honduras' },
  { code: 'MGA', name: 'Augusto C. Sandino International Airport', city: 'Managua', state: '', country: 'Nicaragua' },
  { code: 'SJO', name: 'Juan Santamaría International Airport', city: 'San José', state: '', country: 'Costa Rica' },
  { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', state: '', country: 'Panama' },

  // Caribbean - Major Airports
  { code: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau', state: '', country: 'Bahamas' },
  { code: 'HAV', name: 'José Martí International Airport', city: 'Havana', state: '', country: 'Cuba' },
  { code: 'SDQ', name: 'Las Américas International Airport', city: 'Santo Domingo', state: '', country: 'Dominican Republic' },
  { code: 'PUJ', name: 'Punta Cana International Airport', city: 'Punta Cana', state: '', country: 'Dominican Republic' },
  { code: 'SJU', name: 'Luis Muñoz Marín International Airport', city: 'San Juan', state: '', country: 'Puerto Rico' },
  { code: 'STI', name: 'Cibao International Airport', city: 'Santiago', state: '', country: 'Dominican Republic' },
  { code: 'AUA', name: 'Queen Beatrix International Airport', city: 'Oranjestad', state: '', country: 'Aruba' },
  { code: 'CUR', name: 'Hato International Airport', city: 'Willemstad', state: '', country: 'Curaçao' },
  { code: 'BGI', name: 'Grantley Adams International Airport', city: 'Bridgetown', state: '', country: 'Barbados' },
  { code: 'POS', name: 'Piarco International Airport', city: 'Port of Spain', state: '', country: 'Trinidad and Tobago' },
  { code: 'KIN', name: 'Norman Manley International Airport', city: 'Kingston', state: '', country: 'Jamaica' },
  { code: 'MBJ', name: 'Sangster International Airport', city: 'Montego Bay', state: '', country: 'Jamaica' },

  // Europe - Major Airports (Popular Destinations)
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', state: '', country: 'UK' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', state: '', country: 'UK' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', state: '', country: 'France' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', state: '', country: 'Germany' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', state: '', country: 'Netherlands' },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', state: '', country: 'Switzerland' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', state: '', country: 'Switzerland' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', state: '', country: 'Spain' },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat Airport', city: 'Barcelona', state: '', country: 'Spain' },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', state: '', country: 'Italy' },
  { code: 'MXP', name: 'Malpensa Airport', city: 'Milan', state: '', country: 'Italy' }
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