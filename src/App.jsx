import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/DashBoard';
import CustomSimulation from './pages/CustomSimulation';
import ReportGeneration from './pages/ReportGeneration';
import SentimentDashboard from './pages/SentimentDashboard';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Header from './components/Header';
import SideBar from './components/SideBar';


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

  // return (
  //   <>
  //  <Header/>
  //  <SideBar/>
  //   <Routes>
  
  //     <Route path="/" element={<Dashboard />} />
  //     <Route path="/simulation" element={<ProtectedRoute> <CustomSimulation /> </ProtectedRoute>} />
  //     <Route path="/sentiment-dashboard" element={<ProtectedRoute> <SentimentDashboard /> </ProtectedRoute>} />
  //     <Route path="/reports" element={<ProtectedRoute> <ReportGeneration /> </ProtectedRoute>} />
  //     <Route path="/auth/login" element={user ? <Navigate to="/" replace /> : <AuthPage task={'login'} />} />
  //     <Route path="/auth/register" element={user ? <Navigate to="/" replace /> : <AuthPage task={'register'} />} />
  //     <Route path="*" element={<Navigate to="/" replace />} />
  //   </Routes>
  //    </>
  // );

return (
    <div className="min-h-screen bg-gray-100">
      {/* Header and Sidebar */}
      <Header className="fixed top-0 left-0 w-full z-20" />
      <SideBar className="fixed top-16 left-0 h-full w-64 z-10" />

      {/* Main content container with padding to avoid overlap */}
      <div className="pt-16 pl-64 p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/simulation"
            element={
              <ProtectedRoute>
                <CustomSimulation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sentiment-dashboard"
            element={
              <ProtectedRoute>
                <SentimentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/login"
            element={user ? <Navigate to="/" replace /> : <AuthPage task={"login"} />}
          />
          <Route
            path="/auth/register"
            element={user ? <Navigate to="/" replace /> : <AuthPage task={"register"} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;