import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Mock SHAP data for development
const mockShapData = {
  '1': {
    timestamp: new Date().toISOString(),
    horizon: '1m',
    baseline_probability: 0.15,
    current_probability: 0.23,
    top_features: [
      {
        feature: 'UNRATE',
        feature_name: 'Unemployment Rate',
        shap_value: 0.08,
        contribution: 'positive',
        current_value: 4.2,
        delta: 0.3,
        last_month_value: 3.9
      },
      {
        feature: 'TB3MS',
        feature_name: '3-Month Treasury',
        shap_value: -0.04,
        contribution: 'negative',
        current_value: 5.25,
        delta: -0.15,
        last_month_value: 5.40
      },
      {
        feature: 'fedfunds',
        feature_name: 'Federal Funds Rate',
        shap_value: 0.06,
        contribution: 'positive',
        current_value: 5.50,
        delta: 0.25,
        last_month_value: 5.25
      },
      {
        feature: 'UMCSENT',
        feature_name: 'Consumer Sentiment',
        shap_value: -0.02,
        contribution: 'negative',
        current_value: 68.5,
        delta: -2.8,
        last_month_value: 71.3
      },
      {
        feature: 'CPIFOOD',
        feature_name: 'CPI Food',
        shap_value: 0.03,
        contribution: 'positive',
        current_value: 314.2,
        delta: 1.2,
        last_month_value: 313.0
      }
    ]
  },
  '3': {
    timestamp: new Date().toISOString(),
    horizon: '3m',
    baseline_probability: 0.18,
    current_probability: 0.26,
    top_features: [
      {
        feature: 'TB1YR',
        feature_name: '1-Year Treasury',
        shap_value: 0.09,
        contribution: 'positive',
        current_value: 5.15,
        delta: 0.20,
        last_month_value: 4.95
      },
      {
        feature: 'REALGDP',
        feature_name: 'Real GDP',
        shap_value: -0.05,
        contribution: 'negative',
        current_value: 22547,
        delta: 125,
        last_month_value: 22422
      },
      {
        feature: 'UNRATE',
        feature_name: 'Unemployment Rate',
        shap_value: 0.07,
        contribution: 'positive',
        current_value: 4.2,
        delta: 0.3,
        last_month_value: 3.9
      },
      {
        feature: 'CSUSHPISA',
        feature_name: 'Case-Shiller Home Price',
        shap_value: 0.04,
        contribution: 'positive',
        current_value: 312.5,
        delta: -1.8,
        last_month_value: 314.3
      },
      {
        feature: 'INDPRO',
        feature_name: 'Industrial Production',
        shap_value: -0.03,
        contribution: 'negative',
        current_value: 103.2,
        delta: -0.5,
        last_month_value: 103.7
      }
    ]
  },
  '6': {
    timestamp: new Date().toISOString(),
    horizon: '6m',
    baseline_probability: 0.22,
    current_probability: 0.31,
    top_features: [
      {
        feature: 'TB6MS',
        feature_name: '6-Month Treasury',
        shap_value: 0.12,
        contribution: 'positive',
        current_value: 5.35,
        delta: 0.35,
        last_month_value: 5.00
      },
      {
        feature: 'PSAVERT',
        feature_name: 'Personal Saving Rate',
        shap_value: -0.06,
        contribution: 'negative',
        current_value: 4.8,
        delta: 0.2,
        last_month_value: 4.6
      },
      {
        feature: 'M2SL',
        feature_name: 'M2 Money Supply',
        shap_value: 0.08,
        contribution: 'positive',
        current_value: 20945,
        delta: -125,
        last_month_value: 21070
      },
      {
        feature: 'MANEMP',
        feature_name: 'Manufacturing Employment',
        shap_value: -0.04,
        contribution: 'negative',
        current_value: 12950,
        delta: -15,
        last_month_value: 12965
      },
      {
        feature: 'PCEPI',
        feature_name: 'PCE Price Index',
        shap_value: 0.05,
        contribution: 'positive',
        current_value: 121.8,
        delta: 0.6,
        last_month_value: 121.2
      }
    ]
  }
};

