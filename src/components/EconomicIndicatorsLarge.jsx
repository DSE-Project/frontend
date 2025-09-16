import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LargeEconomicChart = ({ indicator, data, color, title, unit, currentValue, change, chartType = 'line' }) => {
  const chartData = {
    labels: data.dates.map((date, index) => {
      // Show fewer labels to avoid crowding
      if (index % Math.max(1, Math.floor(data.dates.length / 8)) === 0) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return '';
    }),
    datasets: [{
      label: title,
      data: data.values,
      borderColor: color,
      backgroundColor: chartType === 'bar' ? `${color}80` : `${color}20`,
      borderWidth: 2,
      tension: 0.3,
      fill: chartType === 'line',
      pointRadius: 1,
      pointHoverRadius: 5,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937',
        padding: {
          bottom: 10
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
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
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawOnChartArea: true,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          maxTicksLimit: 8
        }
      },
      y: {
        display: true,
        min: Math.max(0, Math.min(...data.values) - (Math.max(...data.values) - Math.min(...data.values)) * 0.1),
        max: Math.max(...data.values) + (Math.max(...data.values) - Math.min(...data.values)) * 0.1,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawOnChartArea: true,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: function(value) {
            if (unit === 'Percentage') {
              return value.toFixed(1) + '%';
            } else if (unit === 'Billions USD' && value >= 1000) {
              return (value / 1000).toFixed(1) + 'T';
            }
            return value.toFixed(1);
          }
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      {/* Header with current value and change */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {currentValue?.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">{unit}</span>
            </div>
          </div>
        </div>
        
        {change && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
            change.percentage > 0 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            <span className="text-lg">
              {change.percentage > 0 ? '↗' : '↘'}
            </span>
            <span>
              {Math.abs(change.percentage).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="h-64 w-full">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
      
      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{data.values.length} data points</span>
          {change && (
            <span>
              Change: {change.absolute > 0 ? '+' : ''}{change.absolute.toFixed(2)} {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const EconomicIndicatorsLarge = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS.TWELVE_MONTHS);
  const [chartType, setChartType] = useState('line');

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

  const formatDataForChart = (indicator, dates) => {
    // Sample data to keep charts smooth but detailed
    const maxPoints = 100;
    const sampleRate = Math.max(1, Math.floor(indicator.values.length / maxPoints));
    
    return {
      dates: dates.filter((_, index) => index % sampleRate === 0),
      values: indicator.values.filter((_, index) => index % sampleRate === 0)
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600 text-lg">Loading economic indicators...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-4">
            📊 Unable to Load Economic Data
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.indicators) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500 text-lg">No data available</div>
      </div>
    );
  }

  // Define the order of indicators for consistent layout
  const indicatorOrder = ['gdp', 'cpi', 'unemployment_rate', 'inflation', 'ppi', 'pce'];
  const orderedIndicators = indicatorOrder.map(key => ({
    key,
    ...chartData.indicators[key]
  })).filter(ind => ind.values);

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0 flex items-center">
            📈 Economic Indicators Dashboard
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Time Period Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={TIME_PERIODS.SIX_MONTHS}>6 Months</option>
                <option value={TIME_PERIODS.TWELVE_MONTHS}>12 Months</option>
                <option value={TIME_PERIODS.TWENTY_FOUR_MONTHS}>24 Months</option>
                <option value={TIME_PERIODS.ALL}>All Data</option>
              </select>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">Type:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid - 2 per row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orderedIndicators.map((indicator) => {
          const chartDataFormatted = formatDataForChart(indicator, chartData.dates);
          
          return (
            <LargeEconomicChart
              key={indicator.key}
              indicator={indicator.key}
              data={chartDataFormatted}
              color={indicator.color}
              title={indicator.full_name}
              unit={indicator.unit}
              currentValue={indicator.current_value}
              change={indicator.change_from_previous}
              chartType={chartType}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EconomicIndicatorsLarge;
