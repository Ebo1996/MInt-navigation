import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiStar,
  FiMessageSquare,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiBarChart2,
  FiUsers,
  FiPhone,
  FiMail,
  FiMapPin,
  FiAward,
  FiDownload,
  FiCalendar
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { analyticsService } from "../../services/analyticsService";
import { departmentService } from "../../services/departmentService";
import { toast, Toaster } from "react-hot-toast";

const DepartmentDetailAnalytics = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [department, setDepartment] = useState(null);
  const [timeRange, setTimeRange] = useState("6months");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptData, analyticsData] = await Promise.all([
        departmentService.getById(id),
        analyticsService.getDepartmentAnalytics(id)
      ]);
      setDepartment(deptData);
      setData(analyticsData);
    } catch (error) {
      toast.error("Failed to load department analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
  const ratingColors = {
    1: "#ef4444",
    2: "#f97316",
    3: "#f59e0b",
    4: "#3b82f6",
    5: "#10b981"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading department analytics...</p>
        </div>
      </div>
    );
  }

  if (!department || !data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Department Not Found</h2>
        <Link to="/feedback-analytics/rankings" className="text-emerald-600 mt-4 inline-block">
          ← Back to Rankings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />

      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          to="/feedback-analytics/rankings"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {department.name?.en}
          </h1>
          <p className="text-gray-600 mt-1">Detailed analytics and performance metrics</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center gap-2">
          <FiDownload /> Export Report
        </button>
      </div>

      {/* Department Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InfoCard
          icon={<FiMapPin />}
          label="Location"
          value={`${department.building === "A" ? "Building A" : "Building B"} · Floor ${department.floor}`}
          subvalue={`Room ${department.room}`}
          color="emerald"
        />
        <InfoCard
          icon={<FiUsers />}
          label="Head of Department"
          value={department.head || "Not specified"}
          subvalue={department.email}
          color="blue"
        />
        <InfoCard
          icon={<FiPhone />}
          label="Contact"
          value={department.contact || "No phone"}
          subvalue={department.walkingTime || "N/A"}
          color="amber"
        />
        <InfoCard
          icon={<FiAward />}
          label="Overall Rating"
          value={`${department.rating?.toFixed(1) || "4.8"} / 5`}
          subvalue={`${department.reviewCount || 0} reviews`}
          color="purple"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Feedback"
          value={data.analytics?.totalFeedback || 0}
          icon={<FiMessageSquare />}
          color="emerald"
        />
        <KPICard
          title="Response Rate"
          value={`${data.analytics?.responseRate || 0}%`}
          icon={<FiClock />}
          color="blue"
        />
        <KPICard
  title="Average Rating"
  value={(
    data.analytics?.totalFeedback > 0 
      ? (
          (data.analytics.ratingDistribution?.[5] * 5 || 0) + 
          (data.analytics.ratingDistribution?.[4] * 4 || 0) +
          (data.analytics.ratingDistribution?.[3] * 3 || 0) +
          (data.analytics.ratingDistribution?.[2] * 2 || 0) +
          (data.analytics.ratingDistribution?.[1] * 1 || 0)
        ) / data.analytics.totalFeedback
      : (department.rating || 4.8)
  ).toFixed(1)}
  suffix="/5"
  icon={<FiStar />}
  color="amber"
/>
          title="This Month"
          value={data.analytics?.monthlyTrend?.slice(-1)[0]?.count || 0}
          icon={<FiTrendingUp />}
          color="purple"
        
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
              Monthly Rating Trend
            </h2>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1"
            >
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.analytics?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis domain={[0, 5]} stroke="#888" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  name="Average Rating"
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  name="Feedback Count"
                  yAxisId="right"
                  hide
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
            Rating Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(data.analytics?.ratingDistribution || {}).map(([rating, count]) => ({
                  rating: `${rating} Star`,
                  count,
                  color: ratingColors[rating]
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {Object.entries(data.analytics?.ratingDistribution || {}).map(([rating], index) => (
                    <Cell key={`cell-${index}`} fill={ratingColors[rating]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="text-center">
                <div className="flex justify-center mb-1">
                  {[...Array(rating)].map((_, i) => (
                    <FiStar key={i} className="text-yellow-400 fill-current text-xs" />
                  ))}
                </div>
                <p className="text-sm font-medium">{data.analytics?.ratingDistribution?.[rating] || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Keywords */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Top Keywords
          </h2>
          <div className="space-y-3">
            {data.analytics?.topKeywords?.map((keyword, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium">{keyword.word}</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                  {keyword.count}x
                </span>
              </div>
            ))}
            {(!data.analytics?.topKeywords || data.analytics.topKeywords.length === 0) && (
              <p className="text-gray-500 text-center py-4">No keywords yet</p>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Recent Feedback
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data.analytics?.recentFeedback?.map((feedback, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-lg text-white text-sm font-bold ${
                      feedback.rating === 5 ? 'bg-emerald-500' :
                      feedback.rating === 4 ? 'bg-blue-500' :
                      feedback.rating === 3 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}>
                      {feedback.rating}★
                    </div>
                    <span className="text-sm text-gray-500">
                      {feedback.date || new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{feedback.visitor || "Anonymous"}</span>
                </div>
                <p className="text-gray-700 text-sm">{feedback.comment || "No comment"}</p>
                {feedback.response && (
                  <div className="mt-2 pl-4 border-l-4 border-emerald-500 bg-emerald-50 p-2 rounded">
                    <p className="text-xs text-emerald-700 font-medium">Response:</p>
                    <p className="text-sm text-emerald-600">{feedback.response}</p>
                  </div>
                )}
              </div>
            ))}
            {(!data.analytics?.recentFeedback || data.analytics.recentFeedback.length === 0) && (
              <p className="text-gray-500 text-center py-4">No feedback yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Services Offered */}
      {department.services?.en?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-rose-500 rounded-full"></span>
            Services Offered
          </h2>
          <div className="flex flex-wrap gap-2">
            {department.services.en.map((service, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Info Card Component
const InfoCard = ({ icon, label, value, subvalue, color }) => {
  const colors = {
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-indigo-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-pink-500"
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colors[color]} text-white flex items-center justify-center text-xl mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subvalue}</p>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, suffix = "", icon, color }) => {
  const colors = {
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-indigo-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-pink-500"
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-105 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colors[color]} text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">
        {value}{suffix}
      </p>
    </div>
  );
};

export default DepartmentDetailAnalytics;