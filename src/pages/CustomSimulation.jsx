import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { useAuth } from '../contexts/AuthContext';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useSidebar } from '../contexts/SidebarContext';


const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const CustomSimulation = () => {
  const [activeTab, setActiveTab] = useState('6'); // default 6M
  const [formValues, setFormValues] = useState({});
  const [predictions, setPredictions] = useState({}); // store all horizons
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [simpleMode, setSimpleMode] = useState(true);
  const { isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();

  // Features for all horizons
  const featureDefinitions = {
    '1': {
      UNRATE: { name: 'Unemployment Rate', min: 0, max: 30, default: 4.0 },
      CPIFOOD: { name: 'Food Price Increase', min: 0, max: 500, default: 300 },
      TB3MS: { name: 'Interest Rate', min: 0, max: 30, default: 4.22 },
      GDP: { name: 'GDP', min: 27000, max: 32000, default: 29502.54 },
      PSTAX: { name: 'Personal Tax', min: 2800, max: 3500, default: 3100.43 },
      UMCSENT: { name: 'Consumer Sentiment', min: 55, max: 80, default: 64.9 },
    },
    '3': {
      UNRATE: { name: 'Unemployment Rate', min: 0, max: 30, default: 4.0 },
      CPIFOOD: { name: 'Food Price Increase', min: 0, max: 500, default: 300 },
      TB3MS: { name: 'Interest Rate', min: 0, max: 30, default: 4.22 },
      GDP: { name: 'GDP', min: 27000, max: 32000, default: 29502.54 },
      PSTAX: { name: 'Personal Tax', min: 2800, max: 3500, default: 3100.43 },
      UMCSENT: { name: 'Consumer Sentiment', min: 55, max: 80, default: 64.9 },
    },
    '6': {
      UNRATE: { name: 'Unemployment Rate', min: 0, max: 30, default: 4.0 },
      CPIFOOD: { name: 'Food Price Increase', min: 0, max: 500, default: 300 },
      TB3MS: { name: 'Interest Rate', min: 0, max: 30, default: 4.22 },
      GDP: { name: 'GDP', min: 27000, max: 32000, default: 29502.54 },
      PSTAX: { name: 'Personal Tax', min: 2800, max: 3500, default: 3100.43 },
      UMCSENT: { name: 'Consumer Sentiment', min: 55, max: 80, default: 64.9 },
    },
  };

  // Initialize form values
  useEffect(() => {
    const currentFeatures = featureDefinitions[activeTab];
    if (!currentFeatures) return;

    const initialValues = {};
    Object.keys(currentFeatures).forEach(key => {
      if (simpleMode && ['UNRATE', 'CPIFOOD', 'TB3MS'].includes(key)) {
        initialValues[key] = currentFeatures[key].default;
      } else if (!simpleMode) {
        initialValues[key] = currentFeatures[key].default;
      }
    });
    setFormValues(initialValues);
    setPrediction(null);
    setError('');
  }, [activeTab, simpleMode]);

  // Handle changes
  const handleValueChange = (feature, value) => {
    setFormValues(prev => ({ ...prev, [feature]: parseFloat(value) }));
  };

  // Randomize / Reset
  const randomizeValues = () => {
    const currentFeatures = featureDefinitions[activeTab];
    const randomValues = {};
    Object.keys(currentFeatures).forEach(key => {
      if ((simpleMode && ['UNRATE', 'CPIFOOD', 'TB3MS'].includes(key)) || !simpleMode) {
        const { min, max } = currentFeatures[key];
        randomValues[key] = parseFloat((Math.random() * (max - min) + min).toFixed(2));
      }
    });
    setFormValues(randomValues);
  };

  const clearAll = () => {
    const currentFeatures = featureDefinitions[activeTab];
    const defaultValues = {};
    Object.keys(currentFeatures).forEach(key => {
      if ((simpleMode && ['UNRATE', 'CPIFOOD', 'TB3MS'].includes(key)) || !simpleMode) {
        defaultValues[key] = currentFeatures[key].default;
      }
    });
    setFormValues(defaultValues);
  };


  // Run simulation
  const runSimulation = async () => {
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const requestData = {
        UNRATE: formValues.UNRATE,
        CPIFOOD: formValues.CPIFOOD,
        TB3MS: formValues.TB3MS,
      };

      const response = await fetch(`${API_URL}/api/v1/forecast/simulate/${activeTab}m`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch prediction');
      }

      const data = await response.json();
      const prob = parseFloat(data[`prob_${activeTab}m`] || 0);
      const prediction_text = data.confidence_interval?.prediction_text || '';
      const timestamp = data.timestamp || new Date().toISOString();

      setPredictions(prev => ({ ...prev, [activeTab]: prob }));
      setPrediction({ prob, prediction_text, timestamp });
    } catch (err) {
      console.error(err);
      setError('Failed to run simulation. Check console logs.');
    } finally {
      setLoading(false);
    }
  };

  // Radial chart component
  const RadialChart = ({ percentage, isLoading }) => {
    const radius = 80;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = (pct) => {
      if (pct < 20) return '#22c55e';
      if (pct < 50) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="flex items-center justify-center">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <div className="text-center">
                <div className={`text-3xl font-bold ${percentage < 20 ? 'text-green-600' : percentage < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Risk</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  // Chart data for all horizons
  const chartData = [
    { horizon: '1M', prob: (predictions['1'] || 0) * 100 },
    { horizon: '3M', prob: (predictions['3'] || 0) * 100 },
    { horizon: '6M', prob: (predictions['6'] || 0) * 100 },
  ];


  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />


      <main className="ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Custom Simulation Tool</h1>
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            {simpleMode ? 'Show Advanced Mode' : 'Show Simple Mode'}
          </button>

        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {['1', '3', '6'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-semibold ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
            >
              {tab} Month
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg space-y-6">
         

            {/* Feature Inputs */}
            {Object.entries(featureDefinitions[activeTab])
              .filter(([key]) => simpleMode ? ['UNRATE','CPIFOOD','TB3MS'].includes(key) : true)
              .map(([key, feature]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">{feature.name}</label>
                    <input
                      type="number"
                      value={formValues[key] || feature.default}
                      onChange={e => handleValueChange(key, e.target.value)}
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
                    onChange={e => handleValueChange(key, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg"
                  />
                </div>
              ))}

            <div className="flex space-x-3">
              <button onClick={clearAll} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Reset</button>
              <button onClick={randomizeValues} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Randomize</button>
            </div>

            <button
              onClick={runSimulation}
              disabled={loading}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Simulation...' : 'Run Simulation'}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Recession Probability</h3>
              <RadialChart percentage={prediction ? prediction.prob * 100 : 0} isLoading={loading} />

              {error && <p className="mt-4 text-red-600">{error}</p>}
              {prediction && !loading && (
                <div className="mt-6">
                  <p className="text-xs text-gray-400 mt-2">Updated: {new Date(prediction.timestamp).toLocaleString()}</p>
                  <p className="mt-2 text-gray-700">{prediction.prediction_text}</p>
                </div>
              )}

              {/* Line chart for comparison */}
              <div className="w-full h-48 bg-gray-100 p-4 rounded-lg mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="horizon" stroke="#475569" />
                    <YAxis stroke="#475569" />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Probability"]} />
                    <Line type="monotone" dataKey="prob" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomSimulation;
