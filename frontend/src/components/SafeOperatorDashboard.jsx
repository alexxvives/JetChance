import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';

// Safe wrapper component
export default function SafeOperatorDashboard({ user }) {
  try {
    // Immediate safety checks
    if (!user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Dashboard...</h2>
            <p className="text-gray-600">Please wait while we prepare your dashboard.</p>
          </div>
        </div>
      );
    }

    if (!user.id) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Issue</h2>
            <p className="text-gray-600 mb-4">Your session appears to be invalid.</p>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4">
              <p className="text-sm">User data: {JSON.stringify(user, null, 2)}</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear Session & Re-login
            </button>
          </div>
        </div>
      );
    }

    // If we get here, render the actual dashboard
    return <ActualOperatorDashboard user={user} />;

  } catch (error) {
    console.error('Error in SafeOperatorDashboard:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">Something went wrong loading the dashboard.</p>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            <p className="text-sm">Error: {error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

// The actual dashboard component
function ActualOperatorDashboard({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('ActualOperatorDashboard - User:', user);

  useEffect(() => {
    try {
      if (user && user.id) {
        console.log('Setting up dashboard for user:', user.id);
        fetchFlights();
      } else {
        console.warn('User validation failed in useEffect');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in dashboard useEffect:', error);
      setIsLoading(false);
    }
  }, [user]);

  const fetchFlights = async () => {
    try {
      console.log('🔄 Fetching flights for user:', user.id);
      setIsLoading(true);

      if (shouldUseRealAPI()) {
        console.log('📡 Using Real API...');
        const response = await flightsAPI.getOperatorFlights(user.id);
        console.log('📡 API Response:', response);
        console.log('📡 Flights array:', response.flights);
        setFlights(response.flights || []);
      } else if (shouldUseMockFlightAPI()) {
        console.log('🧪 Using Mock API...');
        const response = await mockFlightAPI.getOperatorFlights(user.id);
        console.log('🧪 Mock Response:', response);
        setFlights(response.flights || []);
      } else {
        console.log('❌ No API available');
        setFlights([]);
      }
    } catch (error) {
      console.error('❌ Error fetching flights:', error);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'super-admin' ? 'Super Admin Dashboard' : 'Operator Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName} {user?.lastName} - ({user?.id})
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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading flights...</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Flights Found</h3>
              <p className="text-gray-600 mb-4">You haven't created any flights yet.</p>
              <button
                onClick={() => navigate('/create-flight')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Flight
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Your Flights ({flights.length})</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {flights.map((flight) => (
                  <div key={flight.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    {/* Flight Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">Flight {flight.id}</h4>
                          <p className="text-sm text-gray-500">{flight.aircraft?.manufacturer} {flight.aircraft?.model}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        flight.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                        flight.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {flight.status === 'pending' ? '⏳ Pending' : 
                         flight.status === 'approved' ? '✅ Approved' : 
                         flight.status || 'Unknown'}
                      </span>
                    </div>

                    {/* Route Information */}
                    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{flight.origin?.code || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{flight.origin?.city || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">
                            {flight.schedule?.departure ? 
                              new Date(flight.schedule.departure).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'No date'}
                          </div>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center mx-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-px bg-gray-300 flex-1"></div>
                            <div className="bg-blue-100 p-2 rounded-full">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                            <div className="h-px bg-gray-300 flex-1"></div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{flight.destination?.code || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{flight.destination?.city || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">
                            {flight.schedule?.arrival ? 
                              new Date(flight.schedule.arrival).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'No date'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${flight.pricing?.emptyLegPrice?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Empty Leg Price</div>
                        {flight.pricing?.originalPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            ${flight.pricing.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {flight.capacity?.availableSeats || flight.aircraft?.maxPassengers || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Available Seats</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {flight.schedule?.duration || 'N/A'}h
                        </div>
                        <div className="text-xs text-gray-500">Duration</div>
                      </div>
                    </div>

                    {/* Description */}
                    {flight.description && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">{flight.description}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Flight"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Flight"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                      
                      {flight.status === 'pending' && (
                        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          ⏳ Awaiting Admin Approval
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}