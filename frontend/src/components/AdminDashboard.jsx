import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, EyeIcon, PlusIcon, TrashIcon, UsersIcon, ClipboardDocumentListIcon, ChartBarIcon, ChevronDownIcon, ChevronRightIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import FlightFilters from './FlightFilters';
import FlightList from '../FlightList';
import ErrorBoundary from './ErrorBoundary';
import ConfirmationModal from './ConfirmationModal';
import { useTranslation } from '../contexts/TranslationContext';
import { extractAirportCode } from '../utils/airportUtils';

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
  const { t } = useTranslation();
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
        alert(t('admin.dashboard.errors.networkError'));
      } else if (error.message) {
        alert(`${t('admin.dashboard.errors.deleteFailed')}: ${error.message}`);
      } else {
        alert(t('admin.dashboard.errors.deleteFailedUnknown'));
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
        alert(t('admin.dashboard.errors.approveFailed'));
      }
    } catch (error) {
      console.error(`❌ Error approving operator ${operatorId}:`, error);
      alert(t('admin.dashboard.errors.approveError'));
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
        alert(t('admin.dashboard.errors.denyFailed'));
      }
    } catch (error) {
      console.error(`❌ Error denying operator ${operatorId}:`, error);
      alert(t('admin.dashboard.errors.denyError'));
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

  // Function to handle flight view by tracing from booking
  const handleViewFlight = async (bookingId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/bookings/${bookingId}/flight`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.flightId) {
          navigate(`/flight/${data.flightId}`);
        } else {
          console.error('Flight ID not found for booking:', bookingId);
          alert('Flight details not available for this booking.');
        }
      } else {
        console.error('Failed to fetch flight for booking:', bookingId);
        alert('Unable to load flight details.');
      }
    } catch (error) {
      console.error('Error fetching flight for booking:', bookingId, error);
      alert('Error loading flight details.');
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
        config = { color: 'bg-yellow-100 text-yellow-800', text: `⏳ ${t('admin.dashboard.flights.status.pending')}`, icon: '⏳' };
        break;
      case 'approved':
      case 'available':
        config = { color: 'bg-blue-100 text-blue-800', text: `✅ ${t('admin.dashboard.flights.status.available')}`, icon: '✅' };
        break;
      case 'declined':
        config = { color: 'bg-red-100 text-red-800', text: `❌ ${t('admin.dashboard.flights.status.declined')}`, icon: '❌' };
        break;
      case 'partially_booked':
        config = { color: 'bg-orange-100 text-orange-800', text: `📋 ${t('admin.dashboard.flights.status.partiallyBooked')}`, icon: '📋' };
        break;
      case 'fully_booked':
      case 'booked':
        config = { color: 'bg-green-100 text-green-800', text: `🎫 ${t('admin.dashboard.flights.status.fullyBooked')}`, icon: '🎫' };
        break;
      case 'cancelled':
        config = { color: 'bg-gray-100 text-gray-800', text: `⛔ ${t('admin.dashboard.flights.status.cancelled')}`, icon: '⛔' };
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
    { id: 'catalog', name: t('admin.dashboard.tabs.catalog'), icon: EyeIcon },
    { id: 'approvals', name: t('admin.dashboard.tabs.approvals'), icon: CheckIcon, badge: pendingFlights.length },
    { id: 'operators', name: t('admin.dashboard.tabs.operators'), icon: UsersIcon, badge: pendingOperators.length },
    { id: 'create', name: t('admin.dashboard.tabs.create'), icon: PlusIcon },
    ...(user?.role === 'super-admin' ? [{ id: 'crm', name: t('admin.dashboard.tabs.crm'), icon: ChartBarIcon }] : [])
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
                {t('admin.dashboard.welcomeBack')} {user?.firstName} {user?.lastName}
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {t('admin.dashboard.superAdmin')}
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('admin.dashboard.catalog.title')}</h2>
                <p className="text-gray-600 mb-6">{t('admin.dashboard.catalog.subtitle')}</p>
                
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('admin.dashboard.approvals.title')}</h2>
              <p className="text-gray-600 mb-6">{t('admin.dashboard.approvals.subtitle')}</p>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('admin.dashboard.approvals.loading')}</p>
                </div>
              ) : pendingFlights.length === 0 ? (
                <div className="text-center py-8">
                  <CheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.dashboard.approvals.allCaughtUp')}</h3>
                  <p className="text-gray-600">{t('admin.dashboard.approvals.noPendingFlights')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingFlights.map((flight) => (
                    <div key={flight.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-900">Flight {flight.id}</h4>
                              <p className="text-sm text-blue-600 font-medium">
                                {flight.operator?.company_name || 
                                 flight.operator?.name ||
                                 flight.operator_name ||
                                 flight.operator ||
                                 (flight.operator?.firstName && flight.operator?.lastName 
                                   ? `${flight.operator.firstName} ${flight.operator.lastName}` 
                                   : 'Private Operator')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3 ml-6">
                          <button
                            onClick={() => navigate(`/flight/${flight.id}`)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                          </button>
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('admin.dashboard.operators.title')}</h2>
              <p className="text-gray-600 mb-6">{t('admin.dashboard.operators.subtitle')}</p>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('admin.dashboard.operators.flightDetails.loading')}</p>
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
                                  {processingOperators.has(operator.id) ? t('admin.dashboard.operators.actions.processing') : t('admin.dashboard.operators.actions.approve')}
                                </button>
                                <button
                                  disabled={processingOperators.has(operator.id)}
                                  onClick={() => denyOperator(operator.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                  {processingOperators.has(operator.id) ? t('admin.dashboard.operators.actions.processing') : t('admin.dashboard.operators.actions.deny')}
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
                        {t('admin.dashboard.allOperators')} ({allOperators.length})
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
                                    {operator.company_name || t('admin.dashboard.operators.companyNameFallback')}
                                  </h4>
                                  <p className="text-sm text-blue-600 font-medium">{operator.email}</p>
                                </div>
                              </div>
                              
                              {/* Statistics Containers spanning all remaining area */}
                              <div className="flex-1 grid grid-cols-3 gap-4 px-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                  <p className="text-lg font-bold text-gray-900">{operator.flightStats.total}</p>
                                  <p className="text-xs text-gray-600">{t('admin.dashboard.operators.stats.flights')}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                  <p className="text-lg font-bold text-blue-600">{operator.bookingStats.confirmed}</p>
                                  <p className="text-xs text-gray-600">{t('admin.dashboard.operators.stats.bookings')}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                  <p className="text-lg font-bold text-green-600">
                                    {formatCOPWithStyling(operator.bookingStats.totalRevenue).number} {formatCOPWithStyling(operator.bookingStats.totalRevenue).currency}
                                  </p>
                                  <p className="text-xs text-gray-600">{t('admin.dashboard.operators.stats.revenue')}</p>
                                </div>
                              </div>
                                
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

                          {/* Expandable Flights List */}
                          {expandedOperators.has(operator.user_id) && selectedOperator === operator.user_id && (
                            <div className="border-t border-gray-200">
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.operators.flightsTitle')}</h4>
                                  {operatorFlights.length > 0 && (
                                    <span className="text-sm text-gray-600">
                                      {operatorFlights.length} {operatorFlights.length === 1 ? t('admin.dashboard.operators.flightCount.single') : t('admin.dashboard.operators.flightCount.plural')}
                                    </span>
                                  )}
                                </div>
                                
                                {operatorFlights.length === 0 ? (
                                  <div className="text-center py-6">
                                    <p className="text-gray-500">{t('admin.dashboard.operators.noFlightsFound')}</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {/* Column Headers */}
                                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                      <div className="grid grid-cols-6 gap-4">
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">{t('admin.dashboard.operators.flightDetails.headers.route')}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">{t('admin.dashboard.operators.flightDetails.headers.date')}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">{t('admin.dashboard.operators.flightDetails.headers.bookings')}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">{t('admin.dashboard.operators.flightDetails.headers.seats')}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">{t('admin.dashboard.operators.flightDetails.headers.revenue')}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-xs font-semibold text-gray-700 uppercase">{t('admin.dashboard.operators.flightDetails.headers.status')}</p>
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('admin.dashboard.create.title')}</h2>
              <p className="text-gray-600 mb-6">{t('admin.dashboard.create.subtitle')}</p>
              
              <button
                onClick={() => navigate('/create-flight')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {t('admin.dashboard.create.navigateButton')}
              </button>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.dashboard.crm.title')}</h2>
                <p className="text-gray-600 mb-6">{t('admin.dashboard.crm.subtitle')}</p>
              </div>
              
              {crmLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('admin.dashboard.crm.loadingMessage')}</p>
                </div>
              ) : crmData ? (
                <div className="space-y-6">
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.crm.stats.totalRevenue')}</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCOPWithStyling(crmData.revenue.total).number} {formatCOPWithStyling(crmData.revenue.total).currency}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.crm.stats.platformCommission')}</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCOPWithStyling(crmData.revenue.commission).number} {formatCOPWithStyling(crmData.revenue.commission).currency}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.crm.stats.totalBookings')}</p>
                          <p className="text-xl font-bold text-gray-900">{crmData.bookings.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <DocumentTextIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.crm.stats.totalPassengers')}</p>
                          <p className="text-xl font-bold text-gray-900">
                            {crmData.bookings.reduce((sum, booking) => sum + (booking.passengers?.length || 0), 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">All Reservations ({crmData.bookings.length})</h3>
                      </div>
                      <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.booking')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.customer')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.operator')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.route')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.flight')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.reservedSeats')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.amount')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.status')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('dashboard.operator.crm.table.columns.details')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {crmData.bookings.map((booking) => (
                            <React.Fragment key={booking.id}>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                                  <div className="text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.customer?.firstName} {booking.customer?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{booking.customer?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.operator}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {extractAirportCode(booking.flight?.origin?.code)} → {extractAirportCode(booking.flight?.destination?.code)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => handleViewFlight(booking.id)}
                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    <EyeIcon className="w-4 h-4 mr-1.5" />
                                    {t('dashboard.operator.crm.table.actions.viewFlight')}
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {((booking.flight?.totalSeats || 0) - (booking.flight?.availableSeats || 0))}/{booking.flight?.totalSeats || 0}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-bold text-green-600">
                                    {formatCOPWithStyling(booking.totalPrice).number}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatCOPWithStyling(booking.totalPrice).currency}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    booking.status === 'confirmed' 
                                      ? 'bg-green-100 text-green-700'
                                      : booking.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => toggleBookingExpansion(booking.id)}
                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center space-x-1"
                                  >
                                    {expandedBookings.has(booking.id) ? (
                                      <>
                                        <ChevronDownIcon className="h-4 w-4" />
                                        <span>{t('dashboard.operator.crm.table.actions.hide')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <ChevronRightIcon className="h-4 w-4" />
                                        <span>{t('dashboard.operator.crm.table.actions.show')}</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>

                              {/* Expandable Passenger Details Row */}
                              {expandedBookings.has(booking.id) && booking.passengers && (
                                <tr>
                                  <td colSpan="9" className="px-6 py-4 bg-gray-50">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                        {t('dashboard.operator.crm.table.passengers')} ({booking.passengers.length})
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {booking.passengers.map((passenger, index) => (
                                          <div key={index} className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                              {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                              {passenger.firstName} {passenger.lastName}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.operator.crm.noData.title')}</h3>
                  <p className="text-gray-600">{t('dashboard.operator.crm.noData.message')}</p>
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
