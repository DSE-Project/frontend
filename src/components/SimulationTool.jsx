import React, { useState } from "react";

const SimulationTool = () => {
  // Initial values based on dataset ranges
  const [unemployment, setUnemployment] = useState(3.4);
  const [inflation, setInflation] = useState(30.9);
  const [interest, setInterest] = useState(0.05);

  const [prediction, setPrediction] = useState({
    prob_1_month: 0,
    prob_3_month: 0,
    prob_6_month: 0,
  });

const handleSimulate = async () => {
  try {
    const userInput = {
      UNRATE: unemployment,  // Joblessness Rate
      CPIFOOD: inflation,    // Food Price Increase
      TB3MS: interest        // Interest Rate
    };

    // 🔹 Call 1M Simulation API
    const res1m = await fetch("http://127.0.0.1:8000/api/v1/forecast/simulate/1m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userInput),
    });

    if (!res1m.ok) throw new Error("Failed to fetch 1M prediction");
    const data1m = await res1m.json();

    // 🔹 Call 3M Simulation API
    const res3m = await fetch("http://127.0.0.1:8000/api/v1/forecast/simulate/3m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userInput),
    });

    if (!res3m.ok) throw new Error("Failed to fetch 3M prediction");
    const data3m = await res3m.json();

    // 🔹 Call 6M Simulation API
    const res6m = await fetch("http://127.0.0.1:8000/api/v1/forecast/simulate/6m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userInput),
    });

    if (!res6m.ok) throw new Error("Failed to fetch 6M prediction");
    const data6m = await res6m.json();

    // ✅ Update state with all predictions
    setPrediction({
      prob_1_month: data1m.prob_1m,
      prob_3_month: data3m.prob_3m,
      prob_6_month: data6m.prob_6m,
    });
  } catch (err) {
    console.error("Error running simulation:", err);
  }
};


  const getBarColor = (prob) => {
    if (prob > 0.5) return "bg-red-500";
    if (prob > 0.2) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
  <div className="mt-10 bg-[#0B1F3F] p-8 rounded-xl shadow-xl border border-[#3A3F55]">
    <h3 className="text-3xl font-bold mb-8 text-white text-center">
      Custom Recession Simulation
    </h3>

    <div className="flex gap-8 mb-6">
      <h4 className="w-1/2 text-xl font-bold text-cyan-400 text-center">
        🎛️ Adjust Your Economy
      </h4>
      <h4 className="w-1/2 text-xl font-bold text-yellow-400 text-center">
        📊 Forecasted Outcomes
      </h4>
    </div>

    <div className="flex gap-8">
      {/* Left: Inputs */}
      <div className="w-1/2 flex flex-col gap-6">
        {[
          { label: "Joblessness Rate (%)", value: unemployment, set: setUnemployment, min: 0.0, max: 30.0 },
          { label: "Food Price Increase", value: inflation, set: setInflation, min: 0.0, max: 500.0 },
          { label: "Interest Rate (%)", value: interest, set: setInterest, min: 0.0, max: 30.0 },
        ].map((item) => (
          <div key={item.label}>
            <label className="block mb-2 font-medium text-gray-200">
              {item.label}: {item.value.toFixed(2)}
            </label>
            <input
              type="range"
              min={item.min}
              max={item.max}
              step="0.01"
              value={item.value}
              onChange={(e) => item.set(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg accent-cyan-400"
            />
          </div>
        ))}

        <button
          onClick={handleSimulate}
          className="mt-6 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow hover:bg-cyan-600 transition-all w-full"
        >
          Simulate
        </button>
      </div>

      {/* Right: Circular Prediction Bars in One Row */}
      <div className="w-1/2 flex justify-around items-center">
        {[
          { label: "1 Month", key: "prob_1_month" },
          { label: "3 Months", key: "prob_3_month" },
          { label: "6 Months", key: "prob_6_month" },
        ].map((item) => {
          const radius = 60;
          const stroke = 8;
          const normalizedRadius = radius - stroke * 2;
          const circumference = normalizedRadius * 2 * Math.PI;
          const strokeDashoffset =
            circumference - prediction[item.key] * circumference;

          const getCircleColor = (prob) => {
            if (prob > 0.5) return "#EF4444"; // red
            if (prob > 0.2) return "#FACC15"; // yellow
            return "#22C55E"; // green
          };

          return (
            <div key={item.key} className="flex flex-col items-center">
              <svg height={radius * 2} width={radius * 2}>
                <circle
                  stroke="#334155"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  stroke={getCircleColor(prediction[item.key])}
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + " " + circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  transform={`rotate(-90 ${radius} ${radius})`}
                />
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="text-white font-bold text-lg"
                >
                  {(prediction[item.key] * 100).toFixed(0)}%
                </text>
              </svg>
              <span className="mt-2 text-gray-200 font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
};
export default SimulationTool;