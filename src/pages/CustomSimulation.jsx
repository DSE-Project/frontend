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

  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    const loadFeatureDefinitions = async () => {
      try {
        setDefinitionsLoading(true);
        const response = await fetch(`${API_URL}/simulate/features`);
        if (!response.ok) throw new Error('Failed to load feature definitions');

        const data = await response.json();
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
      current_month_data: { observation_date: "1/2/2025", ...formValues, recession: 0 },
      use_historical_data: true,
    };

    try {
      const response = await fetch(`${API_URL}/simulate/predict/${activeTab}m`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const getColor = (pct) => pct < 20 ? '#22c55e' : pct < 50 ? '#f59e0b' : '#ef4444';

    return (
      <div className="flex items-center justify-center" data-cy="radial-chart">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            <circle cx="100" cy="100" r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={getColor(percentage)}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={isLoading ? circumference : strokeDashoffset}
              strokeLinecap="round"
              className={isLoading ? "animate-pulse" : "transition-all duration-1000 ease-out"}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-cy="loading-spinner"></div>
            ) : (
              <div className="text-center" data-cy="prediction-value">
                <div className={`text-3xl font-bold ${percentage < 20 ? 'text-green-600' : percentage < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <div className="text-sm text-gray-500">Risk</div>
              </div>
            )}
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
        <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`} data-cy="auth-required-page">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <Link to="/auth/login" data-cy="login-button" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Login to Continue</Link>
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
        <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`} data-cy="loading-page">
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

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`} data-cy="custom-simulation-page">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Custom Simulation Tool</h1>

        {/* Tabs */}
        <div className="mb-8" data-cy="tabs">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['1', '3', '6'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  data-cy={`tab-${tab}`}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {tab} Month{tab !== '1' ? 's' : ''} Ahead
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Feature Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" data-cy="feature-controls">
          {featureDefinitions[activeTab] && Object.entries(featureDefinitions[activeTab]).map(([key, def]) => (
            <div key={key} className="p-4 bg-white rounded-lg shadow-sm flex flex-col" data-cy={`feature-${key}`}>
              <label className="text-sm font-medium text-gray-700 mb-1">{def.name}</label>
              <input
                type="range"
                min={def.min}
                max={def.max}
                step="0.01"
                value={formValues[key]}
                onChange={(e) => handleValueChange(key, e.target.value)}
                data-cy={`slider-${key}`}
              />
              <input
                type="number"
                min={def.min}
                max={def.max}
                step="0.01"
                value={formValues[key]}
                onChange={(e) => handleValueChange(key, e.target.value)}
                className="mt-2 border rounded px-2 py-1"
                data-cy={`input-${key}`}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-4 mb-6" data-cy="action-buttons">
          <button onClick={randomizeValues} data-cy="randomize-button" className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition">Randomize Values</button>
          <button onClick={clearAll} data-cy="reset-button" className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">Reset to Default</button>
          <button onClick={runSimulation} data-cy="run-simulation-button" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Run Simulation</button>
        </div>

        {/* Error */}
        {error && <div className="text-red-600 font-medium mb-4" data-cy="error-message">{error}</div>}

        {/* Prediction */}
        {prediction && (
          <div data-cy="prediction-result" className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Recession Probability</h2>
            <RadialChart percentage={getPredictionValue()} isLoading={loading} />
            <p className="mt-2 text-gray-600">{prediction?.confidence_interval?.prediction_text}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomSimulation;
