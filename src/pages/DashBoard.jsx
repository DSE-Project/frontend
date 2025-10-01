import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelPrediction from '../components/DashBoardComponents/ModelPrediction';
import ModelExplanation from '../components/DashBoardComponents/ModelExplanation';
// import YearlyRiskChart from '../components/DashBoardComponents/YearlyRiskChart';
import TopDrivers from '../components/DashBoardComponents/TopDrivers';
import MacroIndicatorsSnapshot from '../components/DashBoardComponents/MacroIndicatorsSnapshot';
import EconomicIndicatorsMixed from '../components/EconomicIndicators/EconomicIndicatorsMixed';

const Dashboard = () => {
  const { getWelcomeMessage, isLoadingUserData, initializing } = useAuth();
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>

        <h2 className="text-3xl font-bold text-gray-800">
          Welcome{getWelcomeMessage()}!
          {(initializing || isLoadingUserData()) && (
            <span className="text-sm text-gray-500 ml-2">Loading...</span>
          )}
        </h2>
        <p className="text-gray-500">Here's your recession risk dashboard.</p>
        
        {/* Model Predictions - 3 columns */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModelPrediction monthsAhead="1" />
          <ModelPrediction monthsAhead="3" />
          <ModelPrediction monthsAhead="6" />
        </div>

        {/* Model Explanations - SHAP & ELI5 - 3 columns */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📊 Model Explainability (SHAP & ELI5)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Understand which economic indicators are driving the recession predictions
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ModelExplanation monthsAhead="1m" />
            <ModelExplanation monthsAhead="3m" />
            <ModelExplanation monthsAhead="6m" />
          </div>
        </div>


        {/* <div className="mt-8">
          <YearlyRiskChart />

        </div> */}

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