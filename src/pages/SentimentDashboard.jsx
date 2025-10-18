import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { useSidebar } from '../contexts/SidebarContext';
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

const API_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = ["#4CAF50", "#FFC107", "#F44336"]; // Positive, Neutral, Negative

const SentimentDashboard = () => {
  const [data, setData] = useState(() => {
    // ✅ Load cache immediately on first render
    const cached = localStorage.getItem("sentimentData");
    const expiry = localStorage.getItem("sentimentData_expiry");
    if (cached && expiry && Date.now() < Number(expiry)) {
      console.log("⚡ Using cached data on first render");
      return JSON.parse(cached);
    }
    return null;
  });

  const [loading, setLoading] = useState(data ? false : true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    if (data) return; // already have cached data

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/sentiment/reddit-sentiment`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const responseData = await response.json();

        if (responseData.total_posts === 0 && responseData.total_comments === 0) {
          setError("No data available yet.");
        } else {
          setData(responseData);
          // ✅ Save cache for 1 hour
          localStorage.setItem("sentimentData", JSON.stringify(responseData));
          localStorage.setItem("sentimentData_expiry", (Date.now() + 60*60*1000).toString());
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [data]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <Header />
        <SideBar />
        <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading sentiment analysis...</p>
            </div>
          </div>
        </main>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-100 pt-16">
        <Header />
        <SideBar />
        <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );

  // --- Data preparation ---
  const sentimentCounts = data?.sentiment_counts || { positive: 0, neutral: 0, negative: 0 };
  const totalSentiments = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;

  const sentimentData = [
    { name: "Positive", value: sentimentCounts.positive, percentage: totalSentiments ? ((sentimentCounts.positive / totalSentiments) * 100).toFixed(1) : 0, color: COLORS[0] },
    { name: "Neutral", value: sentimentCounts.neutral, percentage: totalSentiments ? ((sentimentCounts.neutral / totalSentiments) * 100).toFixed(1) : 0, color: COLORS[1] },
    { name: "Negative", value: sentimentCounts.negative, percentage: totalSentiments ? ((sentimentCounts.negative / totalSentiments) * 100).toFixed(1) : 0, color: COLORS[2] },
  ];

  const posts = data?.posts || [];
  const topPosts = posts.slice(0, 8);

  const timeSeriesData = posts
    .filter((post) => post.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((post, index) => ({
      index,
      date: new Date(post.date).toLocaleDateString(),
      sentimentValue: post.sentiment === "positive" ? 1 : post.sentiment === "negative" ? -1 : 0,
      sentiment: post.sentiment,
    }));

  const dailyData = timeSeriesData.reduce((acc, item) => {
    if (!acc[item.date])
      acc[item.date] = { date: item.date, positive: 0, neutral: 0, negative: 0, total: 0, avgSentiment: 0 };
    acc[item.date][item.sentiment] += 1;
    acc[item.date].total += 1;
    acc[item.date].avgSentiment += item.sentimentValue;
    return acc;
  }, {});

  const dailyDataArray = Object.values(dailyData).map((day) => ({
    ...day,
    avgSentiment: day.total ? (day.avgSentiment / day.total).toFixed(2) : 0,
  }));

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header />
      <SideBar />
      <main className={`transition-all duration-800 p-4 sm:p-6 lg:p-8 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Page Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Reddit Economic Sentiment Dashboard</h1>
          <p className="text-gray-500 text-center">Real-time analysis of economic discussions across Reddit communities</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-6 overflow-x-auto">
          {["overview", "posts", "trends", "summary"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-lg p-6 shadow-lg space-y-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Overview</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center shadow">
                  <div className="text-2xl font-bold text-blue-600">{data?.summary?.total_posts || 0}</div>
                  <div className="text-gray-500">Total Posts</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center shadow">
                  <div className="text-2xl font-bold text-green-600">{data?.summary?.total_comments || 0}</div>
                  <div className="text-gray-500">Total Comments</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center shadow">
                  <div className="text-2xl font-bold text-purple-600">{data?.summary?.total_points || 0}</div>
                  <div className="text-gray-500">Total Points</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center shadow">
                  <div className="text-2xl font-bold text-yellow-600">{data?.summary?.time_range_days || 0}d</div>
                  <div className="text-gray-500">Time Range</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center shadow">
                  <div className="text-2xl font-bold text-pink-600">{data?.summary?.avg_engagement?.toFixed(2) || 0}</div>
                  <div className="text-gray-500">Avg Engagement</div>
                </div>
              </div>

              {totalSentiments > 0 && (
                <div className="mt-6 h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [`${value} posts (${props.payload.percentage}%)`, name]}
                        contentStyle={{ backgroundColor: "#F9FAFB", border: "none", color: "#111827" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Economic Discussions</h2>
              {topPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topPosts.map((post, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                        post.sentiment === "positive" ? "bg-green-100 text-green-800" :
                        post.sentiment === "negative" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {post.sentiment?.toUpperCase() || "NEUTRAL"}
                      </div>
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 font-medium hover:underline mb-2 text-lg">{post.title}</a>
                      {post.content && <p className="text-gray-600 mb-3 text-sm">{post.content.length > 120 ? post.content.substring(0, 120) + "..." : post.content}</p>}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>r/{post.subreddit}</span>
                        <div className="flex space-x-3">
                          <span>▲ {post.upvotes || 0}</span>
                          <span>💬 {post.comments_count || 0}</span>
                        </div>
                      </div>
                      {post.date && <div className="text-xs text-gray-400 mt-2">{new Date(post.date).toLocaleDateString()}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No posts available</p>
                </div>
              )}
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === "trends" && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Sentiment Trends Over Time</h2>
              {dailyDataArray.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyDataArray}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" domain={[-1, 1]} tickFormatter={v => v === 1 ? "Positive" : v === -1 ? "Negative" : "Neutral"} />
                      <Tooltip contentStyle={{ backgroundColor: "#F9FAFB", border: "none", color: "#111827" }} formatter={value => {
                        const sentiment = value > 0.3 ? "Positive" : value < -0.3 ? "Negative" : "Neutral";
                        return [`${sentiment} (${value})`, "Average Sentiment"];
                      }} />
                      <Legend />
                      <Area type="monotone" dataKey="avgSentiment" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Average Sentiment" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-gray-500 text-center">No trend data available</p>
                </div>
              )}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">AI Analysis Summary</h2>
              {data?.llm_summary ? (
                <div className="bg-gray-50 p-6 rounded-lg shadow">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{data.llm_summary}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No AI summary available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SentimentDashboard;
