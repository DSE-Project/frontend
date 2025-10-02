import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CustomSimulation = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featureDefinitions, setFeatureDefinitions] = useState({});
  const [definitionsLoading, setDefinitionsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();
  const [simulationMode, setSimulationMode] = useState('simple'); // 'simple' or 'advanced'

  // State for form values - store ALL features
  const [formValues, setFormValues] = useState({});

  // Load feature definitions from backend
  useEffect(() => {
    const loadFeatureDefinitions = async () => {
      try {
        setDefinitionsLoading(true);
        const response = await fetch(`${API_URL}/simulate/features`);
        if (!response.ok) throw new Error('Failed to load feature definitions');
        
        const data = await response.json();
        
        // Transform the API response to match the expected format
        const transformedDefinitions = {};
        Object.entries(data.models).forEach(([period, modelData]) => {
          const periodKey = period.replace('m', ''); 
          transformedDefinitions[periodKey] = {};
          
          modelData.features.forEach(feature => {
            transformedDefinitions[periodKey][feature.feature_code] = {
              name: feature.name,
              description: feature.description,
              min: feature.min_value,
              max: feature.max_value,
              default: feature.default_value,
              isImportant: feature.is_important
            };
          });
        });
        
        setFeatureDefinitions(transformedDefinitions);
        setError('');
      } catch (err) {
        setError('Failed to load feature definitions. Please try again.');
        console.error('Error loading features:', err);
      } finally {
        setDefinitionsLoading(false);
      }
    };

    loadFeatureDefinitions();
  }, []);

  // Initialize form values when tab changes or definitions load
  useEffect(() => {
    if (Object.keys(featureDefinitions).length > 0 && featureDefinitions[activeTab]) {
      const currentFeatures = featureDefinitions[activeTab];
      const initialValues = {};
      Object.keys(currentFeatures).forEach(key => {
        initialValues[key] = currentFeatures[key].default;
      });
      setFormValues(initialValues);
      setPrediction(null);
      setError('');
    }
  }, [activeTab, featureDefinitions]);

  const handleValueChange = (feature, value) => {
    setFormValues(prev => ({
      ...prev,
      [feature]: parseFloat(value)
    }));
  };

  const randomizeValues = () => {
    if (!featureDefinitions[activeTab]) return;
    
    const currentFeatures = featureDefinitions[activeTab];
    const randomValues = {};
    
    // Only randomize visible features based on current mode
    const featuresToRandomize = simulationMode === 'simple' 
      ? Object.keys(getTopImportantFeatures(currentFeatures))
      : Object.keys(currentFeatures);
    
    featuresToRandomize.forEach(key => {
      const { min, max } = currentFeatures[key];
      const randomValue = Math.random() * (max - min) + min;
      randomValues[key] = parseFloat(randomValue.toFixed(2));
    });
    
    setFormValues(prev => ({
      ...prev,
      ...randomValues
    }));
  };

  const clearAll = () => {
    if (!featureDefinitions[activeTab]) return;
    
    const currentFeatures = featureDefinitions[activeTab];
    const defaultValues = {};
    Object.keys(currentFeatures).forEach(key => {
      defaultValues[key] = currentFeatures[key].default;
    });
    setFormValues(defaultValues);
  };

  const runSimulation = async () => {
    setLoading(true);
    setError('');
    
    const requestData = {
      current_month_data: {
        observation_date: "2025-01-02",
        ...formValues, // Send ALL features to backend
        recession: 0
      },
      use_historical_data: true,
    };

    try {
      const response = await fetch(`${API_URL}/simulate/predict/${activeTab}m`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to run simulation. Please try again.');
      console.error('Error running simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionValue = () => {
    if (!prediction) return 0;
    switch (activeTab) {
      case '1': return (prediction.prob_1m * 100).toFixed(1);
      case '3': return (prediction.prob_3m * 100).toFixed(1);
      case '6': return (prediction.prob_6m * 100).toFixed(1);
      default: return 0;
    }
  };

  // Get exactly 6 most important features for simple mode
  const getTopImportantFeatures = (features) => {
    // First get all important features
    const importantFeatures = Object.entries(features)
      .filter(([key, feature]) => feature.isImportant);
    
    // If we have less than 6 important features, add some non-important ones to make 6
    let topFeatures = importantFeatures;
    if (importantFeatures.length < 6) {
      const nonImportantFeatures = Object.entries(features)
        .filter(([key, feature]) => !feature.isImportant)
        .slice(0, 6 - importantFeatures.length);
      topFeatures = [...importantFeatures, ...nonImportantFeatures];
    }
    
    // Take exactly 6 features
    const exactlySixFeatures = topFeatures.slice(0, 6);
    
    return exactlySixFeatures.reduce((acc, [key, feature]) => {
      acc[key] = feature;
      return acc;
    }, {});
  };

  // Filter features based on simulation mode (for display only)
  const getFilteredFeatures = () => {
    if (!featureDefinitions[activeTab]) return {};
    
    if (simulationMode === 'simple') {
      return getTopImportantFeatures(featureDefinitions[activeTab]);
    }
    
    return featureDefinitions[activeTab];
  };

  const RadialChart = ({ percentage, isLoading }) => {
    const radius = 80;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = (pct) => {
      if (pct < 20) return '#22c55e'; // Green
      if (pct < 50) return '#f59e0b'; // Yellow
      return '#ef4444'; // Red
    };

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={getColor(percentage)}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={isLoading ? circumference : strokeDashoffset}
              strokeLinecap="round"
              className={isLoading ? "animate-pulse" : "transition-all duration-1000 ease-out"}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              ) : (
                <>
                  <div className={`text-3xl font-bold ${percentage < 20 ? 'text-green-600' : percentage < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {percentage}%
                  </div>
                  <div className="text-sm text-gray-500">Risk</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <Header />
        <SideBar />
        <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please login to access the Custom Simulation tool and create your own economic scenarios.
            </p>
            <Link 
              to="/auth/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login to Continue
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (definitionsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <Header />
        <SideBar />
        <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading feature definitions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && Object.keys(featureDefinitions).length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <Header />
        <SideBar />
        <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Features</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const filteredFeatures = getFilteredFeatures();

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Custom Simulation Tool</h1>
            <p className="text-gray-600">
              Adjust economic indicators to simulate different scenarios and analyze their impact on recession probability.
            </p>
          </div>
          
          {/* Improved Compact Toggle Button */}
          <div className="flex items-center space-x-3 bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <span className={`text-sm font-medium ${
              simulationMode === 'simple' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              Simple
            </span>
            
            <button
              onClick={() => setSimulationMode(prev => prev === 'simple' ? 'advanced' : 'simple')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Toggle simulation mode</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  simulationMode === 'advanced' ? 'translate-x-6' : 'translate-x-1'
                } shadow-sm`}
              />
            </button>
            
            <span className={`text-sm font-medium ${
              simulationMode === 'advanced' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              Advanced
            </span>
          </div>
        </div>

        {/* Mode Description */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-blue-800 text-sm font-medium">
                {simulationMode === 'simple' 
                  ? 'Simple Mode: Showing 6 key economic indicators for quick scenario testing. Switch to Advanced Mode for full control over all features.'
                  : 'Advanced Mode: Showing all available economic indicators for detailed scenario analysis. Switch to Simple Mode for quick testing with key indicators.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['1', '3', '6'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab} Month{tab !== '1' ? 's' : ''} Ahead
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-800">
                  Economic Indicators
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {simulationMode === 'simple' ? '6 key features' : `${Object.keys(filteredFeatures).length} total features`}
                  </span>
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={clearAll}
                    disabled={!featureDefinitions[activeTab]}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={randomizeValues}
                    disabled={!featureDefinitions[activeTab]}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Randomize Values
                  </button>
                </div>
              </div>

              {Object.keys(filteredFeatures).length > 0 ? (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(filteredFeatures).map(([key, feature]) => (
                    <div key={key} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="block text-sm font-medium text-gray-700">{feature.name}</label>
                           
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                        <input
                          type="number"
                          value={formValues[key] || feature.default}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.01"
                          min={feature.min}
                          max={feature.max}
                        />
                      </div>
                      <input
                        type="range"
                        min={feature.min}
                        max={feature.max}
                        step="0.01"
                        value={formValues[key] || feature.default}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>Min: {feature.min}</span>
                        <span>Max: {feature.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No features available for this time period</p>
                </div>
              )}

              <button
                onClick={runSimulation}
                disabled={loading || !featureDefinitions[activeTab]}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg shadow-md"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Running Simulation...
                  </div>
                ) : (
                  'Run Simulation'
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                Recession Probability
              </h3>
              <RadialChart percentage={parseFloat(getPredictionValue())} isLoading={loading} />
              
              {error && prediction === null && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {prediction && !loading && (
                <div className="mt-6 text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                    prediction.confidence_interval.binary_prediction === 0
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {prediction.confidence_interval.prediction_text}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(prediction.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Simulation Info Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Simulation Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium capitalize px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                    {simulationMode}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Time Horizon:</span>
                  <span className="font-medium">{activeTab} Month{activeTab !== '1' ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Features Used:</span>
                  <span className="font-medium">
                    {simulationMode === 'simple' ? '6 key features' : `${Object.keys(filteredFeatures).length} total`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium text-xs">
                    {prediction ? new Date(prediction.timestamp).toLocaleTimeString() : 'Not run yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomSimulation;