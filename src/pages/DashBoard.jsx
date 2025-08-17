import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Header from '../components/Header';
import SimulationTool from '../components/SimulationTool';

const Dashboard = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            console.log('No user document found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const getDisplayName = () => {
    if (loading) return '';
    if (userData && userData.firstName && userData.lastName) {
      return `, ${userData.firstName} ${userData.lastName}`;
    }
    if (user) {
      return `, ${user.email}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome{getDisplayName()}!
          {loading && user && (
            <span className="text-sm text-gray-500 ml-2">Loading...</span>
          )}
        </h2>
        <p className="text-gray-600 mt-1">Here's your recession risk dashboard.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recession Risk Score */}
          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Recession Risk Score</h3>
            <p className="text-red-700">Risk analysis data will appear here.</p>
          </div>

          {/* Economic Indicators */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Economic Indicators</h3>
            <p className="text-blue-700">Economic metrics will appear here.</p>
          </div>

          {/* Forecasting Models */}
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Forecasting Models</h3>
            <p className="text-green-700">Model predictions will appear here.</p>
          </div>

          {/* Simulation Tool spanning full width */}
          <div className="col-span-full bg-gray-100 border border-gray-300 p-6 rounded-lg shadow">
            <SimulationTool />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
