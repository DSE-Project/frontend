import React, { useState, useCallback } from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import ModelPrediction from '../components/DashBoardComponents/ModelPrediction';
import ColumnChart from '../components/ChartComponents/ColumnChart';
import LastTwoRowsCard from '../components/ChartComponents/Last_two_data';
import SaveReportButton from '../components/SaveReportButton';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//toast.configure();

import { supabase } from '../supabase/supabase'; 
const API_URL = import.meta.env.VITE_API_BASE_URL;

const ReportGeneration = () => {
  const { user, isAuthenticated } = useAuth();
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();
  const [isDownloading, setIsDownloading] = useState(false);
  const [results, setResults] = useState({});

  // Memoize handleResult to prevent infinite loop
  const handleResult = useCallback((monthsAhead, probability, targetDate, rawPrediction) => {
    setResults(prev => ({
      ...prev,
      [monthsAhead]: { probability, targetDate, raw: rawPrediction },
    }));
  }, []); // Empty dependency array since it only uses setResults which is stable

  const handleDownloadPdf = async () => {
    if (!user) {
      alert("Please log in to download the report.");
      return;
    }
    
    // Prevent multiple simultaneous downloads
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      // 1️⃣ Generate PDF from backend
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL
      const reportUrl = encodeURIComponent(`${frontendUrl}/reports-print`);
      const response = await fetch(
        `${API_URL}/generate-report?url=${reportUrl}&filename=recession_report.pdf`
      );

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();

      // 2️⃣ Generate timestamped filename with microseconds for uniqueness
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `recession_report_${timestamp}_${randomSuffix}.pdf`;

      // 3️⃣ Upload directly using user.id (matches auth.uid())
      const file = new File([blob], fileName, { type: "application/pdf" });
      
      // Add a timeout wrapper for the upload with retry logic
      const uploadWithTimeoutAndRetry = async (maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            // Try with upsert: false first, then upsert: true on last attempt
            const upsertOption = attempt === maxRetries ? true : false;
            
            const uploadPromise = supabase.storage
              .from("user-reports")
              .upload(`${user.id}/${fileName}`, file, { upsert: upsertOption });
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Upload timeout after 30 seconds (attempt ${attempt})`)), 30000)
            );
            
            const result = await Promise.race([uploadPromise, timeoutPromise]);
            return result;
            
          } catch (error) {
            if (attempt === maxRetries) {
              throw error; // Last attempt failed, throw the error
            }
            
            // Wait before retrying (exponential backoff)
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      };
      
      const { data: uploadData, error: uploadError } = await uploadWithTimeoutAndRetry();

      console.log("� Upload completed - checking results...");
      console.log("� Upload data:", uploadData);
      console.log("🔍 Upload error:", uploadError);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Show success message
      toast.success("Report uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      // Ensure state is always reset, regardless of success or failure
      setIsDownloading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
        isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="mb-4 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div id="pdf-content" className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              U.S. Recession Forecast: Trends & Insights
            </h1>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap
                ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isDownloading ? 'Saving...' : 'Save Report'}
            </button>
          </div>

        
          {/* Intro Text */}
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Economic Indicators and Predictive Analysis</p>
          <p className="text-sm sm:text-base mb-6">
            This report presents a forecast of potential U.S. recessions over the next 1 month, 3 months, and 6 months, 
            using key economic indicators and predictive modeling.
          </p>

          {/* Model Predictions */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ModelPrediction monthsAhead="1" onResult={handleResult} />
            <ModelPrediction monthsAhead="3" onResult={handleResult} />
            <ModelPrediction monthsAhead="6" onResult={handleResult} />
          </div>

          {/* Recession Probability Section */}
          <div className="bg-white rounded-2xl shadow p-6 mt-8">
            <p className="text-gray-700 mb-4">
              As of <span className="font-medium">{new Date().toLocaleDateString()}</span>, the model estimates the following probabilities:
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
          </div>

          {/* Key Indicators */}
          <section className="mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">U.S. Recession Forecast: Key Indicators</h1>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Federal Funds Rate */}
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Federal Funds Rate (FedFunds)</h2>
                <p className="text-gray-600 text-sm mb-2">
                  The interest rate at which banks lend to each other overnight. Rising rates can slow economic growth; falling rates often indicate efforts to stimulate the economy.
                </p>
                <div className="flex-1 min-h-[180px]">
                  <ColumnChart dateColumn="observation_date" valueColumn="fedfunds" color="#3b82f6" showShaded={false} />
                </div>
              </div>

              {/* GDP */}
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Gross Domestic Product (GDP)</h2>
                <p className="text-gray-600 text-sm mb-2">
                  Measures the total value of all goods and services produced in the U.S. Declining GDP over multiple quarters can signal a recession.
                </p>
                <div className="flex-1 min-h-[180px]">
                  <ColumnChart dateColumn="observation_date" valueColumn="GDP" color="#10b981" showShaded={false} />
                </div>
              </div>

              {/* Unemployment */}
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col">
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Unemployment Rate (UNEMPLOY)</h2>
                <p className="text-gray-600 text-sm mb-2">
                Percentage of people actively looking for work but unable to find a job. 
                Rising unemployment is a strong signal that the economy is weakening.                </p>
                <div className="flex-1 min-h-[180px]">
                  <ColumnChart dateColumn="observation_date" valueColumn="UNEMPLOY" color="#f59e0b" showShaded={false} />
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

          {/* Latest Values */}
          <section className="mt-10">
            <h1 className="text-2xl font-bold mb-4">Latest Economic Data</h1>
            <LastTwoRowsCard tableName="historical_data_1m" />
          </section>

          <div className="mt-10">
            <p>
              Overall, the analysis underscores both challenges and opportunities for the U.S. economy in the months ahead. Proactive planning, informed decision-making, and close attention to key economic signals will be essential for mitigating risks and fostering sustainable growth.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ReportGeneration;
