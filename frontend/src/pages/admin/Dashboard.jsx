import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiInbox,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { departmentService } from "../../services/departmentService";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─────────────────────────────────────────── */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDepts: 0,
    buildingA: { depts: 0, floors: 0, rating: 0 },
    buildingB: { depts: 0, floors: 0, rating: 0 },
  });
  const [complaintStats, setComplaintStats] = useState({
    total: 0, pending: 0, reviewed: 0, resolved: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [departmentRatings, setDepartmentRatings] = useState({ labels: [], datasets: [] });

  const formatTimeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const getDepartmentRatings = async () => {
    try {
      const depts = await departmentService.getAll();
      const top = depts.slice(0, 8);
      return {
        labels: top.map((d) => d.name?.en?.substring(0, 15) || "Unknown"),
        datasets: [{
          label: "Rating",
          data: top.map((d) => d.rating || 4.5),
          backgroundColor: [
            "rgba(16,185,129,0.8)", "rgba(245,158,11,0.8)", "rgba(59,130,246,0.8)",
            "rgba(139,92,246,0.8)", "rgba(236,72,153,0.8)", "rgba(6,182,212,0.8)",
            "rgba(249,115,22,0.8)", "rgba(34,197,94,0.8)",
          ],
          borderRadius: 8,
          barPercentage: 0.65,
          categoryPercentage: 0.8,
        }],
      };
    } catch { return { labels: [], datasets: [] }; }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [departments, buildingStats, deptRatings, complaintsRes, recentRes] =
        await Promise.all([
          departmentService.getAll(),
          departmentService.getBuildingStats(),
          getDepartmentRatings(),
          API.get("/system-complaints/stats"),
          API.get("/system-complaints?limit=5"),
        ]);
      setStats({
        totalDepts: departments.length,
        buildingA: buildingStats?.A || { depts: 0, floors: 0, rating: 0 },
        buildingB: buildingStats?.B || { depts: 0, floors: 0, rating: 0 },
      });
      setComplaintStats(complaintsRes.data?.data || {});
      setRecentComplaints(recentRes.data?.data || []);
      setDepartmentRatings(deptRatings);
    } catch (error) {
      console.error("Dashboard load error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ministry system overview and user feedback management
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2"
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Departments" value={stats.totalDepts}            icon={<FiGrid size={18} />}          color="emerald" />
        <KpiCard label="System Feedback"   value={complaintStats.total ?? 0}   icon={<FiInbox size={18} />}         color="blue"    />
        <KpiCard label="Pending Review"    value={complaintStats.pending ?? 0} icon={<FiAlertTriangle size={18} />} color="orange"  />
        <KpiCard label="Resolved"          value={complaintStats.resolved ?? 0} icon={<FiCheckCircle size={18} />}  color="green"   />
      </div>

      {/* Building Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border p-5 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  MAIN BUILDING
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Building A</h3>
              <p className="text-gray-500 text-sm">
                {stats.buildingA.depts} departments · {stats.buildingA.floors} floors
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.buildingA.rating?.toFixed(1)}
              </div>
              <div className="text-yellow-400 text-sm">★★★★★</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏢</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  ANNEX BUILDING
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Building B</h3>
              <p className="text-gray-500 text-sm">
                {stats.buildingB.depts} departments · {stats.buildingB.floors} floors
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {stats.buildingB.rating?.toFixed(1)}
              </div>
              <div className="text-yellow-400 text-sm">★★★★★</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts + Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Ratings Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-800">Department Ratings</h2>
            </div>
            <Link to="/admin/departments" className="text-sm text-emerald-600 hover:text-emerald-700">
              View All →
            </Link>
          </div>
          <div className="h-72">
            {departmentRatings.labels.length > 0 ? (
              <Bar
                data={departmentRatings}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.raw} ★` } },
                  },
                  scales: { y: { max: 5, title: { display: true, text: "Rating (1-5)" } } },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data</div>
            )}
          </div>
        </div>

        {/* Recent System Feedback */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded-full" />
              <h2 className="text-lg font-semibold text-gray-800">Recent System Feedback</h2>
            </div>
            <Link to="/admin/system-inbox" className="text-sm text-emerald-600 hover:text-emerald-700">
              View All →
            </Link>
          </div>

          {/* Status mini-cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Pending",  value: complaintStats.pending,  cls: "bg-amber-100 text-amber-700" },
              { label: "Reviewed", value: complaintStats.reviewed, cls: "bg-blue-100 text-blue-700"   },
              { label: "Resolved", value: complaintStats.resolved, cls: "bg-green-100 text-green-700" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 text-center ${s.cls}`}>
                <div className="text-xl font-bold">{s.value ?? 0}</div>
                <div className="text-xs font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((c) => (
                <div key={c._id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    c.status === "resolved" ? "bg-green-500" :
                    c.status === "reviewed" ? "bg-blue-500" : "bg-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.subject}</p>
                    <p className="text-xs text-gray-400">
                      {c.visitor || "Anonymous"} · {formatTimeAgo(c.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-400 py-6">No system feedback yet</p>
            )}
          </div>

          <Link
            to="/admin/system-inbox"
            className="mt-4 block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700 py-2 border-t"
          >
            Open System Inbox →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-rose-500 rounded-full" />
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionCard icon={<FiGrid />}      title="Add Department"  description="Create new department" color="emerald" link="/admin/departments"    />
          <QuickActionCard icon={<FiInbox />}     title="System Inbox"   description="View user feedback"    color="red"     link="/admin/system-inbox"   />
          <QuickActionCard icon={<FiUsers />}     title="Sector Managers" description="Manage user access"  color="blue"    link="/admin/sector-managers" />
          <QuickActionCard icon={<FiMegaphone />} title="Announcements"  description="Post public updates"  color="purple"  link="/admin/announcements"  />
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ── */
const KpiCard = ({ label, value, suffix = "", icon, color }) => {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue:    "bg-blue-100 text-blue-600",
    green:   "bg-green-100 text-green-600",
    orange:  "bg-orange-100 text-orange-600",
    red:     "bg-red-100 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border p-3 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}{suffix}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, title, description, color, link }) => {
  const colors = {
    emerald: "from-emerald-500 to-teal-500",
    blue:    "from-blue-500 to-indigo-500",
    purple:  "from-purple-500 to-pink-500",
    red:     "from-red-500 to-rose-500",
  };
  return (
    <Link
      to={link}
      className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition group"
    >
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${colors[color]} text-white flex items-center justify-center text-base mb-2 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
    </Link>
  );
};

const FiMegaphone = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
  </svg>
);

export default Dashboard;
