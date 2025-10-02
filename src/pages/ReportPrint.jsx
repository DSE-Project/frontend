import React, { useState } from 'react';
import ModelPrediction from '../components/DashBoardComponents/ModelPrediction';
import ColumnChart from '../components/ChartComponents/ColumnChart';
import LastTwoRowsCard from '../components/ChartComponents/Last_two_data';

const ReportPrint = () => {
  const [results, setResults] = useState({});
  const coverImages = [
    "Cover_image_1.jpg",
    "Cover_image_2.jpg",
    "Cover_image_3.jpg",
    "Cover_image_4.jpg",
  ];

  const randomImage = coverImages[Math.floor(Math.random() * coverImages.length)];

  
  const handleResult = (monthsAhead, probability, targetDate, rawPrediction) => {
    setResults(prev => ({
      ...prev,
      [monthsAhead]: { probability, targetDate, raw: rawPrediction },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Full-width image */}
          <img
            src={randomImage}
            alt="Economic Trends"
            className="w-full h-80 object-cover rounded-lg mb-6"
          />

      {/* White background wrapper */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Report Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          U.S. Recession Forecast: Trends & Insights
        </h1>
        <p className="text-gray-600 mb-6">
          Economic Indicators and Predictive Analysis
        </p>
        <p>
          This report presents a forecast of potential U.S. recessions over the next 1 month, 
          3 months and 6 months, using key economic indicators and predictive modeling.
        </p>

        {/* Model Predictions Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ModelPrediction monthsAhead="1" onResult={handleResult} />
          <ModelPrediction monthsAhead="3" onResult={handleResult} />
          <ModelPrediction monthsAhead="6" onResult={handleResult} />
        </div>

        {/* Recession Probability Section */}
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <p className="text-gray-700 mb-4">
            Our latest analysis uses key economic indicators and predictive modeling 
            to assess the likelihood of a U.S. recession occurring in the near future.
          </p>

          <p className="text-gray-700 mb-6">
            As of <span className="font-medium">{new Date().toLocaleDateString()}</span>, 
            the model estimates the following probabilities:
          </p>

          <ul className="space-y-3">
            {["1", "3", "6"].map((m) => (
              <li key={m} className="flex items-center space-x-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-700">
                  <span className="font-medium">
                    {m === "1" ? "1 Month" : m + " Months"}
                  </span>{" "}
                  ({results[m]?.targetDate ?? "--"}):{" "}
                  <span className="font-semibold text-blue-600">
                    {results[m]?.probability ?? "--"}%
                  </span>{" "}
                  chance of recession
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium mb-2">
              While recession risk varies across the forecast horizon, 
              the overall probabilities remain moderate based on current model outputs
            </p>
          </div>
        </div>

        {/* Newly added text - inside white background */}
        <div className="mt-10">
          <p>
            The U.S. economy continues to navigate a complex landscape shaped by 
            interest rate adjustments, labor market dynamics, and global financial conditions. 
            Monitoring these factors is critical for anticipating potential shifts in growth, 
            stability, and recession risk. This report brings together recent data and forecasts 
            to provide a clearer picture of near-term economic trends.
          </p>
        </div>

        <div className="mt-4">
          <p>
            While certain indicators, such as unemployment and consumer spending, 
            suggest areas of vulnerability, others like industrial production and GDP 
            remain relatively stable. These mixed signals highlight the importance of 
            ongoing monitoring and flexible policy responses to ensure the economy 
            remains resilient.
          </p>
        </div>  

        {/* Indicators Fluctuations */}
        <section className="mt-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            U.S. Recession Forecast: Key Indicators
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Federal Funds Rate */}
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Federal Funds Rate (FedFunds)
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                The interest rate at which banks lend to each other overnight. 
                Rising rates can slow economic growth; falling rates often indicate 
                efforts to stimulate the economy.
              </p>
              <div className="flex-1 min-h-[180px] w-[480px]">
                <ColumnChart
                  dateColumn="observation_date"
                  valueColumn="fedfunds"
                  color="#3b82f6"
                  showShaded={false}
                />
              </div>
            </div>

            {/* GDP */}
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Gross Domestic Product (GDP)
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                Measures the total value of all goods and services produced in the U.S. 
                Declining GDP over multiple quarters can signal a recession.
              </p>
              <div className="flex-1 min-h-[180px] w-[480px]">
                <ColumnChart
                  dateColumn="observation_date"
                  valueColumn="GDP"
                  color="#10b981"
                  showShaded={false}
                />
              </div>
            </div>

            {/* Unemployment */}
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                Unemployment Rate (UNEMPLOY)
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                Percentage of people actively looking for work but unable to find a job. 
                Rising unemployment is a strong signal that the economy is weakening.
              </p>
              <div className="flex-1 min-h-[180px] w-[480px]">
                <ColumnChart
                  dateColumn="observation_date"
                  valueColumn="UNEMPLOY"
                  color="#f59e0b"
                  showShaded={false}
                />
              </div>
            </div>

            {/* Treasury Bills */}
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                3 Months Treasury Bills (TB3f)
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                Short-term government debt often reflects investor sentiment about 
                near-term economic stability. Declining yields can signal market caution.
              </p>
              <div className="flex-1 min-h-[180px] w-[480px]">
                <ColumnChart
                  dateColumn="observation_date"
                  valueColumn="TB3MS"
                  color="Red"
                  showShaded={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Latest Values of the economic indicators */}
        <section className="mt-">
          <h1 className="text-2xl font-bold mb-4">Latest Economic Data</h1>
          <div className="grid md:grid-cols-1 gap-6">
            <LastTwoRowsCard tableName="historical_data_1m" />
          </div>
        </section>

        {/* Final note inside white box */}
        <div className='mt-4'>
          <p>
            Overall, the analysis underscores both challenges and opportunities 
            for the U.S. economy in the months ahead. Proactive planning, informed 
            decision-making, and close attention to key economic signals will be 
            essential for mitigating risks and fostering sustainable growth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportPrint;
