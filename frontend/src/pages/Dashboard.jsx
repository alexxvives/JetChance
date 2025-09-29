import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import FlightFilters from '../components/FlightFilters';
import FlightList from '../FlightList';
import CustomerBookings from '../components/CustomerBookings';
import SafeOperatorDashboard from '../components/SafeOperatorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import ErrorBoundary from '../components/ErrorBoundary';
import { Plane, BookOpen } from 'lucide-react';

export default function Dashboard({ user, onNavigate, onLogout }) {
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
  const currentUser = user || authUser;
  
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });

  const [activeTab, setActiveTab] = useState('flights');

  // Show admin dashboard for admins and super-admins
  if (currentUser?.role === 'admin' || currentUser?.role === 'super-admin') {
    return (
      <ErrorBoundary>
        <AdminDashboard user={currentUser} />
      </ErrorBoundary>
    );
  }

  // Show operator dashboard for operators only
  if (currentUser?.role === 'operator') {
    return (
      <ErrorBoundary>
        <SafeOperatorDashboard user={currentUser} />
      </ErrorBoundary>
    );
  }

  // Show customer dashboard for customers
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('dashboard.customer.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('dashboard.customer.subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'flights'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Plane className="h-5 w-5 mr-2" />
              Available Flights
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              My Bookings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'flights' && (
            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Flights</h2>
                <p className="text-gray-600 mb-6">Discover and book your next luxury flight</p>
              </div>
              
              <FlightFilters filters={filters} setFilters={setFilters} />
              <FlightList filters={filters} />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Bookings</h2>
                <p className="text-gray-600 mb-6">View and manage your flight reservations</p>
              </div>
              
              <CustomerBookings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
