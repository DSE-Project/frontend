import React, { useState, useEffect } from 'react';


const API_URL = import.meta.env.VITE_API_BASE_URL;

const ModelPrediction = ({ monthsAhead }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hardcodedData_3m = {
    "current_month_data": {
      "observation_date": "1/8/2024",
      "ICSA": 236700,
      "CPIMEDICARE":565.759,
      "USWTRADE": 6147.9,
      "BBKMLEIX" : 1.5062454,
      "COMLOAN" :4.5,
      "UMCSENT" :62,
      "MANEMP" : 12845,
      "fedfunds" :5.33,
      "PSTAX" :3074.386,
      "USCONS" :8221,
      "USGOOD" :21683,
      "USINFO" :2960,
      "CPIAPP": 131.124,
      "CSUSHPISA" : 322.425,
      "SECURITYBANK" : 10.8,
      "SRVPRD":136409,
      "INDPRO" :102.8692,
      "TB6MS" :4.97,
      "UNEMPLOY" :7153,
      "USTPU" :29000,
      "recession": 0
    },
    "use_historical_data": true,
    "historical_data_source":"csv"
  };

  const hardcodedData_6m = {
    "current_month_data": {
      "observation_date": "1/8/2024",
      "PSTAX":3100.43,
      "USWTRADE": 6155.9,
      "MANEMP":12843,
      "CPIAPP":131.327,
      "CSUSHPISA":322.345,
      "ICSA" : 237700,
      "fedfunds":5.33,
      "BBKMLEIX" : 1.49545,
      "TB3MS":5.15,
      "USINFO":2916,
      "PPIACO" : 258.735,
      "CPIMEDICARE": 565.857,
      "UNEMPLOY": 7209,
      "TB1YR": 4.52,
      "USGOOD":21682,
      "CPIFOOD": 305.999,
      "UMCSENT" : 64.9,
      "SRVPRD": 136419,
      "GDP":29502.54 ,
      "INDPRO" : 103.55,
      "recession" :0
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
  };

  const fetchPrediction3m = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/forecast/predict/3m`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hardcodedData_3m),
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

  const fetchPrediction6m = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/forecast/predict/6m`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hardcodedData_6m),
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

  const getPrediction = () => {
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
  }


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
              {getPrediction()}%
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
            {/* Model: {prediction.model_version} | Updated: {new Date(prediction.timestamp).toLocaleString()} */}
            Updated: {new Date(prediction.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPrediction;