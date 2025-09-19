import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';

export default function OperatorDashboard({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOperatorFlights();
  }, []);

  // Refresh flights when returning from create flight page
  useEffect(() => {
    if (location.state?.message) {
      // Show success message briefly
      setTimeout(() => {
        fetchOperatorFlights();
      }, 500);
    }
  }, [location.state]);

  const fetchOperatorFlights = async () => {
    try {
      setIsLoading(true);
      
      if (shouldUseMockFlightAPI()) {
        const response = await mockFlightAPI.getOperatorFlights(user.id);
        setFlights(response.flights);
      } else {
        // TODO: Replace with actual API call when backend is ready
        // const response = await fetch('/api/operator/flights');
        // const data = await response.json();
        // setFlights(data.flights);
        throw new Error('Real API not implemented yet');
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      // Fallback to empty array on error
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        if (shouldUseMockFlightAPI()) {
          await mockFlightAPI.deleteFlight(flightId);
          setFlights(flights.filter(f => f.id !== flightId));
        } else {
          // TODO: Real API call when backend is ready
          throw new Error('Real API not implemented yet');
        }
      } catch (error) {
        console.error('Error deleting flight:', error);
        alert('Error deleting flight. Please try again.');
      }
    }
  };

  const handleEditFlight = (flightId) => {
    // TODO: Implement edit functionality - could open modal or navigate to edit page
    console.log('Edit flight:', flightId);
    // For now, just show an alert
    alert('Edit functionality will be implemented soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Success message */}
          {location.state?.message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
              {location.state.message}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operator Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <button
              onClick={() => navigate('/create-flight')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Flight
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-2xl font-bold text-gray-900">{flights.length}</div>
            <div className="text-sm text-gray-600">Active Flights</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600">
              {flights.reduce((sum, f) => sum + f.bookings, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600">
              ${flights.reduce((sum, f) => sum + (f.price * f.bookings), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
        </div>

        {/* Flights Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Flights</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading flights...</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No flights found. Create your first flight!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flights.map((flight) => (
                    <tr key={flight.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {flight.origin} → {flight.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(flight.departureTime).toLocaleDateString()} at{' '}
                        {new Date(flight.departureTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                        ${flight.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {flight.seatsAvailable}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {flight.bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                          flight.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {flight.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/flight/${flight.id}`)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                            title="View Flight Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleEditFlight(flight.id)}
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                            title="Edit Flight"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFlight(flight.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                            title="Delete Flight"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}