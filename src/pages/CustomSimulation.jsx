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
  const [simpleMode, setSimpleMode] = useState(true);
  const { isAuthenticated } = useAuth();

  // Feature definitions with descriptions
  const featureDefinitions = {
    '1': {
      fedfunds: { name: 'Federal Funds Rate', description: 'Interest rate set by Federal Reserve', min: 0, max: 10, default: 4.40 },
      UNRATE: { name: 'Unemployment Rate', description: 'Unemployment rate percentage', min: 2, max: 10, default: 4.0 },
      GDP: { name: 'Gross Domestic Product', description: 'Total economic output', min: 20000, max: 30000, default: 25000 },
      TB3MS: { name: '3-Month Treasury Rate', description: '3-Month Treasury Constant Maturity Rate', min: 0, max: 10, default: 4.22 },
      TB6MS: { name: '6-Month Treasury Rate', description: '6-Month Treasury Constant Maturity Rate', min: 0, max: 10, default: 4.14 },
      TB1YR: { name: '1-Year Treasury Rate', description: '1-Year Treasury Constant Maturity Rate', min: 0, max: 10, default: 4.05 },
      USTPU: { name: 'US Total Private Units', description: 'Total private housing units', min: 20000, max: 40000, default: 30000 },
      USGOOD: { name: 'US Goods Production', description: 'US Goods production index', min: 15000, max: 30000, default: 21670 },
      SRVPRD: { name: 'Services Production', description: 'Services production index', min: 10000, max: 20000, default: 13700 },
      USCONS: { name: 'US Construction', description: 'Construction sector employment', min: 6000, max: 12000, default: 9000 },
      MANEMP: { name: 'Manufacturing Employment', description: 'Manufacturing sector employment', min: 10000, max: 15000, default: 12800 },
      USWTRADE: { name: 'US Wholesale Trade', description: 'Wholesale trade employment', min: 5000, max: 10000, default: 7602 },
      USTRADE: { name: 'US Trade', description: 'Total trade employment', min: 12000, max: 20000, default: 15602 },
      USINFO: { name: 'US Information Sector', description: 'Information sector employment', min: 2500, max: 4000, default: 3200 },
      UNEMPLOY: { name: 'Unemployment Level', description: 'Number of unemployed persons', min: 4000, max: 12000, default: 6600 },
      CPIFOOD: { name: 'CPI Food', description: 'Consumer Price Index for Food', min: 200, max: 400, default: 300 },
      CPIMEDICARE: { name: 'CPI Medicare', description: 'Consumer Price Index for Medicare', min: 400, max: 800, default: 600 },
      CPIRENT: { name: 'CPI Rent', description: 'Consumer Price Index for Rent', min: 1000, max: 2000, default: 1500 },
      CPIAPP: { name: 'CPI Apparel', description: 'Consumer Price Index for Apparel', min: 100, max: 300, default: 200 },
      REALGDP: { name: 'Real GDP', description: 'Inflation-adjusted GDP', min: 18000, max: 25000, default: 21000 },
      PCEPI: { name: 'PCE Price Index', description: 'Personal Consumption Expenditures Price Index', min: 120, max: 160, default: 140 },
      PSAVERT: { name: 'Personal Saving Rate', description: 'Personal saving rate percentage', min: 2, max: 10, default: 5.0 },
      PSTAX: { name: 'Personal Tax', description: 'Personal tax payments', min: 800, max: 1500, default: 1100 },
      COMREAL: { name: 'Commercial Real Estate', description: 'Commercial real estate prices', min: 180000, max: 280000, default: 220000 },
      COMLOAN: { name: 'Commercial Loans', description: 'Commercial loan growth rate', min: -5, max: 5, default: -0.3 },
      SECURITYBANK: { name: 'Security Bank', description: 'Bank security holdings', min: -5, max: 5, default: -2.0 },
      PPIACO: { name: 'Producer Price Index', description: 'Producer Price Index All Commodities', min: 200, max: 350, default: 270 },
      M1SL: { name: 'M1 Money Stock', description: 'M1 money supply', min: 15000, max: 25000, default: 20000 },
      M2SL: { name: 'M2 Money Stock', description: 'M2 money supply', min: 120000, max: 180000, default: 150000 }
    },
    '3': {
      fedfunds: { name: 'Federal Funds Rate', description: 'Interest rate set by Federal Reserve', min: 3, max: 8, default: 5.33 },
      UNRATE: { name: 'Unemployment Rate', description: 'Unemployment rate percentage', min: 2, max: 10, default: 4.0 },
      GDP: { name: 'Gross Domestic Product', description: 'Total economic output', min: 20000, max: 30000, default: 25000 },
      ICSA: { name: 'Initial Claims', description: 'Initial unemployment insurance claims', min: 200000, max: 300000, default: 236700 },
      CPIMEDICARE: { name: 'CPI Medicare', description: 'Consumer Price Index for Medicare', min: 400, max: 700, default: 565.759 },
      USWTRADE: { name: 'US Wholesale Trade', description: 'Wholesale trade employment', min: 5000, max: 8000, default: 6147.9 },
      BBKMLEIX: { name: 'Bank Credit Index', description: 'Bank credit market index', min: 1, max: 2, default: 1.5062454 },
      COMLOAN: { name: 'Commercial Loans', description: 'Commercial loan growth rate', min: 2, max: 8, default: 4.5 },
      UMCSENT: { name: 'Consumer Sentiment', description: 'University of Michigan Consumer Sentiment', min: 50, max: 100, default: 62 },
      MANEMP: { name: 'Manufacturing Employment', description: 'Manufacturing sector employment', min: 10000, max: 15000, default: 12845 },
      PSTAX: { name: 'Personal Tax', description: 'Personal tax payments', min: 2500, max: 4000, default: 3074.386 },
      USCONS: { name: 'US Construction', description: 'Construction sector employment', min: 6000, max: 10000, default: 8221 },
      USGOOD: { name: 'US Goods Production', description: 'US Goods production index', min: 18000, max: 25000, default: 21683 },
      USINFO: { name: 'US Information Sector', description: 'Information sector employment', min: 2500, max: 3500, default: 2960 },
      CPIAPP: { name: 'CPI Apparel', description: 'Consumer Price Index for Apparel', min: 120, max: 150, default: 131.124 },
      CSUSHPISA: { name: 'House Price Index', description: 'Case-Shiller US National Home Price Index', min: 300, max: 350, default: 322.425 },
      SECURITYBANK: { name: 'Security Bank', description: 'Bank security holdings', min: 5, max: 20, default: 10.8 },
      SRVPRD: { name: 'Services Production', description: 'Services production index', min: 130000, max: 150000, default: 136409 },
      INDPRO: { name: 'Industrial Production', description: 'Industrial production index', min: 90, max: 120, default: 102.8692 },
      TB6MS: { name: '6-Month Treasury Rate', description: '6-Month Treasury Constant Maturity Rate', min: 3, max: 7, default: 4.97 },
      UNEMPLOY: { name: 'Unemployment Level', description: 'Number of unemployed persons', min: 5000, max: 10000, default: 7153 },
      USTPU: { name: 'US Total Private Units', description: 'Total private housing units', min: 25000, max: 35000, default: 29000 }
    },
    '6': {
      fedfunds: { name: 'Federal Funds Rate', description: 'Interest rate set by Federal Reserve', min: 3, max: 8, default: 5.33 },
      UNRATE: { name: 'Unemployment Rate', description: 'Unemployment rate percentage', min: 2, max: 10, default: 4.0 },
      GDP: { name: 'Gross Domestic Product', description: 'Total economic output', min: 27000, max: 32000, default: 29502.54 },
      PSTAX: { name: 'Personal Tax', description: 'Personal tax payments', min: 2800, max: 3500, default: 3100.43 },
      USWTRADE: { name: 'US Wholesale Trade', description: 'Wholesale trade employment', min: 5500, max: 7000, default: 6155.9 },
      MANEMP: { name: 'Manufacturing Employment', description: 'Manufacturing sector employment', min: 11000, max: 14000, default: 12843 },
      CPIAPP: { name: 'CPI Apparel', description: 'Consumer Price Index for Apparel', min: 120, max: 150, default: 131.327 },
      CSUSHPISA: { name: 'House Price Index', description: 'Case-Shiller US National Home Price Index', min: 300, max: 350, default: 322.345 },
      ICSA: { name: 'Initial Claims', description: 'Initial unemployment insurance claims', min: 200000, max: 280000, default: 237700 },
      BBKMLEIX: { name: 'Bank Credit Index', description: 'Bank credit market index', min: 1, max: 2, default: 1.49545 },
      TB3MS: { name: '3-Month Treasury Rate', description: '3-Month Treasury Constant Maturity Rate', min: 3, max: 7, default: 5.15 },
      USINFO: { name: 'US Information Sector', description: 'Information sector employment', min: 2500, max: 3500, default: 2916 },
      PPIACO: { name: 'Producer Price Index', description: 'Producer Price Index All Commodities', min: 240, max: 280, default: 258.735 },
      CPIMEDICARE: { name: 'CPI Medicare', description: 'Consumer Price Index for Medicare', min: 500, max: 600, default: 565.857 },
      UNEMPLOY: { name: 'Unemployment Level', description: 'Number of unemployed persons', min: 6000, max: 8500, default: 7209 },
      TB1YR: { name: '1-Year Treasury Rate', description: '1-Year Treasury Constant Maturity Rate', min: 3, max: 6, default: 4.52 },
      USGOOD: { name: 'US Goods Production', description: 'US Goods production index', min: 19000, max: 24000, default: 21682 },
      CPIFOOD: { name: 'CPI Food', description: 'Consumer Price Index for Food', min: 280, max: 330, default: 305.999 },
      UMCSENT: { name: 'Consumer Sentiment', description: 'University of Michigan Consumer Sentiment', min: 55, max: 80, default: 64.9 },
      SRVPRD: { name: 'Services Production', description: 'Services production index', min: 130000, max: 145000, default: 136419 },
      INDPRO: { name: 'Industrial Production', description: 'Industrial production index', min: 95, max: 115, default: 103.55 }
    }
  };

  // State for form values
  const [formValues, setFormValues] = useState({});

  // Initialize form values when tab changes
  useEffect(() => {
    const currentFeatures = featureDefinitions[activeTab];
    const initialValues = {};
    Object.keys(currentFeatures).forEach(key => {
      initialValues[key] = currentFeatures[key].default;
    });
    setFormValues(initialValues);
    setPrediction(null);
    setError('');
  }, [activeTab]);

  const handleValueChange = (feature, value) => {
    setFormValues(prev => ({
      ...prev,
      [feature]: parseFloat(value)
    }));
  };

  const randomizeValues = () => {
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

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className="ml-64 p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Custom Simulation Tool</h1>
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            {simpleMode ? 'Show Advanced Mode' : 'Show Simple Mode'}
          </button>
        </div>
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
                <h2 className="text-xl font-semibold text-gray-800">
                  {simpleMode ? 'Key Economic Indicators' : 'Economic Indicators'}
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={randomizeValues}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    Randomize Values
                  </button>
                </div>
              </div>

              <div className={`space-y-6 ${simpleMode ? '' : 'max-h-96 overflow-y-auto pr-2'}`}>
                {Object.entries(featureDefinitions[activeTab])
                  .filter(([key]) => simpleMode ? ['fedfunds', 'UNRATE', 'GDP'].includes(key) : true)
                  .map(([key, feature]) => (
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

              <button
                onClick={runSimulation}
                disabled={loading}
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
              
              {error && (
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