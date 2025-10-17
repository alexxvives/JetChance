import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { extractAirportCode } from '../utils/airportUtils';
import { 
  Calendar,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Plane,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function CustomerBookings() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerBookings();
  }, [user]);

  const fetchCustomerBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!bookings.length) return null;

    const totalAmount = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalPassengers = bookings.reduce((sum, booking) => sum + (booking.passengerCount || 0), 0);
    const uniqueFlights = new Set(bookings.map(b => b.flightId)).size;

    return {
      totalAmount,
      totalFlights: uniqueFlights,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalPassengers
    };
  }, [bookings]);

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    
    const statusConfig = {
      confirmed: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle,
        text: t('dashboard.customer.myBookings.table.status.confirmed')
      },
      completed: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle,
        text: t('dashboard.customer.myBookings.table.status.completed')
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock,
        text: t('dashboard.customer.myBookings.table.status.pending')
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800', 
        icon: AlertCircle,
        text: t('dashboard.customer.myBookings.table.status.cancelled')
      }
    };

    const config = statusConfig[statusLower] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 COP';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' COP';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>{t('dashboard.customer.myBookings.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.customer.myBookings.error.title')}</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomerBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('dashboard.customer.myBookings.error.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.customer.myBookings.empty.title')}</h3>
          <p className="text-gray-600">
            {t('dashboard.customer.myBookings.empty.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.customer.myBookings.stats.totalSpent')}</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summaryStats.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.customer.myBookings.stats.totalFlights')}</p>
              <p className="text-xl font-bold text-gray-900">{summaryStats.totalFlights}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.customer.myBookings.stats.totalBookings')}</p>
              <p className="text-xl font-bold text-gray-900">{summaryStats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('dashboard.customer.myBookings.stats.totalPassengers')}</p>
              <p className="text-xl font-bold text-gray-900">{summaryStats.totalPassengers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t('dashboard.customer.myBookings.table.title')}</h3>
          </div>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.bookingId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.departure')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.route')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.passengers')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.operator')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.aircraft')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.customer.myBookings.table.columns.status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.bookingReference || booking.id}</div>
                    <div className="text-sm text-gray-500">{formatDate(booking.bookingDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{formatDate(booking.flight?.departure)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {extractAirportCode(booking.flight?.origin)} → {extractAirportCode(booking.flight?.destination)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{booking.passengerCount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.flight?.operator || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Plane className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{booking.flight?.aircraftName || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600 text-lg">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">{booking.currency || 'USD'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}