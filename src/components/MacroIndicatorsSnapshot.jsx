import React, { useState, useEffect } from 'react';
import { macroIndicatorsAPI } from '../api/macroIndicators';

const MacroIndicatorTile = ({ indicator, title, symbol }) => {
  if (!indicator) return null;

  const isPositive = indicator.change_value > 0;
  const isNegative = indicator.change_value < 0;
  
  const formatValue = (value, unit) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'Index') {
      return value.toFixed(1);
    }
    return value.toFixed(2);
  };

  const formatChange = (changeValue, changePercent, unit) => {
    const sign = changeValue > 0 ? '+' : '';
    const valueStr = unit === '%' ? `${sign}${changeValue.toFixed(2)}pp` : `${sign}${changeValue.toFixed(2)}`;
    const percentStr = `${sign}${changePercent.toFixed(1)}%`;
    return `${valueStr} (${percentStr})`;
  };

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          <p className="text-xs text-gray-500">{symbol}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(indicator.current_value, indicator.unit)}
          </div>
          <div className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 
            isNegative ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            <span className="inline-flex items-center">
              {isPositive && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {isNegative && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {formatChange(indicator.change_value, indicator.change_percent, indicator.unit)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Last updated: {formatLastUpdated(indicator.last_updated)}
      </div>
    </div>
  );
};

const MacroIndicatorsSnapshot = () => {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await macroIndicatorsAPI.getMacroIndicators();
      
      if (response.success) {
        setIndicators(response.data.indicators);
        setLastRefreshed(new Date().toLocaleString());
      } else {
        throw new Error(response.message || 'Failed to fetch indicators');
      }
    } catch (err) {
      console.error('Error fetching macro indicators:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchIndicators, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !indicators) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Key Macroeconomic Snapshot</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Key Macroeconomic Snapshot</h2>
          <button
            onClick={fetchIndicators}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
        <div className="text-center text-red-600 py-8">
          <p>Error loading indicators: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Key Macroeconomic Snapshot</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last refreshed: {lastRefreshed}
          </span>
          <button
            onClick={fetchIndicators}
            disabled={loading}
            className={`px-3 py-1 text-sm rounded ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MacroIndicatorTile
          indicator={indicators?.unemployment_rate}
          title="Unemployment Rate"
          symbol="UNRATE"
        />
        <MacroIndicatorTile
          indicator={indicators?.cpi_inflation}
          title="CPI Inflation (YoY)"
          symbol="CPI"
        />
        <MacroIndicatorTile
          indicator={indicators?.yield_spread_10y_2y}
          title="10Y-2Y Yield Spread"
          symbol="T10Y2Y"
        />
        <MacroIndicatorTile
          indicator={indicators?.fed_funds_rate}
          title="Fed Funds Rate"
          symbol="FEDFUNDS"
        />
        <MacroIndicatorTile
          indicator={indicators?.ism_pmi}
          title="ISM Manufacturing PMI"
          symbol="PMI"
        />
        <MacroIndicatorTile
          indicator={indicators?.consumer_confidence}
          title="Consumer Sentiment"
          symbol="UMCSENT"
        />
      </div>
      
      <div className="mt-4 text-xs text-gray-400 border-t pt-3">
        Data sources: Federal Reserve Economic Data (FRED), Bureau of Labor Statistics, Conference Board
      </div>
    </div>
  );
};

export default MacroIndicatorsSnapshot;
