import React from 'react';
import Header from '../components/Header';
import SideBar from '../components/SideBar';

const CustomSimulation = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header user={user} />
      <SideBar />
      <main className="ml-64 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Custom Simulation Tool</h1>
        <p className="text-gray-600">
          Create custom economic scenarios and analyze their impact on recession probability.
        </p>
        {/* Add your simulation content here */}
      </main>
    </div>
  );
};

export default CustomSimulation;
