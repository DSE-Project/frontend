import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ModelExplanation = ({ monthsAhead }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('shap'); // 'shap' or 'eli5'

  useEffect(() => {
    fetchExplanation();
  }, [monthsAhead]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/forecast/explain/${monthsAhead}`, {
        
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExplanation(data);
    } catch (err) {
      setError('Failed to fetch explanation. Please try again.');
      console.error('Error fetching explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureName = (feature) => {
    // Map technical feature names to readable names
    const featureMap = {
      'fedfunds': 'Federal Funds Rate',
      'TB3MS': '3-Month Treasury Rate',
      'TB6MS': '6-Month Treasury Rate',
      'TB1YR': '1-Year Treasury Rate',
      'UNRATE': 'Unemployment Rate',
      'UNEMPLOY': 'Unemployment Level',
      'GDP': 'Gross Domestic Product',
      'REALGDP': 'Real GDP',
      'CPIFOOD': 'CPI Food',
      'CPIRENT': 'CPI Rent',
      'M1SL': 'M1 Money Stock',
      'M2SL': 'M2 Money Stock',
      'PCEPI': 'PCE Price Index',
      'PSAVERT': 'Personal Saving Rate',
      'fedfunds_trend': 'Fed Funds Trend',
      'UNRATE_trend': 'Unemployment Trend',
      'SECURITYBANK': 'Bank Security Holdings',
      'COMLOAN': 'Commercial Loans'
    };
    return featureMap[feature] || feature;
  };

  const formatImportance = (value) => {
    return (value * 100).toFixed(2);
  };

  const getSHAPChartData = () => {
    if (!explanation?.shap_explanation?.shap_values) return [];
    
    // Scale SHAP values to make them more visible
    const shapData = explanation.shap_explanation.shap_values.map(item => ({
      name: getFeatureName(item.feature),
      importance: item.importance,
      fullName: item.feature,
      scaledImportance: Math.abs(item.importance) * 1000 // Scale up for visibility
    }));
    
    // Sort by absolute importance to show most impactful first
    return shapData.sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
  };

  const getELI5ChartData = () => {
    if (!explanation?.eli5_explanation?.feature_importance) return [];
    
    return explanation.eli5_explanation.feature_importance.map(item => ({
      name: getFeatureName(item.feature),
      importance: item.importance,
      fullName: item.feature
    })).sort((a, b) => b.importance - a.importance); // Sort by importance
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">Impact: {formatImportance(payload[0].value)}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomSHAPTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            SHAP Value: {data.importance.toFixed(6)}
          </p>
          <p className="text-xs text-gray-500">
            {data.importance >= 0 ? '↑ Increases' : '↓ Decreases'} recession probability
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index) => {
    // Gradient from blue to light blue
    const colors = [
      '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
      '#bfdbfe', '#dbeafe', '#eff6ff', '#f0f9ff', '#f8fafc'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Model Explanation - {monthsAhead === '1' ? '1 Month' : monthsAhead === '3' ? '3 Months' : '6 Months'}
        </h3>
        <p className="text-sm text-gray-600">
          Understanding what drives the recession probability prediction
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('shap')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'shap'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          SHAP Values
        </button>
        <button
          onClick={() => setActiveTab('eli5')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'eli5'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Feature Importance
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading explanation...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {explanation && !loading && (
        <div className="space-y-4">
          {/* SHAP Tab */}
          {activeTab === 'shap' && (
            <div>
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">SHAP Feature Impact</h4>
                <p className="text-xs text-gray-500">
                  Shows how much each feature contributes to pushing the prediction higher or lower
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSHAPChartData()} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => (value / 1000).toFixed(3)}
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 11 }} 
                    width={130}
                  />
                  <Tooltip content={<CustomSHAPTooltip />} />
                  <Bar 
                    dataKey="scaledImportance" 
                    radius={[0, 4, 4, 0]}
                    minPointSize={2}
                  >
                    {getSHAPChartData().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.importance >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ELI5 Tab */}
          {activeTab === 'eli5' && (
            <div>
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Permutation Feature Importance</h4>
                <p className="text-xs text-gray-500">
                  Shows how much the prediction changes when each feature is shuffled
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getELI5ChartData()} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }}
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 11 }} 
                    width={130}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="importance" 
                    radius={[0, 4, 4, 0]}
                    minPointSize={2}
                  >
                    {getELI5ChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Top 3 Features List */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Top 3 Drivers</h5>
                <div className="space-y-2">
                  {getELI5ChartData().slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mr-2">
                          {idx + 1}
                        </span>
                        {item.name}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatImportance(item.importance)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>Model: {explanation.model_version}</p>
              <p>Method: {explanation.explanation_method}</p>
              <p>
                Total Features Analyzed: {
                  activeTab === 'shap' 
                    ? explanation.shap_explanation?.feature_count 
                    : explanation.eli5_explanation?.total_features
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelExplanation;