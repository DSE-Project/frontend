import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import IndicatorChart from './IndicatorChart';

function ColumnChart({ dateColumn, valueColumn }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('http://localhost:8000/api/v1/economic/csv')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch CSV');
        return res.text();
      })
      .then(csvText => {
        const parsed = Papa.parse(csvText, { header: true }).data;

        // Map and filter invalid rows
        const mappedData = parsed
          .map(row => ({
            date: row[dateColumn],
            value: parseFloat(row[valueColumn])
          }))
          .filter(d => d.date && !isNaN(d.value));

        setData(mappedData);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [dateColumn, valueColumn]);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (data.length === 0) return <p>No data available for {valueColumn}</p>;

  return <IndicatorChart indicatorName={valueColumn} data={data} />;
}

export default ColumnChart;
