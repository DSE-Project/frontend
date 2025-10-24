import React, { useState, useEffect, useMemo, useCallback } from 'react';


const API_URL = import.meta.env.VITE_API_BASE_URL;

const ModelPrediction = ({ monthsAhead, onResult }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Memoize the API endpoint
  const apiEndpoint = useMemo(() => `${API_URL}/forecast/predict/${monthsAhead}m`, [monthsAhead]);

  // Memoize target date calculation
  const getTargetDate = useMemo(() => {
    if (!prediction || !prediction.input_date) {
      return ''; // Return blank if no prediction data or input_date
    }
    
    const currentDate = new Date(prediction.input_date);
    const targetDate = new Date(currentDate);
    targetDate.setMonth(currentDate.getMonth() + parseInt(monthsAhead));
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  }, [prediction, monthsAhead]);

  // Consolidate fetch functions into one with memoization
  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to fetch prediction. Please try again.');
      console.error('Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  // Fetch prediction on mount or when monthsAhead changes
  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  // Memoize month text
  const monthText = useMemo(() => {
    return monthsAhead === '1' ? 'month' : 'months';
  }, [monthsAhead]);

  // Memoize prediction value
  const predictionValue = useMemo(() => {
    if (!prediction) return null;
    
    switch (monthsAhead) {
      case '1':
        return (prediction.prob_1m * 100).toFixed(2);
      case '3':
        return (prediction.prob_3m * 100).toFixed(2);
      case '6':
        return (prediction.prob_6m * 100).toFixed(2);
      default:
        return null;
    }
  }, [prediction, monthsAhead]);

  // Handle onResult callback - only call once when prediction is first loaded
  useEffect(() => {
    if (prediction && !loading && predictionValue && onResult) {
      onResult(monthsAhead, predictionValue, getTargetDate, prediction);
    }
    // Only run when prediction changes (when data is first loaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction]);


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Recession Probability in {monthsAhead} {monthText}{getTargetDate ? `: ${getTargetDate}` : ''}
      </h3>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading prediction...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {prediction && !loading && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {predictionValue}%
            </div>
            <div className="text-sm text-gray-500">Recession Probability</div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                prediction.confidence_interval.binary_prediction === 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {prediction.confidence_interval.prediction_text}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            Updated: {new Date(prediction.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

// Use React.memo with custom comparison function
export default React.memo(ModelPrediction, (prevProps, nextProps) => {
  // Only re-render if monthsAhead or onResult changes
  return prevProps.monthsAhead === nextProps.monthsAhead && 
         prevProps.onResult === nextProps.onResult;
});