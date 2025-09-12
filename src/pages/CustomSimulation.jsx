import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CustomSimulation = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featureDefinitions, setFeatureDefinitions] = useState({});
  const [definitionsLoading, setDefinitionsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // State for form values
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
    Object.keys(currentFeatures).forEach(key => {
      const { min, max } = currentFeatures[key];
      const randomValue = Math.random() * (max - min) + min;
      randomValues[key] = parseFloat(randomValue.toFixed(2));
    });
    setFormValues(randomValues);
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
        observation_date: "1/2/2025",
        ...formValues,
        recession: 0
      },
      use_historical_data: true,
      historical_data_source: "csv"
    };

    try {
      const response = await fetch(`${API_URL}/forecast/predict/${activeTab}m`, {
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
        <main className="ml-64 p-4 sm:p-6 lg:p-8">
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
        <main className="ml-64 p-4 sm:p-6 lg:p-8">
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
        <main className="ml-64 p-4 sm:p-6 lg:p-8">
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

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className="ml-64 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Custom Simulation Tool</h1>
        <p className="text-gray-600 mb-8">
          Adjust economic indicators to simulate different scenarios and analyze their impact on recession probability.
        </p>

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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Economic Indicators</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={clearAll}
                    disabled={!featureDefinitions[activeTab]}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={randomizeValues}
                    disabled={!featureDefinitions[activeTab]}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Randomize Values
                  </button>
                </div>
              </div>

              {featureDefinitions[activeTab] ? (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(featureDefinitions[activeTab]).map(([key, feature]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">{feature.name}</label>
                          <p className="text-xs text-gray-500">{feature.description}</p>
                        </div>
                        <input
                          type="number"
                          value={formValues[key] || feature.default}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{feature.min}</span>
                        <span>{feature.max}</span>
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
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Running Simulation...' : 'Run Simulation'}
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
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}

              {prediction && !loading && (
                <div className="mt-6 text-center">
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                    prediction.confidence_interval.binary_prediction === 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {prediction.confidence_interval.prediction_text}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(prediction.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomSimulation;
