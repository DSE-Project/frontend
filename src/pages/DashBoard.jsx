import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelPrediction from '../components/ModelPrediction';
import YearlyRiskChart from '../components/YearlyRiskChart';
import TopDrivers from '../components/TopDrivers';
import MacroIndicatorsSnapshot from '../components/MacroIndicatorsSnapshot';
import EconomicIndicatorsMixed from '../components/EconomicIndicators/EconomicIndicatorsMixed';

const Dashboard = () => {
  const { getWelcomeMessage, loading } = useAuth();
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-300 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome{getWelcomeMessage()}!
          {loading && (
            <span className="text-sm text-gray-500 ml-2">Loading...</span>
          )}
        </h2>
        <p className="text-gray-500">Here's your recession risk dashboard.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModelPrediction monthsAhead="1" />
          <ModelPrediction monthsAhead="3" />
          <ModelPrediction monthsAhead="6" />
        </div>

        {/* Top Drivers (Explainability) Section */}
        {/* <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Top Drivers (Explainability)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TopDrivers monthsAhead="1" />
            <TopDrivers monthsAhead="3" />
            <TopDrivers monthsAhead="6" />
          </div>
        </div> */}

        <div className="mt-8">
          <YearlyRiskChart />
        </div>

        {/* Key Macroeconomic Snapshot */}
        <div className="mt-8">
          <MacroIndicatorsSnapshot />
        </div>

        {/* Economic Indicators Charts */}
        <div className="mt-8">
          <EconomicIndicatorsMixed />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
