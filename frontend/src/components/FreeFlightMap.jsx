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
    'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma International' }
  };

  // Get coordinates from airport codes
  const getCoordinates = (code) => {
    if (!code) return null;
    const coords = airportCoordinates[code.toUpperCase()];
    console.log(`🛫 Looking up coordinates for ${code}:`, coords);
    return coords;
  };

  const originCoords = getCoordinates(flight.origin_code);
  const destinationCoords = getCoordinates(flight.destination_code);

  console.log('🎯 Origin coords:', originCoords);
  console.log('🎯 Destination coords:', destinationCoords);

  // Early return or loading state if coordinates are not available
  if (!originCoords || !destinationCoords) {
    return (
      <div className="h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div>Map unavailable</div>
          <div className="text-sm mt-1">
            {flight.origin_code || 'Unknown'} → {flight.destination_code || 'Unknown'}
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
      </MapContainer>
    </div>
  );
}