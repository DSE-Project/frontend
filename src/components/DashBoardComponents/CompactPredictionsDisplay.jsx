import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CompactPredictionsDisplay = () => {
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllPredictions();
  }, []);

  const fetchAllPredictions = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all predictions using individual GET endpoints
      const [response1m, response3m, response6m] = await Promise.all([
        fetch(`${API_URL}/forecast/predict/1m`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_URL}/forecast/predict/3m`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_URL}/forecast/predict/6m`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!response1m.ok || !response3m.ok || !response6m.ok) {
        throw new Error(`HTTP error! 1m: ${response1m.status}, 3m: ${response3m.status}, 6m: ${response6m.status}`);
      }

      const [data1m, data3m, data6m] = await Promise.all([
        response1m.json(),
        response3m.json(),
        response6m.json()
      ]);

      // Structure the data to match the expected format
      setPredictions({
        '1m_prediction': data1m,
        '3m_prediction': data3m,
        '6m_prediction': data6m
      });
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err.message || 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (probability) => {
    if (probability >= 70) return { level: 'Very High', color: 'bg-red-600', textColor: 'text-red-600' };
    if (probability >= 50) return { level: 'High', color: 'bg-red-500', textColor: 'text-red-500' };
    if (probability >= 30) return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (probability >= 15) return { level: 'Low', color: 'bg-green-500', textColor: 'text-green-600' };
    return { level: 'Very Low', color: 'bg-green-600', textColor: 'text-green-600' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Recession Predictions</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading predictions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Recession Predictions</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Current Recession Predictions</h3>
        <span className="text-xs text-gray-500">
          Last updated: {predictions['1m_prediction']?.timestamp ? 
            formatDate(predictions['1m_prediction'].timestamp) : 'N/A'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1-Month Prediction */}
        {predictions['1m_prediction'] && (
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">1-Month</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevel(predictions['1m_prediction'].prob_1m * 100).color} text-white`}>
                {getRiskLevel(predictions['1m_prediction'].prob_1m * 100).level}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(predictions['1m_prediction'].prob_1m * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getRiskLevel(predictions['1m_prediction'].prob_1m * 100).color}`}
                style={{ width: `${predictions['1m_prediction'].prob_1m * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 3-Month Prediction */}
        {predictions['3m_prediction'] && (
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">3-Month</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevel(predictions['3m_prediction'].prob_3m * 100).color} text-white`}>
                {getRiskLevel(predictions['3m_prediction'].prob_3m * 100).level}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(predictions['3m_prediction'].prob_3m * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getRiskLevel(predictions['3m_prediction'].prob_3m * 100).color}`}
                style={{ width: `${predictions['3m_prediction'].prob_3m * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 6-Month Prediction */}
        {predictions['6m_prediction'] && (
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">6-Month</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevel(predictions['6m_prediction'].prob_6m * 100).color} text-white`}>
                {getRiskLevel(predictions['6m_prediction'].prob_6m * 100).level}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {(predictions['6m_prediction'].prob_6m * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getRiskLevel(predictions['6m_prediction'].prob_6m * 100).color}`}
                style={{ width: `${predictions['6m_prediction'].prob_6m * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactPredictionsDisplay;