import React, { useState, useEffect } from "react";
import {
  FiStar,
  FiDownload,
  FiFilter,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiPrinter,
  FiX,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const FeedbackManager = () => {
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    average: "0",
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    pending: 0,
    buildingA: 0,
    buildingB: 0,
    responseRate: 0,
  });

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      const [feedbackRes, statsRes] = await Promise.all([
        API.get("/feedback"),
        API.get("/feedback/stats"),
      ]);

      const feedback = feedbackRes.data;
      const feedbackStats = statsRes.data;

      // Enrich feedback with department names (mock for now - will come from API)
      const enrichedFeedback = feedback.map((f) => ({
        ...f,
        deptName: f.departmentName || `Department ${f.department}`,
        building: f.building || "A",
      }));

      setFeedbackData(enrichedFeedback);

      const buildingA = enrichedFeedback.filter(
        (f) => f.building === "A",
      ).length;
      const buildingB = enrichedFeedback.filter(
        (f) => f.building === "B",
      ).length;

      setStats({
        total: feedbackStats.total || 0,
        average: feedbackStats.average || "0",
        fiveStar: feedbackStats.fiveStar || 0,
        fourStar: feedbackStats.fourStar || 0,
        threeStar: feedbackStats.threeStar || 0,
        pending: feedbackStats.pending || 0,
        buildingA,
        buildingB,
        responseRate: feedbackStats.total
          ? Math.round(
              ((feedbackStats.total - feedbackStats.pending) /
                feedbackStats.total) *
                100,
            )
          : 0,
      });
    } catch (error) {
      console.error("Failed to load feedback:", error);
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedbackData.filter((f) => {
    if (filter !== "all" && f.rating !== parseInt(filter)) return false;
    if (
      search &&
      !f.deptName?.toLowerCase().includes(search.toLowerCase()) &&
      !f.comment?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };

  const handleExport = () => {
    const csvData = filteredFeedback.map((f) => ({
      Date: new Date(f.createdAt).toLocaleDateString(),
      Department: f.deptName,
      Building: f.building || "Unknown",
      Rating: f.rating,
      Comment: f.comment || "",
      Visitor: f.visitor || "Anonymous",
      Status: f.resolved ? "Resolved" : f.response ? "Responded" : "Pending",
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(","),
      ...csvData.map((row) =>
        headers.map((h) => `"${row[h] || ""}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  const getStatusBadge = (feedback) => {
    if (feedback.resolved) {
      return (
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full flex items-center gap-1">
          <FiCheckCircle size={10} /> Resolved
        </span>
      );
    }
    if (feedback.response) {
      return (
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full flex items-center gap-1">
          <FiMail size={10} /> Responded
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full flex items-center gap-1">
        <FiClock size={10} /> Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Feedback Monitoring Center
            </h1>
            <p className="text-amber-100 text-sm">
              Real-time public feedback analytics & sentiment tracking
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <FiDownload size={14} /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <FiPrinter size={14} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={stats.total} color="slate" />
        <StatCard
          label="Avg Rating"
          value={stats.average}
          suffix="★"
          color="amber"
        />
        <StatCard label="5 Star" value={stats.fiveStar} color="emerald" />
        <StatCard label="4 Star" value={stats.fourStar} color="blue" />
        <StatCard label="3 Star" value={stats.threeStar} color="orange" />
        <StatCard label="Pending" value={stats.pending} color="purple" />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          color="green"
        />
      </div>

      {/* Building Summary */}
      {(stats.buildingA > 0 || stats.buildingB > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {stats.buildingA > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-emerald-500">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏛️</span>
                  <span className="font-semibold">Building A</span>
                </div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stats.buildingA} feedback
                </span>
              </div>
            </div>
          )}
          {stats.buildingB > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏢</span>
                  <span className="font-semibold">Building B</span>
                </div>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {stats.buildingB} feedback
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by department or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Star Only</option>
            <option value="4">4 Star Only</option>
            <option value="3">3 Star Only</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No feedback found
          </h3>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedback.map((feedback) => (
            <div
              key={feedback._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition border overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base ${feedback.rating === 5 ? "bg-emerald-500" : feedback.rating === 4 ? "bg-blue-500" : feedback.rating === 3 ? "bg-amber-500" : "bg-red-500"}`}
                    >
                      {feedback.rating}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {feedback.deptName}
                        </h3>
                        {feedback.building && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${feedback.building === "A" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {feedback.building === "A"
                              ? "🏛️ Bldg A"
                              : "🏢 Bldg B"}
                          </span>
                        )}
                        {getStatusBadge(feedback)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{feedback.visitor || "Anonymous"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleView(feedback)}
                    className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    title="View Details"
                  >
                    <FiEye size={14} />
                  </button>
                </div>
                <div className="ml-12 mt-2">
                  <p className="text-gray-700 text-sm">
                    {feedback.comment || "No comment provided"}
                  </p>
                  {feedback.response && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-lg border-l-2 border-emerald-400">
                      <p className="text-xs font-medium text-emerald-700">
                        Official Response:
                      </p>
                      <p className="text-xs text-emerald-600">
                        {feedback.response}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal (READ ONLY) */}
      {showViewModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Feedback Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`text-xl ${i < selectedFeedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold">
                  {selectedFeedback.rating}.0/5.0
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700">
                  "{selectedFeedback.comment || "No comment"}"
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  — {selectedFeedback.visitor || "Anonymous"} •{" "}
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium">{selectedFeedback.deptName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Building</p>
                  <p className="font-medium">
                    {selectedFeedback.building === "A"
                      ? "Building A"
                      : "Building B"}
                  </p>
                </div>
                {selectedFeedback.visitorEmail && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">
                      {selectedFeedback.visitorEmail}
                    </p>
                  </div>
                )}
              </div>
              {selectedFeedback.response && (
                <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-500">
                  <p className="font-semibold text-emerald-800 mb-1">
                    Official Response:
                  </p>
                  <p className="text-emerald-700">
                    {selectedFeedback.response}
                  </p>
                  <p className="text-xs text-emerald-600 mt-2">
                    Responded by Sector Manager
                  </p>
                </div>
              )}
            </div>
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, suffix = "", color }) => {
  const colors = {
    slate: "from-slate-500 to-slate-600",
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-indigo-500",
    orange: "from-orange-500 to-red-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
  };
  return (
    <div
      className={`bg-gradient-to-r ${colors[color]} rounded-xl p-3 text-white shadow-sm`}
    >
      <p className="text-[10px] opacity-90">{label}</p>
      <p className="text-xl font-bold">
        {value}
        {suffix}
      </p>
    </div>
  );
};

export default FeedbackManager;
