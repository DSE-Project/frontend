import React, { useState } from "react";

const SimulationTool = () => {
  // Initial values
  const [unemployment, setUnemployment] = useState(0);
  const [inflation, setInflation] = useState(0);
  const [interest, setInterest] = useState(0);
  const [prediction, setPrediction] = useState({
    prob_1_month: 0,
    prob_3_month: 0,
    prob_6_month: 0,
  });

  const handleSimulate = async () => {
    try {
      // Mock API call
      const data = {
        prob_1_month: Math.random(),
        prob_3_month: Math.random(),
        prob_6_month: Math.random(),
      };
      setPrediction(data);
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
    <div className="mt-10 bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Custom Simulation Tool
      </h3>

      <div className="flex gap-8">
        {/* Left: Inputs (half width) */}
        <div className="w-1/2 flex flex-col gap-6">
          {[
            { label: "Unemployment", value: unemployment, set: setUnemployment, min: 0, max: 15 },
            { label: "Inflation (CPI)", value: inflation, set: setInflation, min: 0, max: 10 },
            { label: "Interest Rate", value: interest, set: setInterest, min: 0, max: 10 },
          ].map((item) => (
            <div key={item.label}>
              <label className="block mb-2 font-medium text-gray-700">
                {item.label}: {item.value}%
              </label>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step="0.1"
                value={item.value}
                onChange={(e) => item.set(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg accent-gray-600"
              />
            </div>
          ))}

          <button
            onClick={handleSimulate}
            className="mt-4 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow hover:bg-gray-800 transition-all w-full"
          >
            Simulate
          </button>
        </div>

        {/* Right: Prediction Bars (half width) */}
        <div className="w-1/2 flex flex-col justify-center gap-4">
          {[
            { label: "1 Month", key: "prob_1_month" },
            { label: "3 Months", key: "prob_3_month" },
            { label: "6 Months", key: "prob_6_month" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-4">
              <span className="w-24 text-gray-700">{item.label}</span>
              <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                <div
                  className={`${getBarColor(prediction[item.key])} h-4 rounded`}
                  style={{ width: `${prediction[item.key] * 100}%` }}
                ></div>
              </div>
              <span className="w-12 text-gray-700 text-right">
                {(prediction[item.key] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimulationTool;
