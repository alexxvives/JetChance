import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { flightsAPI } from '../api/flightsAPI';

export default function PendingFlightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingFlights, setPendingFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingFlights, setProcessingFlights] = useState(new Set());

  useEffect(() => {
    // Check if user is super-admin
    if (user?.role !== 'super-admin') {
      navigate('/dashboard');
      return;
    }
    
    fetchPendingFlights();
  }, [user, navigate]);

  const fetchPendingFlights = async () => {
    try {
      setIsLoading(true);
      // Get all flights (admin view) and filter for pending
      const response = await flightsAPI.getAllFlights(user.id);
      const flights = response.flights || response;
      const pending = flights.filter(flight => flight.status === 'pending');
      setPendingFlights(pending);
    } catch (error) {
      console.error('Error fetching pending flights:', error);
      setPendingFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightAction = async (flightId, action) => {
    try {
      setProcessingFlights(prev => new Set(prev).add(flightId));
      
      const response = await fetch(`/api/flights/${flightId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'approved' : 'declined' 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update flight status');
      }

      // Remove the flight from pending list
      setPendingFlights(prev => prev.filter(flight => flight.id !== flightId));
      
      console.log(`Flight ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing flight:`, error);
      alert(`Failed to ${action} flight. Please try again.`);
    } finally {
      setProcessingFlights(prev => {
        const newSet = new Set(prev);
        newSet.delete(flightId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pending Flight Approvals</h1>
              <p className="text-gray-600 mt-1">
                Review and approve operator flight submissions
              </p>
            </div>
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
            {pendingFlights.length} Pending
          </div>
        </div>

        {/* Pending Flights List */}
        {pendingFlights.length === 0 ? (
          <div className="text-center py-12">
            <CheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending flights to review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingFlights.map((flight) => (
              <div key={flight.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {flight.origin_city || flight.origin_code} → {flight.destination_city || flight.destination_code}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Departure:</span><br />
                          {formatDate(flight.departure_datetime)}
                        </div>
                        <div>
                          <span className="font-medium">Aircraft:</span><br />
                          {flight.aircraft_type || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span><br />
                          {formatPrice(flight.empty_leg_price)}
                        </div>
                        <div>
                          <span className="font-medium">Seats:</span><br />
                          {flight.available_seats} available
                        </div>
                        <div>
                          <span className="font-medium">Operator:</span><br />
                          {flight.operator_name || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span><br />
                          {flight.estimated_duration_minutes} minutes
                        </div>
                      </div>

                      {flight.description && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-600 text-sm mt-1">{flight.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 ml-6">
                      <button
                        onClick={() => handleFlightAction(flight.id, 'decline')}
                        disabled={processingFlights.has(flight.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        {processingFlights.has(flight.id) ? 'Processing...' : 'Decline'}
                      </button>
                      <button
                        onClick={() => handleFlightAction(flight.id, 'approve')}
                        disabled={processingFlights.has(flight.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {processingFlights.has(flight.id) ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}