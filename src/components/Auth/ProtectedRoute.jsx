import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/auth/login' }) => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;