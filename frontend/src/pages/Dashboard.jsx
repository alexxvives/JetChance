import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import CustomerDashboard from '../components/CustomerDashboard';
import SafeOperatorDashboard from '../components/SafeOperatorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Dashboard({ user, onNavigate, onLogout }) {
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
  const currentUser = user || authUser;

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
    <ErrorBoundary>
      <CustomerDashboard user={currentUser} />
    </ErrorBoundary>
  );
}
