import React, { useState, useEffect } from 'react';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';

export default function DebugFlights() {
  const [flights, setFlights] = useState([]);
  const [localStorageData, setLocalStorageData] = useState(null);

  useEffect(() => {
    const checkData = async () => {
      try {
        // Check localStorage directly
        const stored = localStorage.getItem('chancefly_mock_flights');
        setLocalStorageData(stored ? JSON.parse(stored) : null);

        // Check API data
        if (shouldUseMockFlightAPI()) {
          const allFlights = await mockFlightAPI.getFlights();
          setFlights(allFlights);
        }
      } catch (error) {
        console.error('Debug error:', error);
      }
    };

    checkData();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-white p-4 border rounded shadow-lg z-50 max-w-md max-h-96 overflow-auto text-xs">
      <h3 className="font-bold mb-2">Debug Flight Data</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">API Flights ({flights.length}):</h4>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(flights, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">localStorage Data:</h4>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>
    </div>
  );
}