import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMessageSquare, FiStar, FiClock, FiTrendingUp,
  FiAlertTriangle, FiRefreshCw, FiArrowRight,
  FiMapPin, FiUser, FiCheckCircle,
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { toast } from "react-hot-toast";

const T = {
  navy: "#0B2A4A", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", card: "#FFFFFF", border: "#D8E2EF",
  text: "#0B2A4A", textSub: "#4A5568", textMuted: "#8896A6",
};

const StatCard = ({ label, value, icon, color, sub }) => (
  <motion.div whileHover={{ y: -3 }} className="rounded-2xl p-5"
    style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 2px 12px rgba(11,42,74,0.06)" }}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold uppercase" style={{ color: T.textMuted, letterSpacing: "0.12em" }}>{label}</span>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
        {icon}
      </div>
    </div>
    <div className="text-3xl font-black" style={{ color: T.text }}>{value}</div>
    {sub && <div className="text-xs mt-1 font-medium" style={{ color: T.textMuted }}>{sub}</div>}
  </motion.div>
);

export default function Overview() {
  const [days, setDays]         = useState(30);
  const [data, setData]         = useState(null);
  const [inbox, setInbox]       = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => { load(); }, [days]);

  const load = async () => {
    setLoading(true);
    try {
      const [overview, inboxRes, rankRes] = await Promise.all([
        analyticsService.getOverview(days),
        analyticsService.getInbox({ limit: 8, page: 1 }),
        analyticsService.getRankings({ sortBy: "rating", order: "asc" }),
      ]);
      setData(overview);
      setInbox(inboxRes?.data || []);
      // flagged = rating < 3 or responseRate < 30
      setRankings(Array.isArray(rankRes) ? rankRes : []);
    } catch(e) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = (dept) => {
    toast.success(`Alert sent to sector manager for: ${dept?.name?.en || dept?.name || "Department"}`);
  };

  const flagged = rankings.filter(d => (d?.rating || 0) < 3 || (d?.responseRate || 0) < 30);

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
          style={{ borderColor: `${T.gold} transparent ${T.gold} ${T.gold}` }} />
        <p className="mt-4 text-sm font-semibold" style={{ color: T.textMuted }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: T.navy }}>Feedback Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>Real-time feedback data across all sectors</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={e => setDays(parseInt(e.target.value))}
            className="px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
            style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last Year</option>
          </select>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Feedback" value={data?.totalFeedback || 0}
          icon={<FiMessageSquare size={16} style={{ color: T.navy }} />} color={T.navy}
          sub={`Last ${days} days`} />
        <StatCard label="Avg Rating"
          value={data?.avgRating > 0 ? `${data.avgRating.toFixed(1)} ★` : "—"}
          icon={<FiStar size={16} style={{ color: T.gold }} />} color={T.gold}
          sub="Across all departments" />
        <StatCard label="Response Rate"
          value={data?.responseRate > 0 ? `${data.responseRate}%` : "0%"}
          icon={<FiClock size={16} style={{ color: "#6366F1" }} />} color="#6366F1"
          sub="Feedback with responses" />
        <StatCard label="Departments"
          value={data?.totalDepartments || 0}
          icon={<FiTrendingUp size={16} style={{ color: "#10B981" }} />} color="#10B981"
          sub="Active departments" />
      </div>

      {/* Performance Flags */}
      {flagged.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid rgba(239,68,68,0.30)`, background: "#FFF5F5" }}>
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)" }}>
            <FiAlertTriangle size={15} style={{ color: "#EF4444" }} />
            <span className="text-sm font-bold" style={{ color: "#B91C1C" }}>
              Performance Flags — {flagged.length} department{flagged.length > 1 ? "s" : ""} need attention
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(239,68,68,0.10)" }}>
            {flagged.slice(0, 5).map(dept => (
              <div key={dept.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm font-bold" style={{ color: T.text }}>
                    {dept?.name?.en || dept?.name || "Unknown"}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    {(dept?.rating || 0) < 3 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#DC2626" }}>
                        ⚠ Rating: {(dept.rating || 0).toFixed(1)}★
                      </span>
                    )}
                    {(dept?.responseRate || 0) < 30 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#D97706" }}>
                        🔔 Response: {dept.responseRate || 0}%
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => sendAlert(dept)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: "#EF4444", color: "#fff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#DC2626")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#EF4444")}>
                  <FiAlertTriangle size={12} /> Send Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 2px 12px rgba(11,42,74,0.06)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <h2 className="font-bold text-base" style={{ color: T.navy }}>Recent Feedback</h2>
          <Link to="/feedback-analytics/inbox"
            className="flex items-center gap-1 text-xs font-bold transition-colors"
            style={{ color: T.gold }}
            onMouseEnter={e => (e.currentTarget.style.color = T.navy)}
            onMouseLeave={e => (e.currentTarget.style.color = T.gold)}>
            View All <FiArrowRight size={12} />
          </Link>
        </div>
        {inbox.length === 0 ? (
          <div className="py-12 text-center" style={{ color: T.textMuted }}>
            <FiMessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No feedback yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: T.border }}>
            {inbox.map(fb => {
              const isLow  = fb.rating <= 2;
              const isHigh = fb.rating >= 5;
              return (
                <div key={fb._id} className="flex items-start gap-4 px-5 py-3.5"
                  style={{ borderLeft: `3px solid ${isLow ? "#EF4444" : isHigh ? "#10B981" : T.border}` }}>
                  {/* Stars */}
                  <div className="flex-shrink-0 flex items-center gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map(s => (
                      <FiStar key={s} size={12} style={{ color: s <= fb.rating ? T.gold : T.border, fill: s <= fb.rating ? T.gold : "none" }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold" style={{ color: T.text }}>{fb.deptName || "Unknown Dept"}</span>
                      {isLow && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#DC2626" }}>⚠ Low</span>}
                    </div>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: T.textSub }}>
                      {fb.comment || "No comment provided"}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: T.textMuted }}>
                      <span className="flex items-center gap-1"><FiUser size={10} /> {fb.visitor || "Anonymous"}</span>
                      <span className="flex items-center gap-1"><FiMapPin size={10} /> Bldg {fb.building}</span>
                      <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {fb.resolved ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.10)", color: "#059669" }}>
                        <FiCheckCircle size={10} className="inline mr-1" />Resolved
                      </span>
                    ) : fb.response ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(99,102,241,0.10)", color: "#6366F1" }}>Responded</span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(245,158,11,0.10)", color: "#D97706" }}>Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
