import React, { useState, useEffect } from 'react';


const API_URL = import.meta.env.VITE_API_BASE_URL;

const ModelPrediction = ({ monthsAhead }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hardcodedData = {
    "current_month_data": {
      "observation_date": "1/2/2025",
      "fedfunds": 4.40,
      "TB3MS": 4.22,
      "TB6MS": 4.14,
      "TB1YR": 4.05,
      "USTPU": 30000,
      "USGOOD": 21670,
      "SRVPRD": 13700,
      "USCONS": 9000,
      "MANEMP": 12800,
      "USWTRADE": 7602,
      "USTRADE": 15602,
      "USINFO": 3200,
      "UNRATE": 4.0,
      "UNEMPLOY": 6600,
      "CPIFOOD": 300,
      "CPIMEDICARE": 600,
      "CPIRENT": 1500,
      "CPIAPP": 200,
      "GDP": 25000,
      "REALGDP": 21000,
      "PCEPI": 140,
      "PSAVERT": 5.0,
      "PSTAX": 1100,
      "COMREAL": 220000,
      "COMLOAN": -0.3,
      "SECURITYBANK": -2.0,
      "PPIACO": 270,
      "M1SL": 20000,
      "M2SL": 150000,
      "recession": 0
    },
    "use_historical_data": true,
    "historical_data_source": "csv"
  };

  const getTargetDate = () => {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setMonth(currentDate.getMonth() + parseInt(monthsAhead));
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  };

  const fetchPrediction1m = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/forecast/predict/1m`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hardcodedData),
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
  };

  const fetchPrediction3m = async () => {
    // TODO: Implement 3m prediction
    setError('3-month prediction not implemented yet');
  };

  const fetchPrediction6m = async () => {
    // TODO: Implement 6m prediction
    setError('6-month prediction not implemented yet');
  };

  useEffect(() => {
    switch (monthsAhead) {
      case '1':
        fetchPrediction1m();
        break;
      case '3':
        fetchPrediction3m();
        break;
      case '6':
        fetchPrediction6m();
        break;
      default:
        setError('Invalid months ahead value');
    }
  }, [monthsAhead]);

  const getMonthText = () => {
    return monthsAhead === '1' ? 'month' : 'months';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Recession Probability in {monthsAhead} {getMonthText()}: {getTargetDate()}
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
              {(prediction.prob_1m * 100).toFixed(2)}%
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
            Model: {prediction.model_version} | Updated: {new Date(prediction.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPrediction;