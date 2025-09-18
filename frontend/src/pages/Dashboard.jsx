import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FlightFilters from '../components/FlightFilters';
import FlightList from '../FlightList';
import OperatorDashboard from '../components/OperatorDashboard';

export default function Dashboard({ user, onNavigate, onLogout }) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });

  // Show operator dashboard for operators
  if (currentUser?.role === 'operator') {
    return <OperatorDashboard user={currentUser} />;
  }

  // Show customer dashboard for customers
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Available Empty-Leg Flights
          </h1>
          <p className="text-xl text-gray-600">
            Discover luxury flights at unbeatable prices
          </p>
        </div>

        <FlightFilters filters={filters} setFilters={setFilters} />
        <FlightList filters={filters} />
      </main>
    </div>
  );
}