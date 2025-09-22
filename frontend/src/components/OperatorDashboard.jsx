import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';
import ConfirmationModal from './ConfirmationModal';

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
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    flightId: null,
    flightRoute: ''
  });

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

  // Refresh flights when returning from create flight page or when user changes
  useEffect(() => {
    try {
      if (user && user.id) {
        // Always refresh when component mounts or user changes
        fetchOperatorFlights();
      }
    } catch (error) {
      console.error('Error in OperatorDashboard refresh useEffect:', error);
    }
  }, [location.pathname, user?.id]); // Refresh when navigation or user changes

  // Show success message when returning from create flight page  
  useEffect(() => {
    try {
      if (location.state?.message) {
        console.log('🎉 Success message detected:', location.state.message);
        // Force a refresh after a short delay to ensure backend has processed the creation
        setTimeout(() => {
          console.log('🔄 Auto-refreshing flights after creation...');
          fetchOperatorFlights();
        }, 1000);
      }
    } catch (error) {
      console.error('Error in success message handler:', error);
    }
  }, [location.state?.message]);

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
        
        // Transform API data to match frontend expectations
        const apiFlights = response.flights || response;
        const transformedFlights = apiFlights.map(flight => ({
          ...flight,
          // Map API fields to frontend expected fields
          origin: flight.origin_code || flight.origin,
          destination: flight.destination_code || flight.destination, 
          departureTime: flight.departure_datetime || flight.departureTime,
          seatsAvailable: flight.available_seats || flight.seatsAvailable,
          // Always show charter price (mandatory field)
          price: flight.pricing?.emptyLegPrice || flight.empty_leg_price,
          bookings: flight.bookings || 0 // Add default bookings if not present
        }));
        
        console.log('🔄 Transformed flights:', transformedFlights);
        setFlights(transformedFlights);
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

  const handleDeleteFlight = async (flightId, flightRoute) => {
    setDeleteModal({
      isOpen: true,
      flightId,
      flightRoute
    });
  };

  const confirmDeleteFlight = async () => {
    const { flightId } = deleteModal;
    
    // Store the original flight data in case we need to restore it
    const originalFlight = flights.find(f => f.id === flightId);
    
    try {
      // Optimistically remove from local state immediately
      setFlights(flights.filter(f => String(f.id) !== String(flightId)));
      
      if (shouldUseRealAPI()) {
        await flightsAPI.deleteFlight(flightId);
      } else if (shouldUseMockFlightAPI()) {
        await mockFlightAPI.deleteFlight(flightId);
      } else {
        throw new Error('No API available');
      }
      
      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('flightUpdate'));
    } catch (error) {
      console.error('Error deleting flight:', error);
      
      // Restore the flight to the UI since deletion failed
      if (originalFlight) {
        setFlights(prev => [...prev, originalFlight]);
      }
      
      alert('Error deleting flight. Please try again.');
    }
  };

  const handleEditFlight = (flightId) => {
    navigate(`/edit-flight/${flightId}`);
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
                onClick={fetchOperatorFlights}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Refresh flights list"
              >
                <svg className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
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
              ${flights.reduce((sum, f) => sum + ((f.price || 0) * (f.bookings || 0)), 0).toLocaleString()}
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
                          flight.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : flight.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : flight.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {flight.status === 'approved' ? '✅ Approved' :
                           flight.status === 'pending' ? '⏳ Pending' :
                           flight.status === 'declined' ? '❌ Declined' :
                           flight.status || 'Unknown'}
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
                            onClick={() => handleDeleteFlight(flight.id, `${flight.origin_code} → ${flight.destination_code}`)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' })}
        onConfirm={confirmDeleteFlight}
        title="Delete Flight"
        message="Are you sure you want to delete this flight?"
        route={deleteModal.flightRoute}
        operatorName={user?.company_name || user?.name || 'Your company'}
        confirmText="Delete Flight"
        type="danger"
      />
    </div>
  );
}