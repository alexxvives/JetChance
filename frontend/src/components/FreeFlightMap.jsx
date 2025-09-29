import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export default function FreeFlightMap({ flight }) {
  console.log('🗺️ Flight data for map:', flight);
  console.log('🗺️ Flight keys:', Object.keys(flight || {}));
  console.log('🗺️ Origin code:', flight.origin_code);
  console.log('🗺️ Destination code:', flight.destination_code);
  
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
    'BAQ': { lat: 10.8896, lng: -74.7808, name: 'Ernesto Cortissoz International Airport' }
  };

  // Get coordinates from airport codes or airport objects
  const getCoordinates = (code, airportObj) => {
    if (!code) return null;
    
    // First check if we have airport object with coordinates (for custom airports)
    if (airportObj && airportObj.latitude && airportObj.longitude) {
      console.log(`🛫 Using coordinates from airport object for ${code}:`, { lat: airportObj.latitude, lng: airportObj.longitude });
      return {
        lat: airportObj.latitude,
        lng: airportObj.longitude,
        name: airportObj.name || `${code} Airport`
      };
    }
    
    // Fallback to hardcoded coordinates
    const coords = airportCoordinates[code.toUpperCase()];
    console.log(`🛫 Looking up coordinates for ${code}:`, coords);
    return coords;
  };

  const originCoords = getCoordinates(flight.origin_code, flight.origin);
  const destinationCoords = getCoordinates(flight.destination_code, flight.destination);

  console.log('🎯 Origin coords:', originCoords);
  console.log('🎯 Destination coords:', destinationCoords);

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
  
  console.log('✈️ Plane position:', planePosition);
  console.log('✈️ Delta lat:', deltaLat, 'Delta lng:', deltaLng);
  console.log('✈️ Flight angle:', angle);

  // Flight path coordinates
  const flightPath = [origin, destination];

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
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
  );
}
