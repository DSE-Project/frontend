import React from 'react';
import Header from '../components/Header';

const Dashboard = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-100">
        <Header user={user} />
        <main className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome{user ? `, ${user.email}` : ''}!
            </h2>
            <p className="text-gray-500">Here's your recession risk dashboard.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Recession Risk Score</h3>
                <p className="text-gray-600">Risk analysis data will appear here</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Economic Indicators</h3>
                <p className="text-gray-600">Economic metrics will appear here</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Forecasting Models</h3>
                <p className="text-gray-600">Model predictions will appear here</p>
              </div>
            </div>
        </main>
    </div>
  );
};

export default Dashboard;