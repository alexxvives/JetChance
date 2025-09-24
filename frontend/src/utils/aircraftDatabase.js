// Real aircraft database for private aviation
export const privateTurbopropAircraft = [
  'Beechcraft King Air 350',
  'Beechcraft King Air 250',
  'Beechcraft King Air 200',
  'Cessna Caravan 208',
  'Cessna 441 Conquest',
  'Piper Cheyenne 400',
  'Pilatus PC-12',
  'TBM 940',
  'TBM 930',
  'Daher TBM 910',
  'Piper M500',
  'Piper M600',
  'Beechcraft Denali',
  'Twin Commander 690',
  'Cessna 208B Grand Caravan'
];

export const lightJets = [
  'Cessna Citation M2',
  'Cessna Citation CJ3+',
  'Cessna Citation CJ4',
  'Embraer Phenom 100',
  'Embraer Phenom 300',
  'HondaJet Elite',
  'Learjet 75',
  'Learjet 45XR',
  'Nextant 400XTi',
  'Cirrus Vision Jet',
  'Eclipse 550',
  'Beechcraft Premier 1A'
];

export const midSizeJets = [
  'Cessna Citation XLS+',
  'Cessna Citation Latitude',
  'Embraer Legacy 450',
  'Embraer Legacy 500',
  'Bombardier Learjet 60XR',
  'Hawker 800XP',
  'Hawker 850XP',
  'Hawker 900XP',
  'Beechcraft Hawker 4000',
  'Gulfstream G150',
  'Dassault Falcon 2000S',
  'Citation Sovereign+'
];

export const superMidSizeJets = [
  'Cessna Citation X+',
  'Bombardier Challenger 350',
  'Bombardier Challenger 300',
  'Embraer Legacy 600',
  'Embraer Praetor 600',
  'Dassault Falcon 2000LX',
  'Dassault Falcon 900LX',
  'Gulfstream G280',
  'Hawker 4000',
  'Citation Longitude'
];

export const heavyJets = [
  'Gulfstream G650',
  'Gulfstream G600',
  'Gulfstream G550',
  'Gulfstream G500',
  'Bombardier Global 6000',
  'Bombardier Global 7500',
  'Dassault Falcon 7X',
  'Dassault Falcon 8X',
  'Embraer Legacy 650',
  'Embraer Lineage 1000',
  'Boeing Business Jet',
  'Airbus ACJ319',
  'Cessna Citation Hemisphere'
];

export const helicopters = [
  'Bell 407',
  'Bell 429',
  'Bell 206',
  'Airbus H125',
  'Airbus H130',
  'Airbus H145',
  'Leonardo AW109',
  'Leonardo AW139',
  'Sikorsky S-76',
  'Robinson R44',
  'Robinson R66'
];

// Get random aircraft by category
export const getRandomAircraft = (category = 'any') => {
  let aircraftList = [];
  
  switch (category) {
    case 'turboprop':
      aircraftList = privateTurbopropAircraft;
      break;
    case 'light':
      aircraftList = lightJets;
      break;
    case 'midsize':
      aircraftList = midSizeJets;
      break;
    case 'super-midsize':
      aircraftList = superMidSizeJets;
      break;
    case 'heavy':
      aircraftList = heavyJets;
      break;
    case 'helicopter':
      aircraftList = helicopters;
      break;
    case 'jet':
      aircraftList = [...lightJets, ...midSizeJets, ...superMidSizeJets, ...heavyJets];
      break;
    case 'any':
    default:
      aircraftList = [
        ...privateTurbopropAircraft,
        ...lightJets,
        ...midSizeJets,
        ...superMidSizeJets,
        ...heavyJets
      ];
      break;
  }
  
  return aircraftList[Math.floor(Math.random() * aircraftList.length)];
};

// Get aircraft suitable for route distance
export const getAircraftForDistance = (distanceKm) => {
  if (distanceKm < 500) {
    // Short flights - turboprops or light jets
    const shortHaulAircraft = [...privateTurbopropAircraft, ...lightJets];
    return shortHaulAircraft[Math.floor(Math.random() * shortHaulAircraft.length)];
  } else if (distanceKm < 1500) {
    // Medium flights - light to midsize jets
    const mediumHaulAircraft = [...lightJets, ...midSizeJets];
    return mediumHaulAircraft[Math.floor(Math.random() * mediumHaulAircraft.length)];
  } else if (distanceKm < 3000) {
    // Long flights - midsize to super midsize
    const longHaulAircraft = [...midSizeJets, ...superMidSizeJets];
    return longHaulAircraft[Math.floor(Math.random() * longHaulAircraft.length)];
  } else {
    // Very long flights - super midsize to heavy jets
    const veryLongHaulAircraft = [...superMidSizeJets, ...heavyJets];
    return veryLongHaulAircraft[Math.floor(Math.random() * veryLongHaulAircraft.length)];
  }
};

// Get aircraft capacity (typical passenger configurations)
export const getAircraftCapacity = (aircraftName) => {
  if (privateTurbopropAircraft.includes(aircraftName)) {
    return Math.floor(Math.random() * 6) + 4; // 4-9 passengers
  } else if (lightJets.includes(aircraftName)) {
    return Math.floor(Math.random() * 4) + 4; // 4-7 passengers
  } else if (midSizeJets.includes(aircraftName)) {
    return Math.floor(Math.random() * 3) + 6; // 6-8 passengers
  } else if (superMidSizeJets.includes(aircraftName)) {
    return Math.floor(Math.random() * 4) + 8; // 8-11 passengers
  } else if (heavyJets.includes(aircraftName)) {
    return Math.floor(Math.random() * 6) + 10; // 10-15 passengers
  } else if (helicopters.includes(aircraftName)) {
    return Math.floor(Math.random() * 3) + 3; // 3-5 passengers
  }
  return Math.floor(Math.random() * 6) + 4; // Default 4-9
};

// Colombian airline operators (real companies)
export const colombianOperators = [
  'Avianca Executive',
  'LATAM Private Jets',
  'Helicol',
  'AeroSucre',
  'Satena',
  'Easy Fly',
  'Copa Airlines Colombia',
  'Wingo',
  'Ultra Air',
  'Laser Airlines Colombia',
  'Aires Colombia',
  'TAC Transportes Aéreos',
  'Searca',
  'Aerolíneas de Antioquia',
  'Aerolineas del Caribe'
];

export const getRandomOperator = () => {
  return colombianOperators[Math.floor(Math.random() * colombianOperators.length)];
};