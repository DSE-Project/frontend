import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_BASE_URL;
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
import { Line } from 'react-chartjs-2';

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

const YearlyRiskChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchYearlyRiskData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/yearly-risk`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      processChartData(data.monthly_risks);
    } catch (err) {
      setError('Failed to fetch yearly risk data. Please try again.');
      console.error('Error fetching yearly risk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (monthlyRisks) => {
    // Sort data by date to ensure proper order
    const sortedData = monthlyRisks.sort((a, b) => new Date(a.observation_date) - new Date(b.observation_date));
    
    const labels = sortedData.map(item => `${item.month_name} ${item.year}`);
    const probabilities = sortedData.map(item => (item.recession_probability * 100).toFixed(2));
    
    // Color coding based on risk level
    const getPointColor = (riskLevel) => {
      switch (riskLevel.toLowerCase()) {
        case 'low': return '#22c55e'; // Green
        case 'medium': return '#f59e0b'; // Yellow
        case 'high': return '#ef4444'; // Red
        default: return '#3b82f6'; // Blue
      }
    };

    const pointColors = sortedData.map(item => getPointColor(item.risk_level));

    setChartData({
      labels,
      datasets: [
        {
          label: 'Recession Probability (%)',
          data: probabilities,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
        },
      ],
    });
  };

  useEffect(() => {
    fetchYearlyRiskData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Recession Risk Trends - Past 12 Months',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const monthlyRisk = chartData ? 
              [...chartData.labels].map((_, i) => ({ 
                probability: context.dataset.data[i],
                // We need to get risk level from the original data
              }))[dataIndex] : null;
            
            return [
              `Recession Probability: ${context.parsed.y}%`,
              // `Risk Level: ${monthlyRisk?.risk_level || 'Unknown'}`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Recession Probability (%)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        beginAtZero: true,
        max: Math.max(20, Math.ceil(Math.max(...(chartData?.datasets[0]?.data || [0])) / 10) * 10),
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Historical Recession Risk Analysis
        </h3>
        <p className="text-gray-600 text-sm">
          Monthly recession probability predictions for the past year
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading chart data...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={fetchYearlyRiskData}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {chartData && !loading && (
        <div className="h-96">
          <Line data={chartData} options={options} />
        </div>
      )}

      {chartData && !loading && (
        <div className="mt-4 flex justify-center space-x-6 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>High Risk</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearlyRiskChart;