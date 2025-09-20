import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  Filler,
  ArcElement
} from 'chart.js';
import { economicChartsAPI, ECONOMIC_INDICATORS, TIME_PERIODS } from '../../api/economicCharts';

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
  Filler,
  ArcElement
);

const EconomicChartsWidget = () => {
  const [chartData, setChartData] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS.TWELVE_MONTHS);
  const [chartType, setChartType] = useState('line');
  const [selectedIndicators, setSelectedIndicators] = useState(Object.values(ECONOMIC_INDICATORS));

  useEffect(() => {
    fetchData();
  }, [selectedPeriod, selectedIndicators]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [chartsResponse, statsResponse] = await Promise.all([
        economicChartsAPI.getHistoricalData(selectedPeriod, selectedIndicators),
        economicChartsAPI.getSummaryStats()
      ]);

      if (chartsResponse.success) {
        setChartData(chartsResponse.data);
      } else {
        throw new Error(chartsResponse.message || 'Failed to fetch chart data');
      }

      if (statsResponse.success) {
        setSummaryStats(statsResponse.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching economic charts data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data, type = 'line') => {
    if (!data || !data.indicators) return null;

    const datasets = Object.entries(data.indicators).map(([key, indicator]) => {
      const baseConfig = {
        label: indicator.full_name,
        data: indicator.values,
        borderColor: indicator.color,
        backgroundColor: type === 'line' 
          ? `${indicator.color}20` 
          : indicator.color,
        borderWidth: 2,
        tension: 0.1,
      };

      if (type === 'line') {
        baseConfig.fill = false;
        baseConfig.pointRadius = 3;
        baseConfig.pointHoverRadius = 6;
      }

      return baseConfig;
    });

    return {
      labels: data.dates.map(date => new Date(date).toLocaleDateString()),
      datasets
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: 'Economic Indicators Historical Data',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const indicator = Object.values(chartData?.indicators || {})[context.datasetIndex];
            const value = context.parsed.y;
            const unit = indicator?.unit || '';
            return `${context.dataset.label}: ${value.toFixed(2)} ${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const handleIndicatorToggle = (indicator) => {
    setSelectedIndicators(prev => 
      prev.includes(indicator)
        ? prev.filter(ind => ind !== indicator)
        : [...prev, indicator]
    );
  };

  const renderIndicatorCards = () => {
    if (!chartData?.indicators) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(chartData.indicators).map(([key, indicator]) => (
          <div key={key} className="bg-white rounded-lg shadow-md p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{indicator.name}</h3>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: indicator.color }}
              ></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {indicator.current_value?.toFixed(2)} {indicator.unit}
            </p>
            {indicator.change_from_previous && (
              <p className={`text-sm ${
                indicator.change_from_previous.percentage > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {indicator.change_from_previous.percentage > 0 ? '↗' : '↘'} 
                {Math.abs(indicator.change_from_previous.percentage).toFixed(1)}% 
                ({indicator.change_from_previous.absolute > 0 ? '+' : ''}{indicator.change_from_previous.absolute.toFixed(2)})
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Trend: <span className="capitalize">{indicator.trend}</span>
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderCorrelationMatrix = () => {
    if (!summaryStats?.correlation_matrix) return null;

    const matrix = summaryStats.correlation_matrix;
    const indicators = Object.keys(matrix);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Correlation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50"></th>
                {indicators.map(ind => (
                  <th key={ind} className="border p-2 bg-gray-50 text-sm font-medium">
                    {ind.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {indicators.map(rowInd => (
                <tr key={rowInd}>
                  <td className="border p-2 bg-gray-50 font-medium text-sm">
                    {rowInd.toUpperCase()}
                  </td>
                  {indicators.map(colInd => {
                    const value = matrix[rowInd][colInd];
                    const intensity = Math.abs(value);
                    const bgColor = value > 0 
                      ? `rgba(34, 197, 94, ${intensity})` 
                      : `rgba(239, 68, 68, ${intensity})`;
                    
                    return (
                      <td 
                        key={colInd} 
                        className="border p-2 text-center text-sm"
                        style={{ backgroundColor: bgColor }}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading economic data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formattedData = formatChartData(chartData, chartType);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">
            📊 Economic Indicators Dashboard
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Time Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value={TIME_PERIODS.SIX_MONTHS}>Last 6 Months</option>
              <option value={TIME_PERIODS.TWELVE_MONTHS}>Last 12 Months</option>
              <option value={TIME_PERIODS.TWENTY_FOUR_MONTHS}>Last 24 Months</option>
              <option value={TIME_PERIODS.ALL}>All Data</option>
            </select>

            {/* Chart Type Selector */}
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>

        {/* Indicator Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Indicators:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ECONOMIC_INDICATORS).map(([name, key]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIndicators.includes(key)}
                  onChange={() => handleIndicatorToggle(key)}
                  className="mr-2"
                />
                <span className="text-sm">{name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Indicator Cards */}
        {renderIndicatorCards()}

        {/* Chart */}
        {formattedData && (
          <div className="h-96 mb-6">
            {chartType === 'line' ? (
              <Line data={formattedData} options={chartOptions} />
            ) : (
              <Bar data={formattedData} options={chartOptions} />
            )}
          </div>
        )}

        {/* Metadata */}
        {chartData?.metadata && (
          <div className="text-sm text-gray-600 border-t pt-4">
            <p>
              <strong>Data Period:</strong> {chartData.metadata.start_date} to {chartData.metadata.end_date} 
              ({chartData.metadata.total_points} data points)
            </p>
          </div>
        )}
      </div>

      {/* Correlation Matrix */}
      {renderCorrelationMatrix()}
    </div>
  );
};

export default EconomicChartsWidget;
