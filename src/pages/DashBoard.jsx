import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelPrediction from '../components/ModelPrediction';
import YearlyRiskChart from '../components/YearlyRiskChart';

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
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header user={user} />
      <SideBar />
      <main className="ml-64 p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome{getDisplayName()}!
          {loading && user && (
            <span className="text-sm text-gray-500 ml-2">Loading...</span>
          )}
        </h2>
        <p className="text-gray-500">Here's your recession risk dashboard.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModelPrediction monthsAhead="1" />
          <ModelPrediction monthsAhead="3" />
          <ModelPrediction monthsAhead="6" />
        </div>

        <div className="mt-8">
          <YearlyRiskChart />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;