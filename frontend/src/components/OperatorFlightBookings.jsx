import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Helper function to format COP with separate styling for currency label
const formatCOPWithStyling = (amount) => {
  if (!amount) return { number: '0', currency: 'COP' };
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return { number: formatted, currency: 'COP' };
};

export default function OperatorFlightBookings({ user }) {
  const { t } = useTranslation();
  const [crmData, setCrmData] = useState(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState(new Set());

  useEffect(() => {
    fetchCrmData();
  }, [user]);

  const fetchCrmData = async () => {
    try {
      setCrmLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/bookings/operator', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform data to match super admin format
        // Only count confirmed bookings for revenue calculation (same as super admin)
        const confirmedRevenue = data.bookings.reduce((sum, booking) => {
          return sum + (booking.status === 'confirmed' ? (booking.totalAmount || 0) : 0);
        }, 0);
        
        const transformedData = {
          revenue: {
            total: confirmedRevenue,
            commission: confirmedRevenue * 0.1,
            operator: confirmedRevenue * 0.9
          },
          totalFlights: data.totalFlights || 0,
          bookings: data.bookings.map(booking => ({
            id: booking.id,
            status: booking.status,
            customer: {
              firstName: booking.customerName?.split(' ')[0] || '',
              lastName: booking.customerName?.split(' ').slice(1).join(' ') || '',
              email: booking.contact_email
            },
            contact_email: booking.contact_email,
            flight: {
              origin: { code: booking.flight?.origin?.split(' (')[1]?.replace(')', '') || 'TBD' },
              destination: { code: booking.flight?.destination?.split(' (')[1]?.replace(')', '') || 'TBD' },
              schedule: { departure: booking.flight?.departure }
            },
            totalPrice: booking.totalAmount,
            createdAt: booking.bookingDate,
            passengers: Array.from({ length: booking.passengerCount }, (_, i) => ({
              firstName: i === 0 ? (booking.customerName?.split(' ')[0] || 'Passenger') : `Passenger`,
              lastName: i === 0 ? (booking.customerName?.split(' ').slice(1).join(' ') || `${i + 1}`) : `${i + 1}`,
              email: booking.contact_email || 'N/A',
              phone: booking.customerPhone || 'N/A'
            }))
          }))
        };
        
        setCrmData(transformedData);
      } else {
        console.error('Failed to load bookings');
      }
    } catch (err) {
      console.error('Error fetching operator bookings:', err);
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

  if (crmLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  if (!crmData) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CRM Data</h3>
          <p className="text-gray-600">Unable to load CRM data at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">CRM Dashboard</h2>
      <p className="text-gray-600 mb-6">View all your flight bookings, revenue analytics, and customer details</p>
      
      <div className="space-y-6">
        {/* Operator Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Operator Summary</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Your Revenue</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-green-600">
                  {formatCOPWithStyling(crmData.revenue.operator).number}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {formatCOPWithStyling(crmData.revenue.operator).currency}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Total Flights Submitted</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-blue-600">
                  {crmData.totalFlights || 0}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  flights
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-purple-600">
                  {crmData.bookings.length}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  bookings
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
                        <div className="flex items-baseline space-x-1">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCOPWithStyling(booking.totalPrice).number}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatCOPWithStyling(booking.totalPrice).currency}
                          </span>
                        </div>
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
    </div>
  );
}