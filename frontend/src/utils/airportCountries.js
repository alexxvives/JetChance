// Airport code to country mapping
const AIRPORT_COUNTRIES = {
  // Colombia
  'BOG': 'CO', // Bogotá - El Dorado International Airport
  'CTG': 'CO', // Cartagena - Rafael Núñez International Airport  
  'MDE': 'CO', // Medellín - José María Córdova International Airport
  'CLO': 'CO', // Cali - Alfonso Bonilla Aragón International Airport
  'BAQ': 'CO', // Barranquilla - Ernesto Cortissoz International Airport
  'BGA': 'CO', // Bucaramanga - Palonegro International Airport
  'ADZ': 'CO', // San Andrés - Gustavo Rojas Pinilla International Airport
  'LET': 'CO', // Leticia - Alfredo Vásquez Cobo International Airport

  // United States
  'MIA': 'US', // Miami International Airport
  'LAX': 'US', // Los Angeles International Airport
  'JFK': 'US', // John F. Kennedy International Airport
  'LGA': 'US', // LaGuardia Airport
  'EWR': 'US', // Newark Liberty International Airport
  'ORD': 'US', // Chicago O'Hare International Airport
  'DFW': 'US', // Dallas/Fort Worth International Airport
  'PHX': 'US', // Phoenix Sky Harbor International Airport
  'DEN': 'US', // Denver International Airport
  'ATL': 'US', // Hartsfield-Jackson Atlanta International Airport
  'LAS': 'US', // McCarran International Airport (Las Vegas)
  'SFO': 'US', // San Francisco International Airport
  'SEA': 'US', // Seattle-Tacoma International Airport
  'BOS': 'US', // Boston Logan International Airport
  'IAH': 'US', // George Bush Intercontinental Airport (Houston)
  'MSP': 'US', // Minneapolis-Saint Paul International Airport
  'DTW': 'US', // Detroit Metropolitan Wayne County Airport
  'PHL': 'US', // Philadelphia International Airport
  'BWI': 'US', // Baltimore/Washington International Airport
  'DCA': 'US', // Ronald Reagan Washington National Airport
  'IAD': 'US', // Washington Dulles International Airport

  // Mexico
  'MEX': 'MX', // Mexico City International Airport
  'CUN': 'MX', // Cancún International Airport
  'GDL': 'MX', // Guadalajara International Airport
  'PVR': 'MX', // Puerto Vallarta International Airport
  'MTY': 'MX', // Monterrey International Airport
  'TIJ': 'MX', // Tijuana International Airport
  'SJD': 'MX', // Los Cabos International Airport
  'ACA': 'MX', // Acapulco International Airport
  'MZT': 'MX', // Mazatlán International Airport
  'CZM': 'MX', // Cozumel International Airport

  // Panama
  'PTY': 'PA', // Tocumen International Airport (Panama City)
  'DAV': 'PA', // Enrique Malek International Airport (David)

  // Costa Rica
  'SJO': 'CR', // Juan Santamaría International Airport (San José)
  'LIR': 'CR', // Daniel Oduber Quirós International Airport (Liberia)

  // Ecuador
  'UIO': 'EC', // Mariscal Sucre International Airport (Quito)
  'GYE': 'EC', // José Joaquín de Olmedo International Airport (Guayaquil)

  // Peru
  'LIM': 'PE', // Jorge Chávez International Airport (Lima)
  'CUZ': 'PE', // Alejandro Velasco Astete International Airport (Cusco)

  // Brazil
  'GRU': 'BR', // São Paulo/Guarulhos International Airport
  'GIG': 'BR', // Rio de Janeiro/Galeão International Airport
  'BSB': 'BR', // Brasília International Airport
  'FOR': 'BR', // Fortaleza International Airport
  'REC': 'BR', // Recife International Airport
  'SSA': 'BR', // Salvador International Airport
  'MAO': 'BR', // Manaus International Airport

  // Argentina
  'EZE': 'AR', // Ezeiza International Airport (Buenos Aires)
  'AEP': 'AR', // Jorge Newbery Airfield (Buenos Aires)
  'COR': 'AR', // Córdoba International Airport
  'MDZ': 'AR', // Governor Francisco Gabrielli International Airport (Mendoza)

  // Chile
  'SCL': 'CL', // Santiago International Airport
  'ANF': 'CL', // Antofagasta International Airport

  // Uruguay
  'MVD': 'UY', // Montevideo International Airport

  // Venezuela
  'CCS': 'VE', // Simón Bolívar International Airport (Caracas)
  'MAR': 'VE', // La Chinita International Airport (Maracaibo)

  // Canada
  'YYZ': 'CA', // Toronto Pearson International Airport
  'YUL': 'CA', // Montreal-Pierre Elliott Trudeau International Airport
  'YVR': 'CA', // Vancouver International Airport
  'YYC': 'CA', // Calgary International Airport

  // Europe (common destinations)
  'LHR': 'GB', // London Heathrow Airport
  'CDG': 'FR', // Charles de Gaulle Airport (Paris)
  'FCO': 'IT', // Leonardo da Vinci International Airport (Rome)
  'MAD': 'ES', // Madrid-Barajas Airport
  'BCN': 'ES', // Barcelona Airport
  'FRA': 'DE', // Frankfurt Airport
  'AMS': 'NL', // Amsterdam Airport Schiphol
  'ZUR': 'CH', // Zurich Airport
  'VIE': 'AT', // Vienna International Airport
  'ARN': 'SE', // Stockholm Arlanda Airport
  'CPH': 'DK', // Copenhagen Airport
  'OSL': 'NO'  // Oslo Airport
};

export const getCountryByAirportCode = (airportCode) => {
  if (!airportCode) return 'CO'; // Default to Colombia if no code provided
  
  const code = airportCode.toUpperCase().trim();
  return AIRPORT_COUNTRIES[code] || 'CO'; // Default to Colombia if airport not found
};

export const isInternationalRoute = (originCode, destinationCode) => {
  const originCountry = getCountryByAirportCode(originCode);
  const destinationCountry = getCountryByAirportCode(destinationCode);
  
  return originCountry !== destinationCountry;
};

export default AIRPORT_COUNTRIES;