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

export default function IndicatorChart({ indicatorName, data, color = '#1d4ed8', showShaded = true }) {
  if (!data || data.length === 0) return <p>Loading chart...</p>;

  const labels = data.map(d => d.date);
  const values = data.map(d => d.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: indicatorName,
        data: values,
        borderColor: color,
        backgroundColor: showShaded
          ? (ctx) => {
              const ctx2 = ctx.chart.ctx;
              const gradient = ctx2.createLinearGradient(0, 0, 0, 250);
              gradient.addColorStop(0, `${color}80`); // 50% opacity
              gradient.addColorStop(1, `${color}00`); // transparent
              return gradient;
            }
          : 'transparent', // no shading
        fill: showShaded,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
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
        callbacks: { label: (ctx) => `${ctx.parsed.y.toLocaleString()}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(203, 213, 225, 0.2)' }, ticks: { color: '#64748b' } },
    },
    elements: { point: { radius: 0 } },
    hover: { mode: 'nearest', intersect: false },
  };

  return <Line data={chartData} options={options} />;
}
