import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, EyeIcon, TrashIcon, UsersIcon, ClipboardDocumentListIcon, ChartBarIcon, ChevronDownIcon, ChevronRightIcon, CurrencyDollarIcon, DocumentTextIcon, MapPinIcon, BellIcon, GlobeAltIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import FlightFilters from './FlightFilters';
import FlightList from '../FlightList';
import ErrorBoundary from './ErrorBoundary';
import ConfirmationModal from './ConfirmationModal';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';
import CustomCalendar from './CustomCalendar';
import AirportService from '../services/AirportService';
import FlightDetailsView from './FlightDetailsView';
import SystemDashboard from './SystemDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { extractAirportCode } from '../utils/airportUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const [pendingFlights, setPendingFlights] = useState([]);
  const [allFlights, setAllFlights] = useState([]);
  const [availableCities, setAvailableCities] = useState({ origins: [], destinations: [] });
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
  const [maxAvailableSeats, setMaxAvailableSeats] = useState(12); // Default to 12, will be updated from flight data

  // Quotes management state
  const [quotes, setQuotes] = useState([]);
  const [unseenQuotesCount, setUnseenQuotesCount] = useState(0);
  const [notContactedQuotesCount, setNotContactedQuotesCount] = useState(0);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Airports management state
  const [pendingAirports, setPendingAirports] = useState([]);
  const [processingAirports, setProcessingAirports] = useState(new Set());
  const [approvalModal, setApprovalModal] = useState({
    isOpen: false,
    airport: null,
    latitude: '',
    longitude: ''
  });

  // CRM state
  const [crmData, setCrmData] = useState(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState(new Set());

  // Flight details view state
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedPassengers, setSelectedPassengers] = useState(1);
  const [previousTab, setPreviousTab] = useState('catalog'); // Track where we came from

  // Handler for when a flight card is clicked
  const handleFlightClick = (flight) => {
    console.log('🎯 Admin handleFlightClick called with:', flight);
    setPreviousTab(activeTab); // Remember current tab before switching
    setSelectedFlight(flight);
    setActiveTab('flight-details');
  };

  // Handler for returning to previous view
  const handleBackToFlights = () => {
    setSelectedFlight(null);
    setActiveTab(previousTab); // Go back to where we came from
  };

  // Set selectedPassengers to available seats when flight is selected
  useEffect(() => {
    if (!selectedFlight) {
      return;
    }

    const maxPassengers = selectedFlight.max_passengers || selectedFlight.total_seats || 8;
    const initialSeats = selectedFlight.available_seats ?? selectedFlight.seats_available ?? selectedFlight.capacity?.availableSeats ?? maxPassengers;

    if (initialSeats !== undefined && initialSeats !== null) {
      setSelectedPassengers(initialSeats > 0 ? initialSeats : 0);
    }
  }, [selectedFlight]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch all flights for catalog and extract available cities from actual flight data
  const fetchAllFlights = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Admin fetching flights and extracting cities from actual flight data...');
      
      // Get all flights first
      if (shouldUseRealAPI()) {
        const response = await flightsAPI.getAllFlights();
        console.log('📡 Admin all flights response:', response);
        const flights = response.flights || response || [];
        setAllFlights(flights);
        
        // Extract cities ONLY from actual flights (not from airport database)
        const origins = new Set();
        const destinations = new Set();
        
        flights.forEach(flight => {
          // Extract origin city (try multiple field names)
          const originCity = flight.origin_city || 
                           flight.origin?.city || 
                           flight.origin_name ||
                           flight.origin ||
                           (flight.route && flight.route.from);
          
          // Extract destination city (try multiple field names)
          const destinationCity = flight.destination_city || 
                                 flight.destination?.city || 
                                 flight.destination_name ||
                                 flight.destination ||
                                 (flight.route && flight.route.to);

          if (originCity) {
            // Clean city name (remove airport codes in parentheses)
            const cleanOrigin = originCity.includes('(') ? 
                              originCity.split('(')[0].trim() : 
                              originCity.trim();
            if (cleanOrigin) origins.add(cleanOrigin);
          }
          
          if (destinationCity) {
            // Clean city name (remove airport codes in parentheses)  
            const cleanDestination = destinationCity.includes('(') ? 
                                    destinationCity.split('(')[0].trim() : 
                                    destinationCity.trim();
            if (cleanDestination) destinations.add(cleanDestination);
          }
        });
        
        // Set cities from flight data
        const flightBasedCities = {
          origins: Array.from(origins).sort(),
          destinations: Array.from(destinations).sort()
        };
        
        console.log(`🏙️ Extracted cities from ${flights.length} flights:`, {
          origins: flightBasedCities.origins.length,
          destinations: flightBasedCities.destinations.length,
          sampleOrigins: flightBasedCities.origins.slice(0, 5),
          sampleDestinations: flightBasedCities.destinations.slice(0, 5)
        });
        
        setAvailableCities(flightBasedCities);
        
        // Calculate max available seats from flight data
        const maxSeats = flights.reduce((max, flight) => {
          const totalSeats = flight.total_seats || 0;
          return Math.max(max, totalSeats);
        }, 12); // Default minimum of 12
        
        console.log('✈️ Max available seats found:', maxSeats);
        setMaxAvailableSeats(maxSeats);
      } else {
        // Fallback: try localStorage for flights, otherwise show empty
        console.log('📡 Real API not available, checking localStorage...');
        const localFlights = localStorage.getItem('jetchance_mock_flights');
        if (localFlights) {
          const flights = JSON.parse(localFlights);
          console.log(`💾 Found ${flights.length} flights in localStorage`);
          setAllFlights(flights);
          
          // Extract cities from localStorage flights too
          const origins = new Set();
          const destinations = new Set();
          
          flights.forEach(flight => {
            const originCity = flight.origin_city || flight.origin_name || flight.origin;
            const destinationCity = flight.destination_city || flight.destination_name || flight.destination;
            if (originCity) origins.add(originCity.split('(')[0].trim());
            if (destinationCity) destinations.add(destinationCity.split('(')[0].trim());
          });
          
          setAvailableCities({
            origins: Array.from(origins).sort(),
            destinations: Array.from(destinations).sort()
          });
        } else {
          console.log('💾 No flights in localStorage either');
          setAllFlights([]);
          setAvailableCities({ origins: [], destinations: [] });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching flights and cities:', error);
      // Show empty cities on error (don't fall back to airport database)
      console.log('⚠️ Admin dashboard: Showing empty dropdowns due to error');
      setAvailableCities({ 
        origins: [], 
        destinations: [] 
      });
      setAllFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

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

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE_URL}/bookings/crm`, {
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

  // Quotes management functions
  const fetchQuotes = async () => {
    try {
      setQuotesLoading(true);
      console.log('🔄 Admin fetching quotes...');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No auth token found');
        return;
      }

      const response = await fetch('/api/quotes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Admin quotes:', data);
        setQuotes(data || []);
        // Calculate not contacted quotes count
        const notContactedCount = (data || []).filter(quote => (quote.contact_status || 'not_contacted') === 'not_contacted').length;
        setNotContactedQuotesCount(notContactedCount);
      } else {
        console.error('❌ Failed to fetch quotes:', response.status);
        setQuotes([]);
        setNotContactedQuotesCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching quotes:', error);
      setQuotes([]);
      setNotContactedQuotesCount(0);
    } finally {
      setQuotesLoading(false);
    }
  };

  const fetchUnseenQuotesCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/quotes/unseen-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnseenQuotesCount(data.count || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching unseen quotes count:', error);
    }
  };

  const fetchNotContactedQuotesCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/quotes/not-contacted-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotContactedQuotesCount(data.count || 0);
      } else {
        // If endpoint doesn't exist, fetch all quotes and count locally
        const quotesResponse = await fetch('/api/quotes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (quotesResponse.ok) {
          const quotesData = await quotesResponse.json();
          const notContactedCount = (quotesData || []).filter(quote => (quote.contact_status || 'not_contacted') === 'not_contacted').length;
          setNotContactedQuotesCount(notContactedCount);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching not contacted quotes count:', error);
    }
  };

  const markQuotesAsSeen = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/quotes/mark-seen', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUnseenQuotesCount(0);
        // Refresh quotes to show updated seen_at timestamps
        await fetchQuotes();
      }
    } catch (error) {
      console.error('❌ Error marking quotes as seen:', error);
    }
  };

  // Update quote contact status
  const updateQuoteContactStatus = async (quoteId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/quotes/${quoteId}/contact-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contact_status: newStatus })
      });

      if (response.ok) {
        // Refresh quotes to show updated status
        await fetchQuotes();
        console.log(`✅ Quote ${quoteId} contact status updated to ${newStatus}`);
      } else {
        console.error('❌ Failed to update quote contact status');
      }
    } catch (error) {
      console.error('❌ Error updating quote contact status:', error);
    }
  };

  // Airport management functions
  const fetchPendingAirports = async () => {
    try {
      console.log('🔄 Admin fetching pending airports...');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No auth token found');
        return;
      }

      const response = await fetch(`${API_URL}/airports/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Pending airports:', data);
        setPendingAirports(data || []);
      } else {
        console.error('❌ Failed to fetch pending airports:', response.status);
        setPendingAirports([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pending airports:', error);
      setPendingAirports([]);
    }
  };

  const approveAirport = async (airportId, latitude, longitude) => {
    if (processingAirports.has(airportId)) return;
    
    try {
      setProcessingAirports(prev => new Set([...prev, airportId]));
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/airports/admin/approve/${airportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latitude, longitude })
      });

      if (response.ok) {
        console.log(`✅ Airport ${airportId} approved`);
        await fetchPendingAirports(); // Refresh the list
        setApprovalModal({ isOpen: false, airport: null, latitude: '', longitude: '' });
      } else {
        console.error('❌ Failed to approve airport');
        alert('Failed to approve airport. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error approving airport:', error);
      alert('Error approving airport. Please try again.');
    } finally {
      setProcessingAirports(prev => {
        const next = new Set(prev);
        next.delete(airportId);
        return next;
      });
    }
  };

  const rejectAirport = async (airportId) => {
    if (processingAirports.has(airportId)) return;
    
    try {
      setProcessingAirports(prev => new Set([...prev, airportId]));
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/airports/admin/reject/${airportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ Airport ${airportId} rejected`);
        await fetchPendingAirports(); // Refresh the list
      } else {
        console.error('❌ Failed to reject airport');
        alert('Failed to reject airport. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error rejecting airport:', error);
      alert('Error rejecting airport. Please try again.');
    } finally {
      setProcessingAirports(prev => {
        const next = new Set(prev);
        next.delete(airportId);
        return next;
      });
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
          // Fetch the full flight details
          const flightResponse = await fetch(`/api/flights/${data.flightId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (flightResponse.ok) {
            const flightData = await flightResponse.json();
            setPreviousTab(activeTab); // Remember current tab (crm) before switching
            setSelectedFlight(flightData);
            setActiveTab('flight-details');
          } else {
            console.error('Failed to fetch full flight details');
            alert('Unable to load flight details.');
          }
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
    // Clear airport cache to ensure we get fresh data after migration
    AirportService.clearCache();
    
    // Always fetch counts for badges and all flights for dropdowns
    fetchUnseenQuotesCount();
    fetchNotContactedQuotesCount();
    fetchAllFlights();
    
    if (activeTab === 'approvals') {
      fetchPendingFlights();
    } else if (activeTab === 'operators') {
      fetchAllOperators();
      fetchPendingOperators();
    } else if (activeTab === 'quotes') {
      fetchQuotes();
      // Mark quotes as seen when tab is opened
      markQuotesAsSeen();
    } else if (activeTab === 'airports' && user?.role === 'super-admin') {
      fetchPendingAirports();
    } else if (activeTab === 'crm' && user?.role === 'super-admin') {
      fetchCrmData();
    }
  }, [activeTab]);

  // Fetch initial badge counts on component mount
  useEffect(() => {
    fetchNotContactedQuotesCount();
    fetchUnseenQuotesCount();
    fetchPendingFlights(); // Load pending flights badge
    fetchPendingOperators(); // Load pending operators badge
    if (user?.role === 'super-admin') {
      fetchPendingAirports(); // Load pending airports badge for super-admin
    }
  }, []);

  const tabs = [
    { id: 'catalog', name: t('admin.dashboard.tabs.catalog'), icon: EyeIcon },
    { id: 'approvals', name: t('admin.dashboard.tabs.approvals'), icon: CheckIcon, badge: pendingFlights.length },
    { id: 'operators', name: t('admin.dashboard.tabs.operators'), icon: UsersIcon, badge: pendingOperators.length },
    { id: 'quotes', name: 'Submitted Quotes', icon: DocumentTextIcon, badge: notContactedQuotesCount },
    ...(user?.role === 'super-admin' ? [
      { id: 'airports', name: 'Airport Requests', icon: ClipboardDocumentListIcon, badge: pendingAirports.length },
      { id: 'crm', name: t('admin.dashboard.tabs.crm'), icon: ChartBarIcon },
      { id: 'system', name: 'System', icon: ShieldCheckIcon }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div className="w-[282px] bg-white border-r border-gray-200 flex-shrink-0">
        {/* Sidebar Header with Logo */}
        <div className="p-4">
          <div className="flex items-center justify-center">
            <img 
              src="/images/logo/logo_black.svg" 
              alt="JetChance" 
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="flex-1 text-left">{tab.name}</span>
                  {tab.badge > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  {t('admin.dashboard.welcomeBack')} {user?.firstName} {user?.lastName}
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {user?.role === 'super-admin' ? t('admin.dashboard.superAdmin') : t('admin.dashboard.admin')}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Right side navigation components */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button 
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 min-w-[50px]"
                >
                  <GlobeAltIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{currentLanguage === 'es' ? 'ES' : 'EN'}</span>
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Language Dropdown */}
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          changeLanguage('en');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🇺🇸 English
                      </button>
                      <button
                        onClick={() => {
                          changeLanguage('es');
                          setIsLanguageDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🇪🇸 Español
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notification Bell */}
              <div className="relative" ref={notificationDropdownRef}>
                <button 
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  className="relative flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <BellIcon className="h-5 w-5" />
                </button>
                
                {/* Notifications Dropdown */}
                {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">0 new</span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="px-6 py-8 text-center text-gray-500">
                        <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">You'll be notified when new flights are submitted</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center bg-blue-500/10 text-gray-700 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md min-w-[50px] h-10"
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{user?.firstName}</span>
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-gray-500">{user?.role} • {user?.id}</div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        {t('nav.profile')}
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full p-6">
          {activeTab === 'catalog' && (
            <ErrorBoundary>
              {/* Enhanced Filters Section */}
              <div className="bg-white border-b border-gray-200 px-6 py-6">
                {/* Enhanced Filter Controls */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  {/* Main Filter Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Origin Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{t('admin.dashboard.catalog.filters.from')} ({availableCities.origins.length} {t('admin.dashboard.catalog.filters.cities')})</span>
                      </label>
                      <select
                        value={filters.origin}
                        onChange={(e) => setFilters({...filters, origin: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="">{t('admin.dashboard.catalog.filters.selectDepartureCity')}</option>
                        {availableCities.origins.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Destination Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{t('admin.dashboard.catalog.filters.to')} ({availableCities.destinations.length} {t('admin.dashboard.catalog.filters.cities')})</span>
                      </label>
                      <select
                        value={filters.destination}
                        onChange={(e) => setFilters({...filters, destination: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="">{t('admin.dashboard.catalog.filters.selectDestinationCity')}</option>
                        {availableCities.destinations.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Date Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{t('admin.dashboard.catalog.filters.date')}</span>
                      </label>
                      <CustomCalendar
                        value={filters.date}
                        onChange={(date) => setFilters({...filters, date})}
                        minDate={new Date().toISOString().split('T')[0]}
                        placeholder={t('admin.dashboard.catalog.filters.selectDepartureDate')}
                        theme="departure"
                      />
                    </div>

                    {/* Passengers Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span>{t('admin.dashboard.catalog.filters.passengers')} ({t('admin.dashboard.catalog.filters.max')} {maxAvailableSeats})</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          max={maxAvailableSeats}
                          value={filters.passengers}
                          onChange={(e) => {
                            const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxAvailableSeats);
                            setFilters({...filters, passengers: value});
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder={t('admin.dashboard.catalog.filters.numberOfPassengers')}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-sm">
                            {filters.passengers === 1 ? t('admin.dashboard.catalog.filters.passenger') : t('admin.dashboard.catalog.filters.passengersPlural')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row - Standard UX Pattern */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Left side - Clear + Active Filters */}
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setFilters({ origin: '', destination: '', date: '', passengers: 1 })}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>{t('admin.dashboard.catalog.filters.clearAll')}</span>
                      </button>
                      
                      {/* Active Filter Tags */}
                      {(filters.origin || filters.destination || filters.date || filters.passengers > 1) && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">•</span>
                          <div className="flex flex-wrap gap-1">
                            {filters.origin && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {t('admin.dashboard.catalog.filters.activeFilters.from')}: {filters.origin}
                              </span>
                            )}
                            {filters.destination && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {t('admin.dashboard.catalog.filters.activeFilters.to')}: {filters.destination}
                              </span>
                            )}
                            {filters.date && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {new Date(filters.date).toLocaleDateString()}
                              </span>
                            )}
                            {filters.passengers > 1 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {filters.passengers} pax
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side - Sort Options */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{t('admin.dashboard.catalog.filters.sort.label')}:</span>
                      <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                        <option value="price-low">{t('admin.dashboard.catalog.filters.sort.priceLow')}</option>
                        <option value="price-high">{t('admin.dashboard.catalog.filters.sort.priceHigh')}</option>
                        <option value="departure">{t('admin.dashboard.catalog.filters.sort.departure')}</option>
                        <option value="duration">{t('admin.dashboard.catalog.filters.sort.duration')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Flight List Section */}
              <div className="px-6 py-6">
                <FlightList 
                  filters={filters} 
                  isAdminView={true} 
                  onDeleteFlight={handleDeleteFlight}
                  onFlightClick={handleFlightClick}
                />
              </div>
            </ErrorBoundary>
          )}

          {activeTab === 'flight-details' && selectedFlight && (
            <div className="p-6">
              <FlightDetailsView 
                flight={selectedFlight} 
                onBack={handleBackToFlights}
                selectedPassengers={selectedPassengers}
                setSelectedPassengers={setSelectedPassengers}
                backButtonText={previousTab === 'crm' ? t('flightDetails.backToCRM') : t('flightDetails.backToFlights')}
              />
            </div>
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

          {activeTab === 'quotes' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('admin.dashboard.quotes.title') || 'Submitted Quotes'}</h2>
              <p className="text-gray-600 mb-6">{t('admin.dashboard.quotes.subtitle') || 'All customer quote requests submitted via the website.'}</p>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.quotes.stats.total') || 'Total Quotes'}</p>
                    <p className="text-xl font-bold text-gray-900">{quotes.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.quotes.stats.notContacted') || 'Not Contacted'}</p>
                    <p className="text-xl font-bold text-gray-900">{quotes.filter(q => (q.contact_status || 'not_contacted') === 'not_contacted').length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.quotes.stats.contacted') || 'Contacted'}</p>
                    <p className="text-xl font-bold text-gray-900">{quotes.filter(q => q.contact_status === 'contacted').length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.quotes.stats.last24h') || 'Last 24h'}</p>
                    <p className="text-xl font-bold text-gray-900">{quotes.filter(q => Date.now() - new Date(q.created_at).getTime() < 86400000).length}</p>
                  </div>
                </div>
              </div>

              {/* Quotes Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">{t('admin.dashboard.quotes.table.title') || `All Quotes (${quotes.length})`}</h3>
                </div>
                {quotesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('admin.dashboard.quotes.loading') || 'Loading quotes...'}</p>
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.dashboard.quotes.noData.title') || 'No Quotes Found'}</h3>
                    <p className="text-gray-600">{t('admin.dashboard.quotes.noData.message') || 'No quotes have been submitted yet.'}</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.dashboard.quotes.table.columns.date') || 'Date'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.dashboard.quotes.table.columns.name') || 'Name'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.dashboard.quotes.table.columns.email') || 'Email'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.dashboard.quotes.table.columns.phone') || 'Phone'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.dashboard.quotes.table.columns.route') || 'Route'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.dashboard.quotes.table.columns.contactStatus') || 'Contact Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotes.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(q.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{q.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.origin} → {q.destination}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex justify-start">
                              <button
                                onClick={() => {
                                  const currentStatus = q.contact_status || 'not_contacted';
                                  const newStatus = currentStatus === 'contacted' ? 'not_contacted' : 'contacted';
                                  updateQuoteContactStatus(q.id, newStatus);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  q.contact_status === 'contacted'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {q.contact_status === 'contacted'
                                  ? (t('admin.dashboard.quotes.table.contactStatus.contacted') || 'Contacted')
                                  : (t('admin.dashboard.quotes.table.contactStatus.notContacted') || 'Not Contacted')
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'airports' && user?.role === 'super-admin' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Airport Requests</h2>
                <p className="text-gray-600">Review and approve custom airports created by operators.</p>
              </div>

              {/* Pending Airports List */}
              <div className="space-y-4">
                {pendingAirports.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending airports</h3>
                    <p className="mt-1 text-sm text-gray-500">All airport requests have been reviewed.</p>
                  </div>
                ) : (
                  pendingAirports.map((airport) => (
                    <div key={airport.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Header with name and code */}
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-base font-medium text-gray-900">{airport.name} ({airport.code})</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Review
                            </span>
                          </div>
                          
                          {/* Compact horizontal info layout */}
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-gray-700">Airport:</span>
                              <span className="text-gray-600">{airport.name} ({airport.code})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-gray-700">Location:</span>
                              <span className="text-gray-600">{airport.city}, {airport.country}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-gray-700">Requested by:</span>
                              <span className="text-gray-600">
                                {airport.operator_company_name || 
                                 (airport.created_by_email 
                                   ? airport.created_by_email.split('@')[0] 
                                   : 'System/Unknown')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-gray-700">Date:</span>
                              <span className="text-gray-600">{new Date(airport.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setApprovalModal({
                              isOpen: true,
                              airport: airport,
                              latitude: '',
                              longitude: ''
                            })}
                            disabled={processingAirports.has(airport.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingAirports.has(airport.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => rejectAirport(airport.id)}
                            disabled={processingAirports.has(airport.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingAirports.has(airport.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <XMarkIcon className="h-4 w-4 mr-1" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                        <h3 className="text-lg font-medium text-gray-900">{t('dashboard.customer.myBookings.allReservations')} ({crmData.bookings.length})</h3>
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
                                <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
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

          {activeTab === 'system' && user?.role === 'super-admin' && (
            <SystemDashboard />
          )}
          </div>
        </div>
      </div>

      {/* Airport Approval Modal */}
      {approvalModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Approve Airport
                </h3>
                <p className="text-md text-gray-700 mt-1">
                  {approvalModal.airport?.name} ({approvalModal.airport?.code})
                </p>
                <div className="mt-4 text-left">
                  <p className="text-sm text-gray-500 mb-4">
                    Please provide the exact coordinates for this airport to complete the approval.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="4.7016"
                        value={approvalModal.latitude}
                        onChange={(e) => setApprovalModal(prev => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="-74.1469"
                        value={approvalModal.longitude}
                        onChange={(e) => setApprovalModal(prev => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    You can find coordinates using Google Maps or GPS tools
                  </p>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setApprovalModal({ isOpen: false, airport: null, latitude: '', longitude: '' })}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => approveAirport(approvalModal.airport?.id, approvalModal.latitude, approvalModal.longitude)}
                    disabled={!approvalModal.latitude || !approvalModal.longitude}
                    className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Airport
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        noteText="This action is permanent and the operator will be notified."
      />
    </div>
  );
}
