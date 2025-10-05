import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelPrediction from '../components/DashBoardComponents/ModelPrediction';
import MacroIndicatorsSnapshot from '../components/DashBoardComponents/MacroIndicatorsSnapshot';
import EconomicIndicatorsMixed from '../components/EconomicIndicators/EconomicIndicatorsMixed';

const Dashboard = () => {
  const { getWelcomeMessage, isLoadingUserData, initializing } = useAuth();
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <div data-cy="sidebar">
        <SideBar />
      </div>

      <main
        className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <h2 data-cy="welcome-message" className="text-3xl font-bold text-gray-800">
          Welcome{getWelcomeMessage()}!
          {(initializing || isLoadingUserData()) && (
            <span className="text-sm text-gray-500 ml-2">Loading...</span>
          )}
        </h2>
        <p data-cy="app-title" className="text-gray-500">
          Here's your recession risk dashboard.
        </p>

        <div
          data-cy="model-prediction"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ModelPrediction monthsAhead="1" />
          <ModelPrediction monthsAhead="3" />
          <ModelPrediction monthsAhead="6" />
        </div>

        <div data-cy="macro-indicators" className="mt-8">
          <MacroIndicatorsSnapshot />
        </div>

        <div data-cy="economic-indicators" className="mt-8">
          <EconomicIndicatorsMixed />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
