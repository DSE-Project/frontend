import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { economicChartsAPI, ECONOMIC_INDICATORS, TIME_PERIODS } from '../../api/economicCharts';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MixedEconomicChart = ({ indicator, data, color, title, unit, currentValue, change, chartType }) => {
  const getChartData = () => {
    if (chartType === 'doughnut') {
      // For doughnut chart, show current value vs historical average
      const avg = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
      return {
        labels: ['Current Value', 'Historical Average'],
        datasets: [{
          data: [currentValue, avg],
          backgroundColor: [color, `${color}50`],
          borderColor: [color, color],
          borderWidth: 2,
          cutout: '70%'
        }]
      };
    }

    // For line and bar charts
    return {
      labels: data.dates.map((date, index) => {
        if (index % Math.max(1, Math.floor(data.dates.length / 10)) === 0) {
          const d = new Date(date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return '';
      }),
      datasets: [{
        label: title,
        data: data.values,
        borderColor: color,
        backgroundColor: chartType === 'bar' ? `${color}80` : `${color}25`,
        borderWidth: 2.5,
        tension: 0.4,
        fill: chartType === 'line',
        pointRadius: 1.5,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    };
  };

  const getChartOptions = () => {
    if (chartType === 'doughnut') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: color,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.parsed.toFixed(2)} ${unit}`;
              }
            }
          }
        }
      };
    }

    // Calculate dynamic Y-axis range based on current data
    const minValue = Math.min(...data.values);
    const maxValue = Math.max(...data.values);
    const range = maxValue - minValue;
    const padding = range * 0.1; // 10% padding
    const yMin = Math.max(0, minValue - padding); // Don't go below 0 for most indicators
    const yMax = maxValue + padding;

    return {
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
            color: 'rgba(0, 0, 0, 0.08)',
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
          min: yMin,
          max: yMax,
          grid: {
            color: 'rgba(0, 0, 0, 0.08)',
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
              return value.toFixed(0);
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
  };

  const renderChart = () => {
    const chartData = getChartData();
    const options = getChartOptions();

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: color }}
          ></div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {currentValue?.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">{unit}</span>
            </div>
          </div>
        </div>
        
        {change && (
          <div className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-semibold shadow-sm ${
            change.percentage > 0 
              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700' 
              : 'bg-gradient-to-r from-red-100 to-red-50 text-red-700'
          }`}>
            <span className="text-lg">
              {change.percentage > 0 ? '📈' : '📉'}
            </span>
            <span>
              {Math.abs(change.percentage).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="h-72 w-full mb-4">
        {renderChart()}
      </div>
      
      {/* Footer with additional info */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span>{data.values.length} points</span>
            </span>
            {chartType === 'doughnut' && (
              <span className="text-xs">
                Avg: {(data.values.reduce((sum, val) => sum + val, 0) / data.values.length).toFixed(1)} {unit}
              </span>
            )}
          </div>
          {change && chartType !== 'doughnut' && (
            <div className="text-right">
              <span className={`text-xs font-medium ${
                change.absolute > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.absolute > 0 ? '+' : ''}{change.absolute.toFixed(2)} {unit}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EconomicIndicatorsMixed = () => {
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

  const formatDataForChart = (indicator, dates) => {
    const maxPoints = 120;
    const sampleRate = Math.max(1, Math.floor(indicator.values.length / maxPoints));
    
    return {
      dates: dates.filter((_, index) => index % sampleRate === 0),
      values: indicator.values.filter((_, index) => index % sampleRate === 0)
    };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8">
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
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

  // Define indicators with specific chart types for visual variety
  const indicatorConfigs = [
    { key: 'gdp', chartType: 'line' },
    { key: 'cpi', chartType: 'bar' },
    { key: 'unemployment_rate', chartType: 'line' },
    { key: 'inflation', chartType: 'bar' },
    { key: 'ppi', chartType: 'bar' },
    { key: 'pce', chartType: 'line' }
  ];

  const validIndicators = indicatorConfigs
    .filter(config => chartData.indicators[config.key]?.values)
    .map(config => ({
      ...config,
      ...chartData.indicators[config.key]
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r rounded-xl shadow-lg p-6 text-black">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center">
              📈 Economic Indicators Dashboard
            </h2>
            <p className="text-gray-600">Real-time visualization of key economic metrics</p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white text-gray-800 border-0 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            >
              <option value={TIME_PERIODS.SIX_MONTHS}>📅 Last 6 Months</option>
              <option value={TIME_PERIODS.TWELVE_MONTHS}>📅 Last 12 Months</option>
              <option value={TIME_PERIODS.TWENTY_FOUR_MONTHS}>📅 Last 24 Months</option>
              <option value={TIME_PERIODS.ALL}>📅 All Available Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Grid - 2 per row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {validIndicators.map((indicator) => {
          const chartDataFormatted = formatDataForChart(indicator, chartData.dates);
          
          return (
            <MixedEconomicChart
              key={indicator.key}
              indicator={indicator.key}
              data={chartDataFormatted}
              color={indicator.color}
              title={indicator.full_name}
              unit={indicator.unit}
              currentValue={indicator.current_value}
              change={indicator.change_from_previous}
              chartType={indicator.chartType}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EconomicIndicatorsMixed;
