import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { economicChartsAPI, ECONOMIC_INDICATORS, TIME_PERIODS } from '../api/economicCharts';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EconomicIndicatorMiniChart = ({ indicator, data, color, title, unit, currentValue, change }) => {
  const chartData = {
    labels: data.dates,
    datasets: [{
      data: data.values,
      borderColor: color,
      backgroundColor: `${color}15`,
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            const date = new Date(data.dates[context[0].dataIndex]);
            return date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          },
          label: function(context) {
            return `${title}: ${context.parsed.y.toFixed(2)} ${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {currentValue?.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        ></div>
      </div>
      
      {change && (
        <div className={`text-xs font-medium mb-2 ${
          change.percentage > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="mr-1">
            {change.percentage > 0 ? '↗' : '↘'}
          </span>
          {Math.abs(change.percentage).toFixed(1)}% 
          <span className="text-gray-500 ml-1">
            ({change.absolute > 0 ? '+' : ''}{change.absolute.toFixed(2)})
          </span>
        </div>
      )}
      
      <div className="h-20 w-full">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="mt-2 text-xs text-gray-400 text-center">
        {data.values.length} data points
      </div>
    </div>
  );
};

const EconomicIndicatorsGrid = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS.TWELVE_MONTHS);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await economicChartsAPI.getHistoricalData(selectedPeriod);

      if (response.success) {
        setChartData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch chart data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching economic charts data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDataForMiniChart = (indicator, dates) => {
    // Sample data every nth point to keep charts readable but show trend
    const sampleRate = Math.max(1, Math.floor(indicator.values.length / 100));
    
    return {
      dates: dates.filter((_, index) => index % sampleRate === 0),
      values: indicator.values.filter((_, index) => index % sampleRate === 0)
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading economic indicators...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 font-semibold mb-2">
            📊 Unable to Load Economic Data
          </div>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.indicators) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 sm:mb-0">
            📈 Economic Indicators
          </h2>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={TIME_PERIODS.SIX_MONTHS}>6 Months</option>
              <option value={TIME_PERIODS.TWELVE_MONTHS}>12 Months</option>
              <option value={TIME_PERIODS.TWENTY_FOUR_MONTHS}>24 Months</option>
              <option value={TIME_PERIODS.ALL}>All Data</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(chartData.indicators).map(([key, indicator]) => {
            const miniChartData = formatDataForMiniChart(indicator, chartData.dates);
            
            return (
              <EconomicIndicatorMiniChart
                key={key}
                indicator={key}
                data={miniChartData}
                color={indicator.color}
                title={indicator.full_name}
                unit={indicator.unit}
                currentValue={indicator.current_value}
                change={indicator.change_from_previous}
              />
            );
          })}
        </div>

        {/* Summary Info */}
        {chartData.metadata && (
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            <div className="flex flex-wrap gap-4 justify-center">
              <span>
                <strong>Period:</strong> {new Date(chartData.metadata.start_date).toLocaleDateString()} - {new Date(chartData.metadata.end_date).toLocaleDateString()}
              </span>
              <span>
                <strong>Total Data Points:</strong> {chartData.metadata.total_points}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomicIndicatorsGrid;
