import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import { mockFlightAPI, shouldUseMockFlightAPI } from '../utils/mockFlightAPI';
import ConfirmationModal from './ConfirmationModal';

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
          <p className="text-gray-600 mb-4">An unexpected error occurred while loading your dashboard.</p>
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
            <p className="text-sm">{error.message}</p>
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
  const [isPastFlightsCollapsed, setIsPastFlightsCollapsed] = useState(true); // Collapsed by default
  const [isUpcomingFlightsCollapsed, setIsUpcomingFlightsCollapsed] = useState(false); // Expanded by default
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    flightId: null,
    flightRoute: ''
  });

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

  // Listen for flight updates to refresh the list
  useEffect(() => {
    const handleFlightUpdate = () => {
      console.log('🔄 Flight updated - refreshing list');
      fetchFlights();
    };

    window.addEventListener('flightUpdate', handleFlightUpdate);
    return () => window.removeEventListener('flightUpdate', handleFlightUpdate);
  }, []);

  const fetchFlights = async () => {
    try {
      console.log('🔄 Fetching flights for user:', user.id);
      setIsLoading(true);

      if (shouldUseRealAPI()) {
        console.log('📡 Using Real API...');
        const response = await flightsAPI.getOperatorFlights(user.id);
        console.log('📡 API Response:', response);
        console.log('📡 Flights array:', response.flights);
        console.log('📡 First flight sample:', response.flights?.[0]);
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

  // Function to categorize flights based on departure date
  const categorizeFlights = (flights) => {
    const now = new Date();
    const currentFlights = [];
    const pastFlights = [];

    flights.forEach(flight => {
      const departureDate = new Date(flight.departure_datetime || flight.schedule?.departure);
      if (departureDate > now) {
        currentFlights.push(flight);
      } else {
        pastFlights.push(flight);
      }
    });

    return { currentFlights, pastFlights };
  };

  // Delete flight functionality
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
      
      // Close the modal
      setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' });
      
      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('flightUpdate'));
    } catch (error) {
      console.error('Error deleting flight:', error);
      
      // Restore the flight to the UI since deletion failed
      if (originalFlight) {
        setFlights(prev => [...prev, originalFlight]);
      }
      
      // Close the modal
      setDeleteModal({ isOpen: false, flightId: null, flightRoute: '' });
      
      alert('Error deleting flight. Please try again.');
    }
  };

  const { currentFlights, pastFlights } = categorizeFlights(flights);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto pt-16 pb-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome back, {user.name}! Manage your flights and track their status.
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
            <div className="space-y-8">
              {/* Upcoming Flights Section */}
              {currentFlights.length > 0 && (
                <div>
                  <div 
                    className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                    onClick={() => setIsUpcomingFlightsCollapsed(!isUpcomingFlightsCollapsed)}
                  >
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Upcoming Flights ({currentFlights.length})
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {isUpcomingFlightsCollapsed ? 'Show' : 'Hide'}
                      </span>
                      {isUpcomingFlightsCollapsed ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Collapsible content */}
                  {!isUpcomingFlightsCollapsed && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 transition-all duration-300 ease-in-out">
                      {currentFlights.map((flight) => (
                        <FlightCard key={flight.id} flight={flight} navigate={navigate} onDelete={handleDeleteFlight} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Past Flights Section */}
              {pastFlights.length > 0 && (
                <div>
                  <div 
                    className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                    onClick={() => setIsPastFlightsCollapsed(!isPastFlightsCollapsed)}
                  >
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Past Flights ({pastFlights.length})
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {isPastFlightsCollapsed ? 'Show' : 'Hide'}
                      </span>
                      {isPastFlightsCollapsed ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Collapsible content */}
                  {!isPastFlightsCollapsed && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 transition-all duration-300 ease-in-out">
                      {pastFlights.map((flight) => (
                        <FlightCard key={flight.id} flight={flight} navigate={navigate} isPast={true} onDelete={handleDeleteFlight} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Show message if only one category exists */}
              {currentFlights.length === 0 && pastFlights.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    All your flights have departed. Consider creating new flights for upcoming trips.
                  </p>
                </div>
              )}
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
        type="danger"
        confirmText="Delete Flight"
      />
    </div>
  );
}

// Flight Card Component
function FlightCard({ flight, navigate, isPast = false, onDelete }) {
  console.log('🎯 FlightCard flight data:', flight);
  
  const cardOpacity = isPast ? 'opacity-75' : '';
  const headerGradient = 'bg-gradient-to-r from-blue-50 to-indigo-50'; // Same blue gradient for all flights

  return (
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300 ${cardOpacity}`}>
      {/* Flight Header with Aircraft & Date */}
      <div className={`${headerGradient} px-4 py-3 rounded-t-lg border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">
                {flight.aircraft?.name || flight.aircraft?.manufacturer || 'Private Jet'}
              </h4>
              <p className="text-sm text-gray-600">
                {flight.departure_datetime || flight.schedule?.departure ? 
                  new Date(flight.departure_datetime || flight.schedule.departure).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Date TBD'}
              </p>
            </div>
          </div>
          {isPast && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Flight Content */}
      <div className="p-3">
        {/* Departure Details - Grayed out rectangle */}
        <div className="bg-gray-100 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600">FROM</p>
              <p className="text-xl font-bold text-gray-900">{flight.origin?.code || 'N/A'}</p>
            </div>
            <svg className="w-5 h-5 text-gray-500 mx-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="text-center">
              <p className="text-sm text-gray-600">TO</p>
              <p className="text-xl font-bold text-gray-900">{flight.destination?.code || 'N/A'}</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              {flight.departure_datetime || flight.schedule?.departure ? 
                new Date(flight.departure_datetime || flight.schedule.departure).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Date TBD'}
            </p>
          </div>
        </div>

        {/* Info squares below */}
        <div className="grid grid-cols-3 gap-2">
          {/* Status square */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              flight.status === 'approved' ? 'bg-green-100 text-green-700' :
              flight.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              flight.status === 'denied' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {flight.status || 'Unknown'}
            </span>
          </div>

          {/* Seats square */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Seats</p>
            <p className="font-medium text-gray-900">{flight.capacity?.availableSeats || 'N/A'}</p>
          </div>

          {/* Price square */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="font-medium text-gray-900">${flight.pricing?.emptyLegPrice ? flight.pricing.emptyLegPrice.toLocaleString() : 'N/A'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => navigate(`/flight/${flight.id}`)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          {!isPast && (
            <>
              <button
                onClick={() => navigate(`/edit-flight/${flight.id}`)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                title="Edit Flight"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(flight.id, `${flight.origin?.code || 'Unknown'} → ${flight.destination?.code || 'Unknown'}`)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Flight"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}