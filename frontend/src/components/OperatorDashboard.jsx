import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';

export default function OperatorDashboard({ user }) {
  // Immediate safety check before any hooks
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  const location = useLocation();
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug: Log user object
  console.log('OperatorDashboard - User object:', user);

  useEffect(() => {
    try {
      if (user && user.id) {
        fetchOperatorFlights();
      } else {
        console.warn('OperatorDashboard useEffect: user or user.id is missing', { user });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in OperatorDashboard useEffect:', error);
      setIsLoading(false);
    }
  }, [user]);

  // Refresh flights when returning from create flight page
  useEffect(() => {
    try {
      if (location.state?.message && user && user.id) {
        // Show success message briefly
        setTimeout(() => {
          fetchOperatorFlights();
        }, 500);
      }
    } catch (error) {
      console.error('Error in OperatorDashboard refresh useEffect:', error);
    }
  }, [location.state, user]);

  // Safety check for user object
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  // Safety check for user.id - likely old token issue
  if (!user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Your session appears to be invalid. Please log out and log back in.</p>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4">
            <p className="text-sm">Debug info: {JSON.stringify(user)}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('accessToken');
              window.location.reload();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Clear Session & Reload
          </button>
        </div>
      </div>
    );
  }

  const fetchOperatorFlights = async () => {
    try {
      console.log('🔄 fetchOperatorFlights starting...');
      setIsLoading(true);
      
      // Check if user object exists and has required properties
      if (!user || !user.id) {
        console.error('User object is invalid:', user);
        setFlights([]);
        return;
      }
      
      console.log('✅ User validation passed, fetching flights for user:', user.id, 'Role:', user.role);
      
      console.log('🔍 Checking API configuration...');
      console.log('shouldUseRealAPI():', shouldUseRealAPI());
      console.log('shouldUseMockFlightAPI():', shouldUseMockFlightAPI());
      
      if (shouldUseRealAPI()) {
        console.log('📡 Using Real API to fetch flights...');
        const response = await flightsAPI.getOperatorFlights(user.id);
        console.log('📡 Real API response:', response);
        console.log('📡 Response type:', typeof response);
        console.log('📡 Response.flights:', response.flights);
        console.log('📡 Response.flights length:', response.flights?.length);
        setFlights(response.flights || response);
      } else if (shouldUseMockFlightAPI()) {
        console.log('🧪 Using Mock API to fetch flights...');
        const response = await mockFlightAPI.getOperatorFlights(user.id);
        console.log('🧪 Mock API response:', response);
        setFlights(response.flights);
      } else {
        console.error('❌ No API available');
        throw new Error('No API available');
      }
      
      console.log('✅ fetchOperatorFlights completed successfully');
    } catch (error) {
      console.error('❌ Error fetching flights:', error);
      // Fallback to empty array on error
      setFlights([]);
    } finally {
      console.log('🏁 fetchOperatorFlights finally block');
      setIsLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        if (shouldUseRealAPI()) {
          await flightsAPI.deleteFlight(flightId);
        } else if (shouldUseMockFlightAPI()) {
          await mockFlightAPI.deleteFlight(flightId);
        } else {
          throw new Error('No API available');
        }
        
        // Remove from local state
        setFlights(flights.filter(f => f.id !== flightId));
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
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'super-admin' ? 'Super Admin Dashboard' : 'Operator Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}
                {user?.role === 'super-admin' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Super Admin
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/create-flight')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Flight
              </button>
              {user?.role === 'super-admin' && (
                <button
                  onClick={() => navigate('/admin/pending-flights')}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Review Pending Flights
                </button>
              )}
            </div>
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