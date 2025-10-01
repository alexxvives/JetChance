import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import FlightFilters from '../components/FlightFilters';
import FlightList from '../FlightList';
import CustomerBookings from '../components/CustomerBookings';
import SafeOperatorDashboard from '../components/SafeOperatorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import ErrorBoundary from '../components/ErrorBoundary';
import FlightTypeSelectionModal from '../components/FlightTypeSelectionModal';
import RegularJetRequestModal from '../components/RegularJetRequestModal';
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
  const [showFlightTypeSelection, setShowFlightTypeSelection] = useState(false);
  const [showRegularJetModal, setShowRegularJetModal] = useState(false);

  // Show flight type selection modal for customers on every login
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      setShowFlightTypeSelection(true);
    }
  }, [currentUser]);

  const handleFlightTypeSelection = (type) => {
    if (type === 'regular') {
      setShowRegularJetModal(true);
    }
    // For empty leg, just continue to dashboard
  };

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
              {t('dashboard.customer.tabs.emptyLegFlights')}
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
              {t('dashboard.customer.tabs.myBookings')}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'flights' && (
            <div className="px-6 py-6">
              {/* Custom Flight Request Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-6 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {t('dashboard.customer.customFlight.title')}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {t('dashboard.customer.customFlight.subtitle')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRegularJetModal(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t('dashboard.customer.customFlight.requestNow')}
                  </button>
                </div>
              </div>
              
              {/* Empty Leg Flights Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                      <span>{t('dashboard.customer.emptyLegFlights.title')}</span>
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {t('dashboard.customer.emptyLegFlights.badge')}
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm">{t('dashboard.customer.emptyLegFlights.description')}</p>
                    <p className="text-gray-500 text-xs mt-1">{t('dashboard.customer.emptyLegFlights.disclaimer')}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-sm font-medium">{t('dashboard.customer.emptyLegFlights.savingsLabel')}</span>
                  </div>
                </div>
              </div>
              
              <FlightFilters filters={filters} setFilters={setFilters} />
              <FlightList filters={filters} />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.customer.myBookings.title')}</h2>
                <p className="text-gray-600 mb-6">{t('dashboard.customer.myBookings.subtitle')}</p>
              </div>
              
              <CustomerBookings />
            </div>
          )}
        </div>
      </main>
      
      {/* Flight Type Selection Modal */}
      <FlightTypeSelectionModal
        isOpen={showFlightTypeSelection}
        onClose={() => setShowFlightTypeSelection(false)}
        onSelectEmptyLeg={() => handleFlightTypeSelection('empty')}
        onSelectRegularJet={() => handleFlightTypeSelection('regular')}
      />
      
      {/* Regular Jet Request Modal */}
      <RegularJetRequestModal
        isOpen={showRegularJetModal}
        onClose={() => setShowRegularJetModal(false)}
      />
    </div>
  );
}
