import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/DashBoard';
import CustomSimulation from './pages/CustomSimulation';
import ReportGeneration from './pages/ReportGeneration';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ReportPrint from './pages/ReportPrint';
import SentimentDashboard from './pages/SentimentDashboard';
import UserProfile from './pages/UserProfile';
import ModelExplainability from './pages/ModelExplainability';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/simulation" element={<ProtectedRoute><CustomSimulation /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportGeneration /></ProtectedRoute>} />
        <Route path="/sentiment-dashboard" element={<ProtectedRoute><SentimentDashboard /></ProtectedRoute>} />
        <Route path="/model-explainability" element={<ModelExplainability />} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/auth/login" element={user ? <Navigate to="/" replace /> : <AuthPage task="login" />} />
        <Route path="/auth/register" element={user ? <Navigate to="/" replace /> : <AuthPage task="register" />} />
        <Route path="/reports-print" element={<ReportPrint />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ✅ ToastContainer should be inside the fragment, after Routes */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
