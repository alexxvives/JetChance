import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, EyeIcon, PlusIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import FlightFilters from './FlightFilters';
import FlightList from '../FlightList';
import ErrorBoundary from './ErrorBoundary';
import ConfirmationModal from './ConfirmationModal';

// Helper function to format COP with separate styling for currency label
const formatCOPWithStyling = (amount) => {
  if (!amount) return { number: '0', currency: 'COP' };
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return { number: formatted, currency: 'COP' };
};

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [pendingFlights, setPendingFlights] = useState([]);
  const [pendingOperators, setPendingOperators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingFlights, setProcessingFlights] = useState(new Set());
  const [processingOperators, setProcessingOperators] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    flightId: null, 
    operatorName: '', 
    route: '' 
  });
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });

  // Fetch pending flights for approval
  const fetchPendingFlights = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Admin fetching pending flights...');
      
      if (shouldUseRealAPI()) {
        // Get all pending flights for admin review
        const response = await flightsAPI.getAllFlights({
          status: 'pending'
        });
        console.log('📡 Admin pending flights:', response);
        setPendingFlights(response.flights || []);
      }
    } catch (error) {
      console.error('❌ Error fetching pending flights:', error);
      setPendingFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending operators for approval
  const fetchPendingOperators = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Admin fetching pending operators...');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No auth token found');
        return;
      }

      const response = await fetch('/api/operators/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Admin pending operators:', data);
        setPendingOperators(data.operators || []);
      } else {
        console.error('❌ Failed to fetch pending operators:', response.status);
        setPendingOperators([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pending operators:', error);
      setPendingOperators([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete flight functionality
  const handleDeleteFlight = async (flightId, operatorName, route) => {
    setDeleteModal({
      isOpen: true,
      flightId,
      operatorName,
      route
    });
  };

  const confirmDeleteFlight = async () => {
    const { flightId, operatorName, route } = deleteModal;
    
    // Store the original flight data in case we need to restore it
    const originalPendingFlight = pendingFlights.find(f => f.id === flightId);
    
    try {
      setProcessingFlights(prev => new Set(prev).add(flightId));
      
      // Optimistically remove the flight from UI immediately
      console.log('🗑️ Removing flight from UI state. Flight ID:', flightId, typeof flightId);
      console.log('📋 Current pending flights count:', pendingFlights.length);
      
      setPendingFlights(prev => {
        const filtered = prev.filter(flight => String(flight.id) !== String(flightId));
        console.log('📋 Pending flights after filter:', filtered.length, 'removed:', prev.length - filtered.length);
        return filtered;
      });
      
      // Then make the API call
      
      const token = localStorage.getItem('accessToken');
      console.log('🔐 Delete request - Token exists:', !!token);
      console.log('� Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('�🗑️ Deleting flight:', flightId);
      console.log('🌐 Making request to:', `/api/flights/${flightId}`);
      
      const response = await fetch(`/api/flights/${flightId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response ok:', response.ok);
      console.log('📡 Delete response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete error response:', errorText);
        console.error('❌ Delete response status:', response.status);
        console.error('❌ Delete response statusText:', response.statusText);
        
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('❌ Failed to parse error response as JSON:', e);
          errorData = { error: errorText || 'Unknown error' };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Delete success:', result);
      
      console.log('Flight deleted successfully');
      // Note: No alert needed - the UI update is sufficient feedback
      
      // Notify FlightList component to refresh
      window.dispatchEvent(new CustomEvent('flightUpdate'));
    } catch (error) {
      console.error('Error deleting flight:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Restore the flight to the UI since deletion failed
      if (originalPendingFlight) {
        setPendingFlights(prev => [...prev, originalPendingFlight]);
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert(`Network error: Unable to connect to server. Please check if the backend is running.`);
      } else if (error.message) {
        alert(`Failed to delete flight: ${error.message}`);
      } else {
        alert('Failed to delete flight: Unknown error occurred');
      }
    } finally {
      setProcessingFlights(prev => {
        const newSet = new Set(prev);
        newSet.delete(flightId);
        return newSet;
      });
    }
  };

  // Approve flight
  const approveFlight = async (flightId) => {
    try {
      console.log(`✅ Approving flight ${flightId}...`);
      
      if (shouldUseRealAPI()) {
        await flightsAPI.updateFlightStatus(flightId, 'approved');
        await fetchPendingFlights(); // Refresh the list
        console.log(`✅ Flight ${flightId} approved successfully`);
      }
    } catch (error) {
      console.error(`❌ Error approving flight ${flightId}:`, error);
    }
  };

  // Deny flight
  const denyFlight = async (flightId) => {
    try {
      console.log(`❌ Denying flight ${flightId}...`);
      
      if (shouldUseRealAPI()) {
  await flightsAPI.updateFlightStatus(flightId, 'declined');
        await fetchPendingFlights(); // Refresh the list
        console.log(`❌ Flight ${flightId} denied successfully`);
      }
    } catch (error) {
      console.error(`❌ Error denying flight ${flightId}:`, error);
    }
  };

  // Approve operator
  const approveOperator = async (operatorId) => {
    try {
      setProcessingOperators(prev => new Set(prev).add(operatorId));
      console.log(`✅ Approving operator ${operatorId}...`);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/operators/${operatorId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        await fetchPendingOperators(); // Refresh the list
        console.log(`✅ Operator ${operatorId} approved successfully`);
      } else {
        console.error('❌ Failed to approve operator:', response.status);
        alert('Failed to approve operator');
      }
    } catch (error) {
      console.error(`❌ Error approving operator ${operatorId}:`, error);
      alert('Error approving operator');
    } finally {
      setProcessingOperators(prev => {
        const newSet = new Set(prev);
        newSet.delete(operatorId);
        return newSet;
      });
    }
  };

  // Deny operator
  const denyOperator = async (operatorId, reason = '') => {
    try {
      setProcessingOperators(prev => new Set(prev).add(operatorId));
      console.log(`❌ Denying operator ${operatorId}...`);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/operators/${operatorId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'denied', reason })
      });

      if (response.ok) {
        await fetchPendingOperators(); // Refresh the list
        console.log(`❌ Operator ${operatorId} denied successfully`);
      } else {
        console.error('❌ Failed to deny operator:', response.status);
        alert('Failed to deny operator');
      }
    } catch (error) {
      console.error(`❌ Error denying operator ${operatorId}:`, error);
      alert('Error denying operator');
    } finally {
      setProcessingOperators(prev => {
        const newSet = new Set(prev);
        newSet.delete(operatorId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingFlights();
    } else if (activeTab === 'operators') {
      fetchPendingOperators();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'catalog', name: 'Flight Catalog', icon: EyeIcon },
    { id: 'approvals', name: 'Flight Approvals', icon: CheckIcon, badge: pendingFlights.length },
    { id: 'operators', name: 'Operator Approvals', icon: UsersIcon, badge: pendingOperators.length },
    { id: 'create', name: 'Create Flight', icon: PlusIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Super Admin
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                  {tab.badge > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'catalog' && (
            <ErrorBoundary>
              <div className="px-6 py-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Flight Catalog</h2>
                <p className="text-gray-600 mb-6">View all available flights as customers see them</p>
                
                <FlightFilters filters={filters} setFilters={setFilters} />
              </div>
              <div className="px-2">
                <FlightList 
                  filters={filters} 
                  isAdminView={true} 
                  onDeleteFlight={handleDeleteFlight}
                />
              </div>
            </ErrorBoundary>
          )}

          {activeTab === 'approvals' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Flight Approvals</h2>
              <p className="text-gray-600 mb-6">Review and approve pending flights from operators</p>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading pending flights...</p>
                </div>
              ) : pendingFlights.length === 0 ? (
                <div className="text-center py-8">
                  <CheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-600">No pending flights require approval at this time.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingFlights.map((flight) => (
                    <div key={flight.id} className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-yellow-100 p-2 rounded-lg">
                              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-gray-900">Flight {flight.id}</h4>
                              <p className="text-sm text-blue-600 font-medium">
                                {flight.operator?.firstName && flight.operator?.lastName && flight.operator?.operatorId
                                  ? `${flight.operator.firstName} ${flight.operator.lastName} (${flight.operator.operatorId})`
                                  : 'Unknown Operator'
                                }
                              </p>
                            </div>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                              ⏳ Pending Approval
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Route</p>
                              <p className="text-sm text-gray-900">
                                {flight.origin?.code} → {flight.destination?.code}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Departure</p>
                              <p className="text-sm text-gray-900">
                                {flight.schedule?.departure ? new Date(flight.schedule.departure).toLocaleDateString() : 'TBD'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Price</p>
                              <p className="text-sm text-gray-900 flex items-baseline">
                                <span className="text-xs font-normal text-gray-500 mr-1">
                                  {formatCOPWithStyling(flight.pricing?.emptyLegPrice).currency}
                                </span>
                                {formatCOPWithStyling(flight.pricing?.emptyLegPrice).number}
                                <span className="text-gray-500 line-through ml-2 flex items-baseline">
                                  <span className="text-xs text-gray-500 mr-1">
                                    {formatCOPWithStyling(flight.pricing?.originalPrice).currency}
                                  </span>
                                  {formatCOPWithStyling(flight.pricing?.originalPrice).number}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Seats</p>
                              <p className="text-sm text-gray-900">{flight.capacity?.availableSeats}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-600">Description</p>
                            {flight.description && flight.description.trim() && flight.description !== 'Private Jet flight' ? (
                              <p className="text-sm text-gray-900">{flight.description}</p>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No description</p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-3 ml-6">
                          <button
                            onClick={() => approveFlight(flight.id)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => denyFlight(flight.id)}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'operators' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Operator Approvals</h2>
              <p className="text-gray-600 mb-6">Review and approve pending operator registrations</p>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading pending operators...</p>
                </div>
              ) : pendingOperators.length === 0 ? (
                <div className="text-center py-8">
                  <CheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Operators</h3>
                  <p className="text-gray-600">All operator registrations have been processed</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingOperators.map((operator) => (
                    <div
                      key={operator.id}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-yellow-100 rounded-full">
                            <UsersIcon className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">
                              {operator.firstName} {operator.lastName}
                            </h4>
                            <p className="text-sm text-blue-600 font-medium">{operator.email}</p>
                            <p className="text-sm text-gray-600">{operator.companyName}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                          ⏳ Pending Approval
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Registration Date:</span>
                          <p className="text-sm text-gray-900">{new Date(operator.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Status:</span>
                          <p className="text-sm text-gray-900">{operator.status}</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          disabled={processingOperators.has(operator.id)}
                          onClick={() => approveOperator(operator.id)}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckIcon className="h-4 w-4 mr-2" />
                          {processingOperators.has(operator.id) ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          disabled={processingOperators.has(operator.id)}
                          onClick={() => denyOperator(operator.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          {processingOperators.has(operator.id) ? 'Processing...' : 'Deny'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Flight</h2>
              <p className="text-gray-600 mb-6">Create a new flight as a super admin</p>
              
              <button
                onClick={() => navigate('/create-flight')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Flight
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, flightId: null, operatorName: '', route: '' })}
        onConfirm={confirmDeleteFlight}
        title="Delete Flight"
        message="Are you sure you want to permanently delete this flight?"
        route={deleteModal.route}
        operatorName={deleteModal.operatorName}
        confirmText="Delete Flight"
        type="danger"
      />
    </div>
  );
}
