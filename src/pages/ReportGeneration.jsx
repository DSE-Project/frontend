import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { useAuth } from '../contexts/AuthContext';

const ReportGeneration = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <Header />
        <SideBar />
        <main className="ml-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please login to access the Report Generation tool and create comprehensive analysis reports.
            </p>
            <Link 
              to="/auth/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login to Continue
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className="ml-64 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Report Generation</h1>
        <p className="text-gray-600">
          Generate comprehensive recession analysis reports and forecasts.
        </p>
        {/* Add your report generation content here */}
      </main>
    </div>
  );
};

export default ReportGeneration;