import React from 'react';
import ModelPrediction from '../components/ModelPrediction';
import ColumnChart from '../components/ColumnChart';


const ReportPrint = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">U.S. Recession Forecast: Trends & Insights</h1>
        <p className="text-gray-600 mb-6">
          Economic Indicators and Predictive Analysis
        </p>
        <p>This report presents a forecast of potential U.S. recessions over the next 1 month, 3 months and 6 months, using key economic indicators and predictive modeling.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModelPrediction monthsAhead="1" />
          <ModelPrediction monthsAhead="3" />
          <ModelPrediction monthsAhead="6" />
        </div>
        <div>
          <div>
            <div className="bg-white rounded-2xl shadow p-6 mt-8">
              <p className="text-gray-700 mb-4">
                Our latest analysis uses key economic indicators and predictive modeling to assess the likelihood of a U.S. recession occurring in the near future.
              </p>
              <p className="text-gray-700 mb-6">
                As of <span className="font-medium">September 16, 2025</span>, the model does <span className="font-semibold text-green-600">not predict a recession</span> in the short to medium term. The estimated probabilities are:
              </p>

              <ul className="space-y-2 text-gray-700">
                <li>
                  <span className="font-medium">1 Month (October 2025):</span> 
                  &nbsp;9.94% chance of recession
                </li>
                <li>
                  <span className="font-medium">3 Months (December 2025):</span> 
                  &nbsp;18.44% chance of recession
                </li>
                <li>
                  <span className="font-medium">6 Months (March 2026):</span> 
                  &nbsp;25.28% chance of recession
                </li>
              </ul>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium mb-2">
                  While recession risk gradually increases over the next six months, the overall probabilities remain relatively low. Based on current economic conditions, the model’s confidence is high that no recession will occur in the immediate future.
                </p>
              </div>
            </div>
          </div>
        </div>

        <h1 className="mt-10 text-3xl font-bold text-gray-800">U.S. Recession Forecast: Indicators fluctuations</h1>

          <div className="flex flex-col gap-6 w-full mb-16">
            <div className="w-full bg-white p-4 rounded shadow h-100 ">
              <p>
                <strong>Federal Funds Rate (FedFunds):</strong> The interest rate at which banks lend to each other overnight. Rising rates can slow economic growth; falling rates often indicate efforts to stimulate the economy.
              </p>
              <ColumnChart dateColumn="observation_date" valueColumn="fedfunds" />
            </div>

            <div className="w-full bg-white p-4 rounded shadow h-96">
              <p>
                <strong>Gross Domestic Product (GDP):</strong> Measures the total value of all goods and services produced in the U.S. Declining GDP over multiple quarters can signal a recession.
              </p>
              <ColumnChart dateColumn="observation_date" valueColumn="GDP" />
            </div>

            <div className="w-full bg-white p-4 rounded shadow h-96">
              <p>
                <strong>Unemployment Rate (UNEMPLOY):</strong> Percentage of people actively looking for work but unable to find a job. Rising unemployment is a strong signal that the economy is weakening.
              </p>
              <ColumnChart dateColumn="observation_date" valueColumn="UNEMPLOY" />
            </div>
          </div>
        
      </div>
      
    </div>
  );
};

export default ReportPrint;
