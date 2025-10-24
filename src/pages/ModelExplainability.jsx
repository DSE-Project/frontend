import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelExplanation from '../components/DashBoardComponents/ModelExplanation';
import CompactPredictionsDisplay from '../components/DashBoardComponents/CompactPredictionsDisplay';

const ModelExplainability = () => {
  const { getWelcomeMessage, isLoadingUserData, initializing } = useAuth();
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
        isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
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
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Model Explainability (SHAP & Permutation Importance)
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Understand which economic indicators are driving the recession predictions using SHAP values and permutation feature importance analysis.
          </p>
        </div>

        {/* Compact Predictions Display */}
        <CompactPredictionsDisplay />

        {/* Model Explanations Grid - Mobile-first responsive layout */}
        <div className="space-y-6 xl:space-y-0 xl:grid xl:grid-cols-3 xl:gap-6">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-t-4 border-green-500">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-800">1-Month Explainability</h3>
            </div>
            <ModelExplanation monthsAhead="1m" />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-t-4 border-yellow-500">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-800">3-Month Explainability</h3>
            </div>
            <ModelExplanation monthsAhead="3m" />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-t-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-800">6-Month Explainability</h3>
            </div>
            <ModelExplanation monthsAhead="6m" />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              About SHAP Values
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                SHAP (SHapley Additive exPlanations) values show the contribution of each feature to the model's prediction.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Positive values (green bars):</strong> Push the recession probability higher</li>
                <li><strong>Negative values (red bars):</strong> Push the recession probability lower</li>
                <li><strong>Magnitude:</strong> Indicates the strength of the feature's influence</li>
              </ul>
              <p className="text-xs text-gray-500">
                SHAP values are based on cooperative game theory and provide a unified framework for interpreting predictions.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              About Permutation Importance
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Permutation feature importance measures how much model performance decreases when a feature's values are randomly shuffled.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Higher values:</strong> More important features for the prediction</li>
                <li><strong>Lower values:</strong> Less critical features</li>
                <li><strong>Zero or negative:</strong> Features that don't improve model performance</li>
              </ul>
              <p className="text-xs text-gray-500">
                This method is model-agnostic and provides a straightforward measure of feature importance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModelExplainability;