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
  const { isCollapsed } = useSidebar();

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

      <main className={mainClassName}>
        <h2 data-cy="welcome-message" className="text-3xl font-bold text-gray-800">
          Welcome{welcomeMessage}!
          {isLoading && (
            <span className="text-sm text-gray-500 ml-2">Loading...</span>
          )}
        </h2>
        <p className="text-gray-500">Here's your recession risk dashboard.</p>
        
        {/* Model Predictions - 3 columns */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MemoizedModelPrediction monthsAhead="1" />
          <MemoizedModelPrediction monthsAhead="3" />
          <MemoizedModelPrediction monthsAhead="6" />
        </div>


        {/* <div className="mt-8">
          <YearlyRiskChart />

        </div>  */}

        {/* Key Macroeconomic Snapshot */}
        <div className="mt-8">
          <MemoizedMacroIndicatorsSnapshot />
        </div>

        <div data-cy="economic-indicators" className="mt-8">
          <MemoizedEconomicIndicatorsMixed />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
