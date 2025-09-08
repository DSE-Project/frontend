import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/DashBoard';
import CustomSimulation from './pages/CustomSimulation';
import ReportGeneration from './pages/ReportGeneration';
import AuthPage from './pages/AuthPage';

function App() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/simulation" element={<CustomSimulation />} />
      <Route path="/reports" element={<ReportGeneration />} />
      <Route path="/auth/login" element={user ? <Navigate to="/" replace /> : <AuthPage task={'login'} />} />
      <Route path="/auth/register" element={user ? <Navigate to="/" replace /> : <AuthPage task={'register'} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;