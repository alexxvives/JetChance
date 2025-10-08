import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightsAPI, shouldUseRealAPI } from '../api/flightsAPI';
import DashboardLayout from '../components/DashboardLayout';
import FlightDetailsView from '../components/FlightDetailsView';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';

export default function FlightDetailsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if we're inside a dashboard (has user context already)
  const isInsideDashboard = !!user;

  useEffect(() => {
    // Find flight by ID using appropriate API
    const loadFlight = async () => {
      try {
        console.log('🔍 Loading flight with ID:', id);
        if (shouldUseRealAPI()) {
          const foundFlight = await flightsAPI.getFlightById(id);
          console.log('✅ Real API flight data:', foundFlight);
          setFlight(foundFlight);
         } else {
          console.log('❌ No API configured');
          setFlight(null);
        }
      } catch (error) {
        console.error('❌ Error loading flight:', error);
        setFlight(null);
      } finally {
        setLoading(false);
      }
    };

    loadFlight();
  }, [id]);

  if (loading) {
    const loadingContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('flightDetails.loading')}</p>
        </div>
      </div>
    );
    
    return isInsideDashboard ? loadingContent : (
      <DashboardLayout user={user} activeTab="flights">
        {loadingContent}
      </DashboardLayout>
    );
  }

  if (!flight) {
    const notFoundContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">{t('flightDetails.notFound')}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('flightDetails.backToDashboard')}
          </button>
        </div>
      </div>
    );
    
    return isInsideDashboard ? notFoundContent : (
      <DashboardLayout user={user} activeTab="flights">
        {notFoundContent}
      </DashboardLayout>
    );
  }

  // Use FlightDetailsView component with same UI as admin
  const content = (
    <div className="py-6 px-6">
      <FlightDetailsView 
        flight={flight}
        onBack={() => navigate(-1)}
        isOperator={user?.role === 'operator'}
        isAdmin={user?.role === 'admin' || user?.role === 'super-admin'}
      />
    </div>
  );
  
  // If accessed from dashboard (user exists), render content only
  // Otherwise wrap in DashboardLayout for standalone access
  if (isInsideDashboard) {
    return content;
  }
  
  return (
    <DashboardLayout user={user} activeTab="flights">
      {content}
    </DashboardLayout>
  );
}








