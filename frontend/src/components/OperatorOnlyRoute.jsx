import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const OperatorOnlyRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Only allow operators to access this route
  if (!user || user.role !== 'operator') {
    // Redirect to dashboard if user is not an operator
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default OperatorOnlyRoute;