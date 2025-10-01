import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelExplanation from '../components/DashBoardComponents/ModelExplanation';
import CompactPredictionsDisplay from '../components/DashBoardComponents/CompactPredictionsDisplay';

const ModelExplainability = () => {
  const { getWelcomeMessage, isLoadingUserData, initializing } = useAuth();
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Model Explainability (SHAP & ELI5)
          </h2>
          <p className="text-gray-600 text-lg">
            Understand which economic indicators are driving the recession predictions using advanced AI explainability techniques.
          </p>
        </div>

        {/* Compact Predictions Display */}
        <CompactPredictionsDisplay />

        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>SHAP (SHapley Additive exPlanations)</strong> shows how much each feature contributes to pushing the prediction higher or lower compared to the base prediction.
                  <br />
                  <strong>Feature Importance (ELI5-style)</strong> shows how much the prediction changes when each feature is shuffled, indicating feature relevance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Model Explanations Grid - 3 columns for different time horizons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-4 border-t-4 border-green-500">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h3 className="text-md font-semibold text-gray-800">1-Month Explainability</h3>
            </div>
            <ModelExplanation monthsAhead="1m" />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 border-t-4 border-yellow-500">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <h3 className="text-md font-semibold text-gray-800">3-Month Explainability</h3>
            </div>
            <ModelExplanation monthsAhead="3m" />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 border-t-4 border-red-500">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <h3 className="text-md font-semibold text-gray-800">6-Month Explainability</h3>
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
              About Feature Importance
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