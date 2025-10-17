import React, { useEffect, useRef, useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API_BASE_URL from '../config/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom airplane icon for the route line
const airplaneIcon = new L.DivIcon({
  html: '<div style="font-size: 20px; transform: rotate(45deg);">✈️</div>',
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Custom origin icon (green)
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom destination icon (red)
const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FreeFlightMap = memo(function FreeFlightMap({ flight, onCoordinateStatus }) {
  const [airportsData, setAirportsData] = useState({});
  
  // Fetch airport data from API only once
  useEffect(() => {
    let isMounted = true;
    
    const fetchAirportData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/airports`);
        const airports = await response.json();
        
        if (isMounted) {
          // Create a map of airport code -> airport data
          const airportsMap = {};
          airports.forEach(airport => {
            airportsMap[airport.code] = airport;
          });
          
          setAirportsData(airportsMap);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch airport data:', error);
        }
      }
    };
    
    // Only fetch if we don't have data yet
    if (Object.keys(airportsData).length === 0) {
      fetchAirportData();
    }
    
    return () => { isMounted = false; };
  }, []); // Empty dependency array - only runs once
  
  // Airport coordinates lookup (we'll expand this with more airports)
  const airportCoordinates = {
    'BOS': { lat: 42.3601, lng: -71.0056, name: 'Boston Logan International' },
    'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International' },
    'LAX': { lat: 33.9425, lng: -118.4081, name: 'Los Angeles International' },
    'MIA': { lat: 25.7933, lng: -80.2906, name: 'Miami International' },
    'LAS': { lat: 36.0840, lng: -115.1537, name: 'McCarran International' },
    'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco International' },
    'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth International' },
    'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta International' },
    'ORD': { lat: 41.9742, lng: -87.9073, name: 'O\'Hare International' },
    'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma International' },
    'BOG': { lat: 4.7016, lng: -74.1469, name: 'El Dorado International Airport' },
    'MEX': { lat: 19.4363, lng: -99.0721, name: 'Mexico City International Airport' },
    'BAQ': { lat: 10.8896, lng: -74.7808, name: 'Ernesto Cortissoz International Airport' },
    'EYP': { lat: -3.6206, lng: -80.3819, name: 'Coronel E Carvajal Airport' },
    'ACA': { lat: 16.7571, lng: -99.7540, name: 'General Juan N. Álvarez International Airport' },
    'AGU': { lat: 21.7056, lng: -102.3178, name: 'Aguascalientes International Airport' },
    'TES9': { lat: 18.4397, lng: -97.4086, name: 'Córdoba Airport' }
  };

  // City coordinates for fallback when airport coordinates aren't available
  const cityCoordinates = {
    'BOGOTÁ': { lat: 4.7110, lng: -74.0721, country: 'CO' },
    'BOGOTA': { lat: 4.7110, lng: -74.0721, country: 'CO' },
    'MEDELLÍN': { lat: 6.2442, lng: -75.5812, country: 'CO' },
    'MEDELLIN': { lat: 6.2442, lng: -75.5812, country: 'CO' },
    'CALI': { lat: 3.4516, lng: -76.5320, country: 'CO' },
    'BARRANQUILLA': { lat: 10.9639, lng: -74.7964, country: 'CO' },
    'CARTAGENA': { lat: 10.3910, lng: -75.4794, country: 'CO' },
    'BUCARAMANGA': { lat: 7.1253, lng: -73.1198, country: 'CO' },
    'PEREIRA': { lat: 4.8133, lng: -75.6961, country: 'CO' },
    'CUCUTA': { lat: 7.8939, lng: -72.5078, country: 'CO' },
    'IBAGUE': { lat: 4.4389, lng: -75.2322, country: 'CO' },
    'SANTA MARTA': { lat: 11.2408, lng: -74.1990, country: 'CO' },
    'VILLAVICENCIO': { lat: 4.1420, lng: -73.6266, country: 'CO' },
    'PASTO': { lat: 1.2136, lng: -77.2811, country: 'CO' },
    'MONTERÍA': { lat: 8.7479, lng: -75.8814, country: 'CO' },
    'VALLEDUPAR': { lat: 10.4731, lng: -73.2532, country: 'CO' },
    'MANIZALES': { lat: 5.0703, lng: -75.5138, country: 'CO' },
    'NEIVA': { lat: 2.9273, lng: -75.2819, country: 'CO' },
    'SOLEDAD': { lat: 10.9185, lng: -74.7654, country: 'CO' },
    'SOACHA': { lat: 4.5827, lng: -74.2169, country: 'CO' },
    // Major international cities
    'MIAMI': { lat: 25.7617, lng: -80.1918, country: 'US' },
    'NEW YORK': { lat: 40.7128, lng: -74.0060, country: 'US' },
    'LOS ANGELES': { lat: 34.0522, lng: -118.2437, country: 'US' },
    'CHICAGO': { lat: 41.8781, lng: -87.6298, country: 'US' },
    'HOUSTON': { lat: 29.7604, lng: -95.3698, country: 'US' },
    'ATLANTA': { lat: 33.7490, lng: -84.3880, country: 'US' },
    'BOSTON': { lat: 42.3601, lng: -71.0589, country: 'US' },
    'SEATTLE': { lat: 47.6062, lng: -122.3321, country: 'US' },
    'SAN FRANCISCO': { lat: 37.7749, lng: -122.4194, country: 'US' },
    'LAS VEGAS': { lat: 36.1699, lng: -115.1398, country: 'US' },
    'DALLAS': { lat: 32.7767, lng: -96.7970, country: 'US' },
    'MEXICO CITY': { lat: 19.4326, lng: -99.1332, country: 'MX' },
    'CANCUN': { lat: 21.1619, lng: -86.8515, country: 'MX' },
    'GUADALAJARA': { lat: 20.6597, lng: -103.3496, country: 'MX' },
    'MONTERREY': { lat: 25.6866, lng: -100.3161, country: 'MX' },
    // Add more cities as needed
  };

  // Get coordinates from airport codes with database lookup first
  const getCoordinates = (code, airportObj) => {
    if (!code) return null;
    
    const upperCode = code.toUpperCase();
    
    // FIRST PRIORITY: Check fetched airport data from database
    // This includes all approved airports from the API
    if (airportsData[upperCode]) {
      const airport = airportsData[upperCode];
      const isApproved = airport.status === 'approved';
      return {
        lat: parseFloat(airport.latitude),
        lng: parseFloat(airport.longitude),
        name: airport.name || `${upperCode} Airport`,
        isExact: isApproved, // Only exact if approved
        cityName: !isApproved ? (flight.origin_code === code ? flight.origin_city : flight.destination_city) : null
      };
    }
    
    // SECOND PRIORITY: Fallback to hardcoded city coordinates (always approximate)
    const cityName = (flight.origin_code === code ? flight.origin_city : flight.destination_city);
    if (cityName) {
      const cityKey = cityName.toUpperCase().trim();
      const cityCoords = cityCoordinates[cityKey];
      if (cityCoords) {

        return {
          lat: cityCoords.lat,
          lng: cityCoords.lng,
          name: `${cityName} (City Center)`,
          isExact: false, // City coordinates are never exact
          cityName: cityName
        };
      }
    }
    

    return null;
  };

  const originCoords = getCoordinates(flight.origin_code, flight.origin);
  const destinationCoords = getCoordinates(flight.destination_code, flight.destination);




  // Check if we're using city centers instead of exact airport coordinates
  const usingCityFallback = (!originCoords?.isExact) || (!destinationCoords?.isExact);

  // Notify parent component about coordinate status (only once when coords are loaded)
  useEffect(() => {
    if (onCoordinateStatus && originCoords && destinationCoords) {
      onCoordinateStatus({
        usingFallback: usingCityFallback,
        originApproximate: !originCoords.isExact,
        destinationApproximate: !destinationCoords.isExact,
        originCode: flight.origin_code,
        destinationCode: flight.destination_code,
        originCity: originCoords.cityName || flight.origin_city,
        destinationCity: destinationCoords.cityName || flight.destination_city
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight.origin_code, flight.destination_code]);

  // Early return or loading state if coordinates are not available
  if (!originCoords || !destinationCoords) {
    return (
      <div className="h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div>Map unavailable</div>
          <div className="text-sm mt-1">
            {flight.origin_code} → {flight.destination_code}
          </div>
        </div>
      </div>
    );
  }

  const origin = [originCoords.lat, originCoords.lng];
  const destination = [destinationCoords.lat, destinationCoords.lng];
  
  // Calculate center point between origin and destination
  const center = [
    (originCoords.lat + destinationCoords.lat) / 2,
    (originCoords.lng + destinationCoords.lng) / 2
  ];

  // Calculate midpoint for plane position
  const planePosition = [
    originCoords.lat + (destinationCoords.lat - originCoords.lat) * 0.3,
    originCoords.lng + (destinationCoords.lng - originCoords.lng) * 0.3
  ];
  
  // Calculate angle from origin to destination (in degrees)
  const deltaLat = destinationCoords.lat - originCoords.lat;
  const deltaLng = destinationCoords.lng - originCoords.lng;
  const angle = Math.atan2(deltaLng, deltaLat) * 180 / Math.PI;

  // Flight path coordinates
  const flightPath = [origin, destination];

  return (
    <div className="w-full">
      {/* Warning message when using city centers */}
      {usingCityFallback && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-sm text-yellow-800">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>
              Map markers show city centers, not exact airport locations.
              {!originCoords.isExact && !destinationCoords.isExact 
                ? ` ${flight.origin_code} and ${flight.destination_code} locations are approximate.`
                : !originCoords.isExact 
                  ? ` ${flight.origin_code} location is approximate.`
                  : ` ${flight.destination_code} location is approximate.`
              }
            </span>
          </div>
        </div>
      )}
      
      <div className="w-full rounded-lg overflow-hidden" style={{ height: '450px' }}>
      <MapContainer
        center={center}
        zoom={4}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        {/* Free OpenStreetMap tiles - no API key required! */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Origin marker */}
        <Marker position={origin} icon={originIcon}>
          <Popup>
            <div className="text-center">
              <strong>{flight.origin || originCoords.name}</strong><br/>
              <span className="text-sm text-gray-600">{flight.origin_code || ''}</span><br/>
              <span className="text-xs text-gray-500">Departure</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={destination} icon={destinationIcon}>
          <Popup>
            <div className="text-center">
              <strong>{flight.destination || destinationCoords.name}</strong><br/>
              <span className="text-sm text-gray-600">{flight.destination_code || ''}</span><br/>
              <span className="text-xs text-gray-500">Arrival</span>
            </div>
          </Popup>
        </Marker>

        {/* Flight path line */}
        <Polyline
          positions={flightPath}
          color="#3B82F6"
          weight={3}
          opacity={0.8}
          dashArray="10, 5"
        />

        {/* Airplane icon on flight path */}
        <Marker 
          position={planePosition} 
          icon={new L.Icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(${angle})"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#000"/></svg>`)}`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          })}
        >
          <Popup>✈️ Flight Path</Popup>
        </Marker>
      </MapContainer>
      </div>
    </div>
  );
});

export default FreeFlightMap;
