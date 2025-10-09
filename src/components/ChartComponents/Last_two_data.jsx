import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const LastTwoRowsCard = ({ tableName }) => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/last-two/${tableName}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => setRows(data))
      .catch((err) => setError(err.message));
  }, [tableName]);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (rows.length < 2) return <p>Loading...</p>;

  const prev = rows[0];
  const latest = rows[1];

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

  const IndicatorRow = ({ label, keyName }) => {
    const change = latest[keyName] - prev[keyName];
    const isPositive = change >= 0;

    return (
      <tr className="border-t">
        <td className="py-2 font-medium text-gray-700">{label}</td>
        <td className="py-2 text-center">{prev[keyName]}</td>
        <td className="py-2 text-center">{latest[keyName]}</td>
        <td
          className={`py-2 text-center font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "▲" : "▼"} {change.toFixed(2)}
        </td>
      </tr>
    );
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
         {tableName.replace(/_/g, " ")} — Last 2 Months
      </h2>
      <p className="text-gray-700 text-sm">
        This section provides the most recent economic indicators, including GDP, inflation, unemployment, and key financial rates. These metrics offer a snapshot of the overall health and trends in the economy.
        </p>



      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2">Indicator</th>
            <th className="p-2 text-center">Previous month</th>
            <th className="p-2 text-center">Current month</th>
            <th className="p-2 text-center">Change</th>
          </tr>
        </thead>
        <tbody>
            <IndicatorRow label="GDP" keyName="GDP" />
            <IndicatorRow label="Unemployment" keyName="UNEMPLOY" />
            <IndicatorRow label="Fed Funds Rate" keyName="fedfunds" />
            <IndicatorRow label="Treasury Bills (3M)" keyName="TB3MS" />
            <IndicatorRow label="Treasury Bills (6M)" keyName="TB6MS" />
            <IndicatorRow label="Consumer Spending" keyName="USCONS" />
            <IndicatorRow label="Industrial Production" keyName="SRVPRD" />
            <IndicatorRow label="Personal Savings Rate" keyName="PSAVERT" />
            </tbody>

      </table>
    </div>
  );
};

export default LastTwoRowsCard;
