import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, EyeIcon, PlusIcon, TrashIcon, UsersIcon, ClipboardDocumentListIcon, ChartBarIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
  const [allOperators, setAllOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [operatorFlights, setOperatorFlights] = useState([]);
  const [expandedOperators, setExpandedOperators] = useState(new Set());
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

  // CRM state for super-admin
  const [crmData, setCrmData] = useState(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState(new Set());

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

  // Fetch all operators with statistics
  const fetchAllOperators = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Admin fetching all operators...');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No auth token found');
        return;
      }

      const response = await fetch('/api/operators', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Admin all operators:', data);
        setAllOperators(data.operators || []);
      } else {
        console.error('❌ Failed to fetch all operators:', response.status);
        setAllOperators([]);
      }
    } catch (error) {
      console.error('❌ Error fetching all operators:', error);
      setAllOperators([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch operator flights
  const fetchOperatorFlights = async (operatorId) => {
    try {
      console.log(`🔄 Fetching flights for operator ${operatorId}...`);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No auth token found');
        return;
      }

      const response = await fetch(`/api/operators/${operatorId}/flights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📡 Operator ${operatorId} flights:`, data);
        setOperatorFlights(data.flights || []);
      } else {
        console.error(`❌ Failed to fetch operator ${operatorId} flights:`, response.status);
        setOperatorFlights([]);
      }
    } catch (error) {
      console.error(`❌ Error fetching operator ${operatorId} flights:`, error);
      setOperatorFlights([]);
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
      const response = await fetch(`/api/operators/${operatorId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchAllOperators(); // Refresh the list
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
      const response = await fetch(`/api/operators/${operatorId}/deny`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchAllOperators(); // Refresh the list
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

  // CRM functions for super-admin
  const fetchCrmData = async () => {
    try {
      setCrmLoading(true);
      console.log('🏢 CRM: Fetching data...');
      
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('http://localhost:4000/api/bookings/crm', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Super admin privileges required.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCrmData(data);
      console.log('✅ CRM: Data loaded', data);
    } catch (error) {
      console.error('❌ CRM: Error fetching data:', error);
    } finally {
      setCrmLoading(false);
    }
  };

  const toggleBookingExpansion = (bookingId) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  const toggleOperatorExpansion = (operatorId) => {
    const newExpanded = new Set(expandedOperators);
    if (newExpanded.has(operatorId)) {
      newExpanded.delete(operatorId);
      if (selectedOperator === operatorId) {
        setSelectedOperator(null);
        setOperatorFlights([]);
      }
    } else {
      newExpanded.add(operatorId);
      setSelectedOperator(operatorId);
      fetchOperatorFlights(operatorId);
    }
    setExpandedOperators(newExpanded);
  };

  const getFlightStatusBadge = (flight) => {
    let status = flight.derivedStatus || flight.status;
    let config = {};

    switch (status) {
      case 'pending':
        config = { color: 'bg-yellow-100 text-yellow-800', text: '⏳ Pending Approval', icon: '⏳' };
        break;
      case 'approved':
      case 'available':
        config = { color: 'bg-blue-100 text-blue-800', text: '✅ Available', icon: '✅' };
        break;
      case 'declined':
        config = { color: 'bg-red-100 text-red-800', text: '❌ Declined', icon: '❌' };
        break;
      case 'partially_booked':
        config = { color: 'bg-orange-100 text-orange-800', text: '📋 Partially Booked', icon: '📋' };
        break;
      case 'fully_booked':
      case 'booked':
        config = { color: 'bg-green-100 text-green-800', text: '🎫 Fully Booked', icon: '🎫' };
        break;
      case 'cancelled':
        config = { color: 'bg-gray-100 text-gray-800', text: '⛔ Cancelled', icon: '⛔' };
        break;
      default:
        config = { color: 'bg-gray-100 text-gray-800', text: status, icon: '❓' };
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingFlights();
    } else if (activeTab === 'operators') {
      fetchAllOperators();
      fetchPendingOperators();
    } else if (activeTab === 'crm' && user?.role === 'super-admin') {
      fetchCrmData();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'catalog', name: 'Flight Catalog', icon: EyeIcon },
    { id: 'approvals', name: 'Flight Approvals', icon: CheckIcon, badge: pendingFlights.length },
    { id: 'operators', name: 'Operator Management', icon: UsersIcon, badge: pendingOperators.length },
    { id: 'create', name: 'Create Flight', icon: PlusIcon },
    ...(user?.role === 'super-admin' ? [{ id: 'crm', name: 'CRM & Analytics', icon: ChartBarIcon }] : [])
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Operator Management</h2>
              <p className="text-gray-600 mb-6">Manage all operators and their flight status</p>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading operators...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pending Approvals Section */}
                  {pendingOperators.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <UsersIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                          <p className="text-sm text-gray-600">{pendingOperators.length} operator{pendingOperators.length !== 1 ? 's' : ''} awaiting approval</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {pendingOperators.map((operator) => (
                          <div key={operator.id} className="bg-white border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {operator.firstName} {operator.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">{operator.companyName}</p>
                                <p className="text-sm text-blue-600">{operator.email}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  disabled={processingOperators.has(operator.id)}
                                  onClick={() => approveOperator(operator.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                  {processingOperators.has(operator.id) ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  disabled={processingOperators.has(operator.id)}
                                  onClick={() => denyOperator(operator.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                  {processingOperators.has(operator.id) ? 'Processing...' : 'Deny'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Operators Section */}
                  {allOperators.length === 0 ? (
                    <div className="text-center py-8">
                      <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Operators Found</h3>
                      <p className="text-gray-600">No operators have been registered yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        All Operators ({allOperators.length})
                      </h3>
                      
                      {allOperators.map((operator) => (
                        <div key={operator.user_id} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-full ${
                                  operator.status === 'active' 
                                    ? 'bg-green-100' 
                                    : operator.status === 'pending'
                                    ? 'bg-yellow-100'
                                    : 'bg-red-100'
                                }`}>
                                  <UsersIcon className={`h-6 w-6 ${
                                    operator.status === 'active'
                                      ? 'text-green-600'
                                      : operator.status === 'pending'
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg text-gray-900">
                                    {operator.company_name || 'Company Name Not Set'}
                                  </h4>
                                  <p className="text-sm text-blue-600 font-medium">{operator.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <button
                                  onClick={() => toggleOperatorExpansion(operator.user_id)}
                                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  {expandedOperators.has(operator.user_id) ? (
                                    <ChevronDownIcon className="h-5 w-5" />
                                  ) : (
                                    <ChevronRightIcon className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Operator Statistics */}
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{operator.flightStats.total}</p>
                                <p className="text-xs text-gray-600">Total Flights</p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{operator.bookingStats.confirmed}</p>
                                <p className="text-xs text-gray-600">Confirmed Bookings</p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-lg font-bold text-purple-600">
                                  {formatCOPWithStyling(operator.bookingStats.totalRevenue).number} {formatCOPWithStyling(operator.bookingStats.totalRevenue).currency}
                                </p>
                                <p className="text-xs text-gray-600">Total Revenue</p>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Flights List */}
                          {expandedOperators.has(operator.user_id) && selectedOperator === operator.user_id && (
                            <div className="border-t border-gray-200">
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-gray-900">Flights</h4>
                                  {operatorFlights.length > 0 && (
                                    <span className="text-sm text-gray-600">
                                      {operatorFlights.length} flight{operatorFlights.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                
                                {operatorFlights.length === 0 ? (
                                  <div className="text-center py-6">
                                    <p className="text-gray-500">No flights found for this operator</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {/* Column Headers */}
                                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                      <div className="grid grid-cols-6 gap-4">
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">Route</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">Date</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">Bookings</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">Seats</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">Revenue</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">Status</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Flight Rows */}
                                    {operatorFlights.map((flight) => (
                                      <div key={flight.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                        <div className="grid grid-cols-6 gap-4 items-center">
                                          {/* Route */}
                                          <div className="text-center">
                                            <p className="font-semibold text-gray-900">
                                              {flight.origin_code}-{flight.destination_code}
                                            </p>
                                          </div>
                                          
                                          {/* Date */}
                                          <div className="text-center text-sm text-gray-600">
                                            {new Date(flight.departure).toLocaleDateString()}
                                          </div>
                                          
                                          {/* Bookings */}
                                          <div className="text-center text-sm">
                                            <span className="text-blue-600 font-medium">{flight.confirmed_bookings || 0}</span>
                                          </div>
                                          
                                          {/* Seats */}
                                          <div className="text-center text-sm">
                                            <span className="text-gray-900 font-medium">{flight.seats_available || 0}</span>
                                            <span className="text-gray-500">/{flight.total_seats || 0}</span>
                                          </div>
                                          
                                          {/* Revenue */}
                                          <div className="text-center text-sm text-green-600 font-medium">
                                            {formatCOPWithStyling(flight.total_revenue || 0).number}
                                          </div>
                                          
                                          {/* Status */}
                                          <div className="flex justify-center">
                                            {getFlightStatusBadge(flight)}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

          {activeTab === 'crm' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">CRM Dashboard</h2>
              <p className="text-gray-600 mb-6">View all bookings, revenue analytics, and customer details</p>
              
              {crmLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading CRM data...</p>
                </div>
              ) : crmData ? (
                <div className="space-y-6">
                  {/* Revenue Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Revenue Summary</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCOPWithStyling(crmData.revenue.total).number}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {formatCOPWithStyling(crmData.revenue.total).currency}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-600">Platform Commission (10%)</p>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            {formatCOPWithStyling(crmData.revenue.commission).number}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {formatCOPWithStyling(crmData.revenue.commission).currency}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-600">Operator Revenue</p>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCOPWithStyling(crmData.revenue.operator).number}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {formatCOPWithStyling(crmData.revenue.operator).currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bookings List */}
                  <div className="bg-white border border-gray-200 rounded-xl">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        All Bookings ({crmData.bookings.length})
                      </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {crmData.bookings.map((booking) => (
                        <div key={booking.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <button
                                  onClick={() => toggleBookingExpansion(booking.id)}
                                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  {expandedBookings.has(booking.id) ? (
                                    <ChevronDownIcon className="h-5 w-5" />
                                  ) : (
                                    <ChevronRightIcon className="h-5 w-5" />
                                  )}
                                  <span className="font-medium">Booking #{booking.id}</span>
                                </button>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  booking.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-700'
                                    : booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Customer</p>
                                  <p className="text-sm text-gray-900">
                                    {booking.customer?.firstName} {booking.customer?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-600">{booking.customer?.email}</p>
                                  {booking.contact_email && booking.contact_email !== booking.customer?.email && (
                                    <p className="text-xs text-green-600 font-medium">Contact: {booking.contact_email}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Flight</p>
                                  <p className="text-sm text-gray-900">
                                    {booking.flight?.origin?.code} → {booking.flight?.destination?.code}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {booking.flight?.schedule?.departure ? 
                                      new Date(booking.flight.schedule.departure).toLocaleDateString() : 'TBD'
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Price</p>
                                  <p className="text-sm font-bold text-gray-900">
                                    ${booking.totalPrice?.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Booked On</p>
                                  <p className="text-sm text-gray-900">
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {/* Expandable Passenger Details */}
                              {expandedBookings.has(booking.id) && booking.passengers && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                    Passengers ({booking.passengers.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {booking.passengers.map((passenger, index) => (
                                      <div key={index} className="flex items-center space-x-4 text-sm">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                          {index + 1}
                                        </span>
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                          <span className="font-medium text-gray-900">
                                            {passenger.firstName} {passenger.lastName}
                                          </span>
                                          <span className="text-gray-600">{passenger.email}</span>
                                          <span className="text-gray-600">{passenger.phone}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No CRM Data</h3>
                  <p className="text-gray-600">Unable to load CRM data at this time.</p>
                </div>
              )}
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
