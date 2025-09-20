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
  // Early return or loading state if flight data is not available
  if (!flight || !flight.coordinates || !flight.coordinates.origin || !flight.coordinates.destination) {
    return (
      <div className="h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading flight map...</div>
      </div>
    );
  }

  const origin = [flight.coordinates.origin.lat, flight.coordinates.origin.lng];
  const destination = [flight.coordinates.destination.lat, flight.coordinates.destination.lng];
  
  // Calculate center point between origin and destination
  const center = [
    (flight.coordinates.origin.lat + flight.coordinates.destination.lat) / 2,
    (flight.coordinates.origin.lng + flight.coordinates.destination.lng) / 2
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
              <strong>{flight.origin || 'Origin'}</strong><br/>
              <span className="text-sm text-gray-600">{flight.originCode || ''}</span><br/>
              <span className="text-xs text-gray-500">Departure</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={destination} icon={destinationIcon}>
          <Popup>
            <div className="text-center">
              <strong>{flight.destination || 'Destination'}</strong><br/>
              <span className="text-sm text-gray-600">{flight.destinationCode || ''}</span><br/>
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