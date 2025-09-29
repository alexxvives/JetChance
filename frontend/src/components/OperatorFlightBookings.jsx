import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { extractAirportCode } from '../utils/airportUtils';
import { 
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  EyeIcon
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
  const navigate = useNavigate();
  const [crmData, setCrmData] = useState(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState(new Set());

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
          // Fallback: try to navigate using booking ID or show error
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
            flightId: booking.flightId || booking.flight?.id,
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
              schedule: { departure: booking.flight?.departure },
              availableSeats: booking.flight?.availableSeats,
              totalSeats: booking.flight?.totalSeats
            },
            totalPrice: booking.totalAmount,
            createdAt: booking.bookingDate,
            passengers: booking.passengers || []
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.operator.crm.noData.title')}</h3>
          <p className="text-gray-600">{t('dashboard.operator.crm.noData.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.operator.crm.title')}</h2>
        <p className="text-gray-600 mb-6">{t('dashboard.operator.crm.subtitle')}</p>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.operator.crm.stats.yourRevenue')}</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCOPWithStyling(crmData.revenue.operator).number} {formatCOPWithStyling(crmData.revenue.operator).currency}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.operator.crm.stats.totalFlights')}</p>
              <p className="text-xl font-bold text-gray-900">{crmData.totalFlights || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.operator.crm.stats.totalBookings')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('dashboard.operator.crm.stats.totalPassengers')}</p>
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
            <h3 className="text-lg font-medium text-gray-900">{t('dashboard.operator.crm.table.header')}</h3>
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
                      <td colSpan="8" className="px-6 py-4 bg-gray-50">
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
  );
}