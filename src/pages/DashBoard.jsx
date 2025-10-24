import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelPrediction from '../components/DashBoardComponents/ModelPrediction';

// import YearlyRiskChart from '../components/DashBoardComponents/YearlyRiskChart';
// import TopDrivers from '../components/DashBoardComponents/TopDrivers';
import MacroIndicatorsSnapshot from '../components/DashBoardComponents/MacroIndicatorsSnapshot';
import EconomicIndicatorsMixed from '../components/EconomicIndicators/EconomicIndicatorsMixed';

// Memoized components to prevent unnecessary re-renders
const MemoizedModelPrediction = React.memo(ModelPrediction);
const MemoizedMacroIndicatorsSnapshot = React.memo(MacroIndicatorsSnapshot);
const MemoizedEconomicIndicatorsMixed = React.memo(EconomicIndicatorsMixed);

const Dashboard = () => {
  const { getWelcomeMessage, isLoadingUserData, initializing } = useAuth();
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();

  // Memoize the welcome message to prevent recalculation
  const welcomeMessage = useMemo(() => getWelcomeMessage(), [getWelcomeMessage]);
  
  // Memoize loading state
  const isLoading = useMemo(() => 
    initializing || isLoadingUserData(), 
    [initializing, isLoadingUserData]
  );

  // Memoize the main class name to prevent string recalculation
  const mainClassName = useMemo(() => 
    `transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`,
    [isCollapsed]
  );

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <div data-cy="sidebar">
        <SideBar />
      </div>

      <main
        className={`transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
          isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="mb-4 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 data-cy="welcome-message" className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome{getWelcomeMessage()}!
              {/* {(initializing || isLoadingUserData()) && (
                <span className="text-sm text-gray-500 ml-2">Loading...</span>
              )} */}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">Here's your recession risk dashboard.</p>
          </div>
        </div>
        
        {/* Model Predictions - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <ModelPrediction monthsAhead="1" />
          <ModelPrediction monthsAhead="3" />
          <ModelPrediction monthsAhead="6" />
        </div>


        {/* <div className="mt-6 sm:mt-8">
          <YearlyRiskChart />

        </div>  */}

        {/* Key Macroeconomic Snapshot */}
        <div className="mt-6 sm:mt-8">
          <MacroIndicatorsSnapshot />
        </div>

        <div data-cy="economic-indicators" className="mt-6 sm:mt-8">
          <EconomicIndicatorsMixed />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