const TopDrivers = ({ monthsAhead }) => {
  const [shapData, setShapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Feature name mapping for better display
  const featureNames = {
    'fedfunds': 'Federal Funds Rate',
    'TB3MS': '3-Month Treasury',
    'TB6MS': '6-Month Treasury',
    'TB1YR': '1-Year Treasury',
    'USTPU': 'US Total Private Employment',
    'USGOOD': 'US Goods Employment',
    'SRVPRD': 'Service Employment',
    'USCONS': 'US Construction Employment',
    'MANEMP': 'Manufacturing Employment',
    'USWTRADE': 'US Wholesale Trade',
    'USTRADE': 'US Trade Employment',
    'USINFO': 'US Information Employment',
    'UNRATE': 'Unemployment Rate',
    'UNEMPLOY': 'Unemployment Level',
    'CPIFOOD': 'CPI Food',
    'CPIMEDICARE': 'CPI Medical Care',
    'CPIRENT': 'CPI Rent',
    'CPIAPP': 'CPI Apparel',
    'GDP': 'Gross Domestic Product',
    'REALGDP': 'Real GDP',
    'PCEPI': 'PCE Price Index',
    'PSAVERT': 'Personal Saving Rate',
    'PSTAX': 'Personal Tax Receipts',
    'COMREAL': 'Commercial Real Estate',
    'COMLOAN': 'Commercial Loans',
    'SECURITYBANK': 'Bank Securities',
    'PPIACO': 'Producer Price Index',
    'M1SL': 'M1 Money Supply',
    'M2SL': 'M2 Money Supply',
    'ICSA': 'Initial Claims',
    'BBKMLEIX': 'Bank Lending Index',
    'UMCSENT': 'Consumer Sentiment',
    'CSUSHPISA': 'Case-Shiller Home Price',
    'INDPRO': 'Industrial Production'
  };


  const getTargetDate = () => {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setMonth(currentDate.getMonth() + parseInt(monthsAhead));
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  };

  const fetchShapData = async () => {
    setLoading(true);
    setError('');
    try {
      // Try real API call to backend first
      if (API_URL) {
        const response = await fetch(`${API_URL}/shap/explain/${monthsAhead}m`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API SHAP data received:', data);
          setShapData(data);
          return;
        }
      }
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      console.log('Using mock SHAP data for monthsAhead:', monthsAhead);
      console.log('Mock data:', mockShapData[monthsAhead]);
      // setShapData(mockShapData[monthsAhead]);
      
    } catch (err) {
      console.warn('API unavailable, using mock data:', err);
      console.log('Fallback mock data:', mockShapData[monthsAhead]);
      // Fallback to mock data on error
      // setShapData(mockShapData[monthsAhead]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (monthsAhead && ['1', '3', '6'].includes(monthsAhead)) {
      fetchShapData();
    } else {
      setError('Invalid months ahead value');
    }
  }, [monthsAhead]);

  useEffect(() => {
    console.log('shapData updated:', shapData);
    if (shapData) {
      console.log('shapData.top_features:', shapData.top_features);
      console.log('Is array?', Array.isArray(shapData.top_features));
    }
  }, [shapData]);

  const formatValue = (value, feature) => {
    if (typeof value === 'number') {
      if (value > 1000) {
        return value.toLocaleString();
      }
      return value.toFixed(2);
    }
    return value;
  };

  const formatDelta = (delta, feature) => {
    if (typeof delta === 'number') {
      const sign = delta >= 0 ? '+' : '';
      if (Math.abs(delta) > 1000) {
        return `${sign}${delta.toLocaleString()}`;
      }
      return `${sign}${delta.toFixed(2)}`;
    }
    return delta;
  };

  const getMonthText = () => {
    return monthsAhead === '1' ? 'month' : 'months';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Top Drivers - {monthsAhead} {getMonthText()}: {getTargetDate()}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        What moved today's forecast? (SHAP feature importance)
      </p>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading explanations...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {shapData && !loading && shapData.top_features && Array.isArray(shapData.top_features) && (
        <div className="space-y-3">
          {shapData.top_features.map((feature, index) => (
            <div 
              key={feature.feature} 
              className="border-l-4 pl-4 py-2 rounded-r-lg bg-gray-50"
              style={{
                borderLeftColor: feature.contribution === 'positive' ? '#EF4444' : '#22C55E'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {featureNames[feature.feature] || feature.feature}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Current: {formatValue(feature.current_value, feature.feature)}
                    <span className={`ml-2 font-medium ${
                      feature.delta >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ({formatDelta(feature.delta, feature.feature)} vs last month)
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-sm font-bold ${
                    feature.contribution === 'positive' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {feature.contribution === 'positive' ? '+' : ''}{(feature.shap_value * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {feature.contribution === 'positive' ? 'Increases' : 'Decreases'} risk
                  </div>
                </div>
              </div>
              
              {/* SHAP value bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    feature.contribution === 'positive' ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(Math.abs(feature.shap_value) * 1000, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
          
          <div className="text-xs text-gray-400 text-center mt-4 pt-3 border-t">
            SHAP explanations updated: {new Date(shapData.timestamp).toLocaleString()}
          </div>
        </div>
      )}
      
      {shapData && !loading && (!shapData.top_features || !Array.isArray(shapData.top_features)) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 text-sm">
            Unexpected data format received. Please check the API response structure.
          </p>
        </div>
      )}
    </div>
  );
};

export default TopDrivers;
