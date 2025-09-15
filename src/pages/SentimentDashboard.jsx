import SideBar from '../components/SideBar';
import Header from '../components/Header';

// SentimentDashboard.jsx

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const COLORS = ["#4CAF50", "#FFC107", "#F44336"]; // Positive, Neutral, Negative

const SentimentDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/sentiment/reddit-sentiment"
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const responseData = await response.json();
        if (
          responseData.total_posts === 0 &&
          responseData.total_comments === 0
        ) {
          setError(
            "No data available. The sentiment analysis may not have collected any posts yet."
          );
        } else {
          setData(responseData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading sentiment analysis...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const sentimentCounts = data?.sentiment_counts || {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  const totalSentiments =
    sentimentCounts.positive +
    sentimentCounts.neutral +
    sentimentCounts.negative;

  const sentimentData = [
    {
      name: "Positive",
      value: sentimentCounts.positive,
      percentage: totalSentiments
        ? ((sentimentCounts.positive / totalSentiments) * 100).toFixed(1)
        : 0,
      color: COLORS[0],
    },
    {
      name: "Neutral",
      value: sentimentCounts.neutral,
      percentage: totalSentiments
        ? ((sentimentCounts.neutral / totalSentiments) * 100).toFixed(1)
        : 0,
      color: COLORS[1],
    },
    {
      name: "Negative",
      value: sentimentCounts.negative,
      percentage: totalSentiments
        ? ((sentimentCounts.negative / totalSentiments) * 100).toFixed(1)
        : 0,
      color: COLORS[2],
    },
  ];

  const posts = data?.posts || [];
  const topPosts = posts.slice(0, 8);

  const timeSeriesData = posts
    .filter((post) => post.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((post, index) => ({
      index,
      date: new Date(post.date).toLocaleDateString(),
      sentimentValue:
        post.sentiment === "positive"
          ? 1
          : post.sentiment === "negative"
          ? -1
          : 0,
      sentiment: post.sentiment,
    }));

  const dailyData = timeSeriesData.reduce((acc, item) => {
    if (!acc[item.date])
      acc[item.date] = {
        date: item.date,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0,
        avgSentiment: 0,
      };
    acc[item.date][item.sentiment] += 1;
    acc[item.date].total += 1;
    acc[item.date].avgSentiment += item.sentimentValue;
    return acc;
  }, {});

  const dailyDataArray = Object.values(dailyData).map((day) => ({
    ...day,
    avgSentiment: day.total ? (day.avgSentiment / day.total).toFixed(2) : 0,
  }));

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg w-full">
     
        <h1 className="text-3xl font-bold text-center mb-2">
          Reddit Economic Sentiment Dashboard
        </h1>
        <p className="text-gray-400 text-center">
          Real-time analysis of economic discussions across Reddit communities
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto w-full">
        {["overview", "posts", "trends", "summary"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center">Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 w-full">
            <div className="bg-gray-700 p-4 rounded-lg text-center w-full">
              <div className="text-2xl font-bold text-blue-400">
                {data?.summary?.total_posts || 0}
              </div>
              <div className="text-gray-300">Total Posts</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center w-full">
              <div className="text-2xl font-bold text-green-400">
                {data?.summary?.total_comments || 0}
              </div>
              <div className="text-gray-300">Total Comments</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center w-full">
              <div className="text-2xl font-bold text-purple-400">
                {data?.summary?.total_points || 0}
              </div>
              <div className="text-gray-300">Total Points</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center w-full">
              <div className="text-2xl font-bold text-yellow-400">
                {data?.summary?.time_range_days || 0}d
              </div>
              <div className="text-gray-300">Time Range</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center w-full">
              <div className="text-2xl font-bold text-pink-400">
                {data?.summary?.avg_engagement?.toFixed(2) || 0}
              </div>
              <div className="text-gray-300">Avg Engagement</div>
            </div>
          </div>

          {/* Sentiment Pie */}
          {totalSentiments > 0 && (
            <div className="mt-6 h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percentage }) =>
                      `${name}: ${percentage}%`
                    }
                    labelLine={false}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} posts (${props.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Key Highlights */}
          <div className="mt-6 bg-gray-700 p-4 rounded-lg w-full">
            <h3 className="text-lg font-semibold text-white mb-2">
              Key Highlights
            </h3>
            <ul className="text-gray-300 list-disc list-inside">
              <li>Total posts collected: {data?.summary?.total_posts}</li>
              <li>Total comments received: {data?.summary?.total_comments}</li>
              <li>Overall engagement points: {data?.summary?.total_points}</li>
              <li>
                Time span of collected data: {data?.summary?.time_range_days}{" "}
                days
              </li>
              <li>
                Average engagement per post:{" "}
                {data?.summary?.avg_engagement?.toFixed(2)}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full">
          <h2 className="text-xl font-semibold mb-4">
            Recent Economic Discussions
          </h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {topPosts.map((post, idx) => (
                <div
                  key={idx}
                  className="border border-gray-700 rounded-lg p-4 bg-gray-750 hover:bg-gray-700 transition-colors w-full"
                >
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                      post.sentiment === "positive"
                        ? "bg-green-900 text-green-300"
                        : post.sentiment === "negative"
                        ? "bg-red-900 text-red-300"
                        : "bg-yellow-900 text-yellow-300"
                    }`}
                  >
                    {post.sentiment?.toUpperCase() || "NEUTRAL"}
                  </div>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 font-medium hover:underline mb-2 text-lg"
                  >
                    {post.title}
                  </a>
                  {post.content && (
                    <p className="text-gray-300 mb-3 text-sm">
                      {post.content.length > 120
                        ? post.content.substring(0, 120) + "..."
                        : post.content}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>r/{post.subreddit}</span>
                    <div className="flex space-x-3">
                      <span>▲ {post.upvotes || 0}</span>
                      <span>💬 {post.comments_count || 0}</span>
                    </div>
                  </div>
                  {post.date && (
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No posts available for analysis</p>
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full">
          <h2 className="text-xl font-semibold mb-4">
            Sentiment Trends Over Time
          </h2>
          {dailyDataArray.length > 0 ? (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyDataArray}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis
                    stroke="#9CA3AF"
                    domain={[-1, 1]}
                    tickFormatter={(value) =>
                      value === 1
                        ? "Positive"
                        : value === -1
                        ? "Negative"
                        : "Neutral"
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      color: "#fff",
                    }}
                    formatter={(value) => {
                      const sentiment =
                        value > 0.3
                          ? "Positive"
                          : value < -0.3
                          ? "Negative"
                          : "Neutral";
                      return [`${sentiment} (${value})`, "Average Sentiment"];
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="avgSentiment"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Average Sentiment"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-400 text-center">No trend data available</p>
            </div>
          )}
        </div>
      )}

      {/* AI Summary Tab */}
      {activeTab === "summary" && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full">
          <h2 className="text-xl font-semibold mb-4">AI Analysis Summary</h2>
          {data?.llm_summary ? (
            <div className="bg-gray-700 p-6 rounded-lg w-full">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {data.llm_summary}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No AI summary available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentimentDashboard;
