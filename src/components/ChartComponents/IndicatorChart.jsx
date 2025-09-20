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
  Filler,
} from 'chart.js';

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

export default function IndicatorChart({ indicatorName, data }) {
  if (!data || data.length === 0) return <p>Loading chart...</p>;

  const labels = data.map(d => d.date);
  const values = data.map(d => d.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: indicatorName,
        data: values,
        borderColor: '#1d4ed8', // darker blue (blue-700)
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(29, 78, 216, 0.5)'); // dark blue, 50% opacity
          gradient.addColorStop(1, 'rgba(29, 78, 216, 0)');   // fade to transparent
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,          // ❌ no visible points
        pointHoverRadius: 0,     // ❌ no hover points
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: indicatorName,
        color: '#1e293b',
        font: { size: 18, weight: 'bold' },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        cornerRadius: 8,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' },
      },
      y: {
        grid: { color: 'rgba(203, 213, 225, 0.2)' },
        ticks: { color: '#64748b' },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    hover: {
      mode: 'nearest',
      intersect: false,
    },
  };

  return <Line data={chartData} options={options} />;
}
