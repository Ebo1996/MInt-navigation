/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare, FiStar, FiClock, FiCheckCircle,
  FiSend, FiX, FiUser, FiMail, FiAlertCircle,
  FiTrendingUp, FiLogOut, FiBell, FiMenu, FiHome,
  FiBarChart2, FiSettings, FiFileText, FiEye, FiDownload,
  FiFilter, FiSearch, FiChevronLeft, FiChevronRight,
  FiSave, FiLock, FiRefreshCw, FiShield,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const T = {
  navy: "#0B2A4A", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", card: "#FFFFFF", border: "#D8E2EF",
  text: "#0B2A4A", textSub: "#4A5568", textMuted: "#8896A6",
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <FiStar key={s} size={13}
        style={{ color: s <= rating ? T.gold : T.border, fill: s <= rating ? T.gold : "none" }} />
    ))}
  </div>
);

const StatusBadge = ({ feedback }) => {
  if (feedback.resolved)
    return <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1" style={{ background:"rgba(16,185,129,0.10)", color:"#059669" }}><FiCheckCircle size={10}/>Resolved</span>;
  if (feedback.response)
    return <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background:"rgba(99,102,241,0.10)", color:"#6366F1" }}>Responded</span>;
  return <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1" style={{ background:"rgba(245,158,11,0.10)", color:"#D97706" }}><FiClock size={10}/>Pending</span>;
};

export default function SectorDashboard() {
  const navigate  = useNavigate();
  const [tab,     setTab]     = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState({});
  const [sector,  setSector]  = useState(null); // real sector from API

  // Stats & feedback
  const [stats,           setStats]           = useState({ totalFeedback:0, avgRating:0, responseRate:0, pendingCount:0, ratingDistribution:{1:0,2:0,3:0,4:0,5:0}, departmentCount:0 });
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [allFeedbacks,    setAllFeedbacks]    = useState([]);
  const [deptPerformance, setDeptPerformance] = useState([]);
  const [deptList,        setDeptList]        = useState([]);

  // Alerts
  const [alerts,      setAlerts]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlerts,  setShowAlerts]  = useState(false);

  // Notifications (pending feedback)
  const [pendingCount,       setPendingCount]       = useState(0);
  const [showNotifications,  setShowNotifications]  = useState(false);
  const [notifications,      setNotifications]      = useState([]);

  // Filters & pagination
  const [filters,    setFilters]    = useState({ status:"all", department:"all", search:"", sortBy:"date", sortOrder:"desc" });
  const [pagination, setPagination] = useState({ page:1, limit:10, total:0, pages:1 });
  const [showFilters,setShowFilters]= useState(false);

  // Modals
  const [viewFeedback,     setViewFeedback]     = useState(null);
  const [respondFeedback,  setRespondFeedback]  = useState(null);
  const [responseText,     setResponseText]     = useState("");
  const [submitting,       setSubmitting]       = useState(false);

  // Settings
  const [profileForm,      setProfileForm]      = useState({ name:"", email:"", avatar:"" });
  const [passwordForm,     setPasswordForm]     = useState({ current:"", new_:"", confirm:"" });
  const [updatingProfile,  setUpdatingProfile]  = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Reports
  const [reportStart, setReportStart] = useState(new Date(Date.now()-30*24*60*60*1000).toISOString().split("T")[0]);
  const [reportEnd,   setReportEnd]   = useState(new Date().toISOString().split("T")[0]);
  const [generating,  setGenerating]  = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── INIT ──
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("adminUser") || "{}");
    if (!u?.role || u.role !== "sector_manager") { navigate("/admin/login"); return; }
    setUser(u);
    setProfileForm({ name: u.name||"", email: u.email||"", avatar: u.avatar||"" });
    const sId = u.sectorId || 1;
    loadAll(sId);
    loadSectorInfo(sId);
    loadAlerts();
  }, []);

  // Reload feedback when filters/page change
  useEffect(() => {
    if (tab === "feedback") loadAllFeedback();
  }, [filters, pagination.page, tab]);

  // Poll pending count every 15s
  useEffect(() => {
    const sId = user?.sectorId;
    if (!sId) return;
    const id = setInterval(() => loadPendingCount(sId), 15000);
    return () => clearInterval(id);
  }, [user?.sectorId]);

  // ── LOADERS ──
  const loadAll = async (sId) => {
    setLoading(true);
    await Promise.all([loadStats(sId), loadRecentFeedback(sId), loadPendingCount(sId)]);
    setLoading(false);
  };

  const loadSectorInfo = async (sId) => {
    try {
      const res = await API.get(`/sectors/public/${sId}`);
      const s = res.data?.data || res.data;
      setSector(s?.name?.en || s?.name || `Sector ${sId}`);
    } catch(e) {
      setSector(`Sector ${sId}`);
    }
  };

  const loadStats = async (sId) => {
    try {
      const res = await API.get(`/sector/${sId}/stats`);
      setStats(res.data?.data || res.data);
    } catch(e) { console.error(e); }
  };

  const loadRecentFeedback = async (sId) => {
    try {
      const res = await API.get(`/sector/${sId}/feedback`, { params:{ limit:5 } });
      setRecentFeedbacks(res.data?.data || res.data?.feedbacks || []);
      setDeptPerformance(res.data?.departmentPerformance || []);
    } catch(e) { console.error(e); }
  };

  const loadAllFeedback = async () => {
    try {
      setLoading(true);
      const sId = user?.sectorId || 1;
      const params = {
        ...(filters.status     !== "all" && { status:     filters.status }),
        ...(filters.department !== "all" && { department: filters.department }),
        ...(filters.search                && { search:     filters.search }),
        sortBy:    filters.sortBy,
        sortOrder: filters.sortOrder,
        page:      pagination.page,
        limit:     pagination.limit,
      };
      const res = await API.get(`/sector/${sId}/feedback`, { params });
      setAllFeedbacks(res.data?.data || res.data?.feedbacks || []);
      setPagination(res.data?.pagination || { page:1, limit:10, total:0, pages:1 });
      setDeptList(res.data?.filters?.departments || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadPendingCount = async (sId) => {
    try {
      const res = await API.get(`/sector/${sId}/pending-count`);
      const cnt = res.data?.pendingCount ?? res.data?.data?.pendingCount ?? 0;
      setPendingCount(cnt);
      // Build notifications list from pending feedback
      const fbRes = await API.get(`/sector/${sId}/feedback`, { params:{ status:"pending", limit:20 } });
      const list  = fbRes.data?.data || fbRes.data?.feedbacks || [];
      setNotifications(list.map(f => ({
        id: f._id,
        title: `${f.rating}★ feedback`,
        message: f.comment?.substring(0,60) || "No comment",
        dept: f.departmentName || "",
        time: new Date(f.createdAt).toLocaleString(),
        createdAt: f.createdAt,
        feedback: f,
        read: false,
      })));
    } catch(e) { console.error(e); }
  };

  const loadAlerts = async () => {
    try {
      const res = await API.get("/sector/alerts/my");
      setAlerts(res.data?.alerts || []);
      setUnreadCount(res.data?.unread || 0);
    } catch(e) {
      // alerts endpoint may not exist yet — silently ignore
      setAlerts([]);
      setUnreadCount(0);
    }
  };

  const markAlertRead = async (alertId) => {
    try {
      await API.put(`/sector/alerts/${alertId}/read`);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read:true } : a));
      setUnreadCount(prev => Math.max(0, prev-1));
    } catch(e) { console.error(e); }
  };

  const markAllAlertsRead = async () => {
    try {
      await API.put("/sector/alerts/read-all");
      setAlerts(prev => prev.map(a => ({ ...a, read:true })));
      setUnreadCount(0);
    } catch(e) { console.error(e); }
  };

  // ── ACTIONS ──
  const submitResponse = async () => {
    if (!responseText.trim()) { toast.error("Please enter a response"); return; }
    setSubmitting(true);
    try {
      const res = await API.post(`/feedback/${respondFeedback._id}/reply`, { text: responseText });
      toast.success(res.data?.emailSent ? "Reply sent + email delivered" : "Reply sent");
      setRespondFeedback(null);
      setResponseText("");
      const sId = user?.sectorId || 1;
      await loadAll(sId);
      if (tab === "feedback") await loadAllFeedback();
    } catch(e) { toast.error("Failed to send reply"); }
    finally { setSubmitting(false); }
  };

  const handleResolve = async (id) => {
    try {
      await API.put(`/sector/feedback/${id}/resolve`);
      toast.success("Marked as resolved");
      const sId = user?.sectorId || 1;
      await loadAll(sId);
      if (tab === "feedback") await loadAllFeedback();
    } catch(e) { toast.error("Failed to resolve"); }
  };

  const handleExportCSV = async () => {
    try {
      const sId = user?.sectorId || 1;
      const res = await API.get(`/sector/${sId}/export/csv`, { responseType:"blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `sector-${sId}-feedback-${Date.now()}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch(e) { toast.error("Export failed"); }
  };

  const handleExportPDF = () => {
    const data = tab === "feedback" ? allFeedbacks : recentFeedbacks;
    const win  = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Sector ${user.sectorId} Report</title>
      <style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#0B2A4A}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background:#0B2A4A;color:#fff;padding:10px;text-align:left}
      td{border:1px solid #ddd;padding:8px}tr:nth-child(even){background:#f9f9f9}
      .stats{display:flex;gap:20px;margin:20px 0}.stat{background:#F0F4FA;padding:16px;border-radius:8px;flex:1;text-align:center}
      .stat h3{color:#C8961E;font-size:28px;margin:0}.footer{text-align:center;margin-top:30px;font-size:12px;color:#888}
      </style></head><body>
      <h1>MINT Navigator — ${sector || "Sector"} Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <div class="stats">
        <div class="stat"><h3>${stats.totalFeedback||0}</h3><p>Total Feedback</p></div>
        <div class="stat"><h3>${stats.avgRating||0}★</h3><p>Avg Rating</p></div>
        <div class="stat"><h3>${stats.responseRate||0}%</h3><p>Response Rate</p></div>
        <div class="stat"><h3>${stats.pendingCount||0}</h3><p>Pending</p></div>
      </div>
      <h2>Feedback List</h2>
      <table><thead><tr><th>Date</th><th>Rating</th><th>Visitor</th><th>Department</th><th>Comment</th><th>Status</th></tr></thead>
      <tbody>${data.map(f => `<tr>
        <td>${new Date(f.createdAt).toLocaleDateString()}</td>
        <td>${f.rating}★</td>
        <td>${f.visitor||"Anonymous"}</td>
        <td>${f.departmentName||"—"}</td>
        <td>${(f.comment||"").substring(0,80)}</td>
        <td>${f.resolved?"Resolved":f.response?"Responded":"Pending"}</td>
      </tr>`).join("")}</tbody></table>
      <div class="footer"><p>Ministry of Innovation & Technology 🇪🇹</p></div>
      </body></html>`);
    win.document.close(); win.print();
    toast.success("PDF report generated");
  };

  const updateProfile = async () => {
    setUpdatingProfile(true);
    try {
      await API.put("/sector/profile/update", {
        name: profileForm.name, email: profileForm.email, avatar: profileForm.avatar,
      });
      const updated = { ...user, name:profileForm.name, email:profileForm.email };
      localStorage.setItem("adminUser", JSON.stringify(updated));
      setUser(updated);
      toast.success("Profile updated");
    } catch(e) { toast.error("Failed to update profile"); }
    finally { setUpdatingProfile(false); }
  };

  const changePassword = async () => {
    if (passwordForm.new_ !== passwordForm.confirm) { toast.error("Passwords don't match"); return; }
    if (passwordForm.new_.length < 6) { toast.error("Min 6 characters"); return; }
    setUpdatingPassword(true);
    try {
      await API.put("/sector/profile/change-password", {
        currentPassword: passwordForm.current, newPassword: passwordForm.new_,
      });
      setPasswordForm({ current:"", new_:"", confirm:"" });
      toast.success("Password changed");
    } catch(e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setUpdatingPassword(false); }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const MENU = [
    { id:"dashboard",   label:"Dashboard",    icon:<FiHome size={16}/> },
    { id:"feedback",    label:"All Feedback",  icon:<FiMessageSquare size={16}/> },
    { id:"performance", label:"Performance",   icon:<FiBarChart2 size={16}/> },
    { id:"reports",     label:"Reports",       icon:<FiFileText size={16}/> },
    { id:"alerts",      label:"Alerts",        icon:<FiAlertCircle size={16}/>, badge: unreadCount },
    { id:"settings",    label:"Settings",      icon:<FiSettings size={16}/> },
  ];

  // ── RENDER TABS ──

  const DashboardTab = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: T.navy }}>
          {greeting()}, {user.name || "Sector Manager"}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
          {sector} · Sector {user.sectorId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Total Feedback",   val: stats.totalFeedback||0,    color: T.navy, icon:<FiMessageSquare size={18}/> },
          { label:"Average Rating",   val: `${stats.avgRating||0}★`,  color: T.gold, icon:<FiStar size={18}/> },
          { label:"Response Rate",    val: `${stats.responseRate||0}%`,color:"#6366F1",icon:<FiTrendingUp size={18}/> },
          { label:"Pending",          val: stats.pendingCount||0,      color:"#EF4444",icon:<FiClock size={18}/> },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y:-2 }}
            className="rounded-2xl p-4" style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 2px 8px rgba(11,42,74,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase" style={{ color: T.textMuted, letterSpacing:"0.10em" }}>{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background:`${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Alerts banner */}
      {unreadCount > 0 && (
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background:"rgba(239,68,68,0.06)", border:"1.5px solid rgba(239,68,68,0.20)" }}>
          <div className="flex items-center gap-2">
            <FiAlertCircle size={16} style={{ color:"#EF4444" }} />
            <span className="text-sm font-bold" style={{ color:"#B91C1C" }}>
              {unreadCount} unread alert{unreadCount > 1 ? "s" : ""} from General Feedback Manager
            </span>
          </div>
          <button onClick={() => setTab("alerts")}
            className="text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background:"#EF4444", color:"#fff" }}>
            View Alerts
          </button>
        </div>
      )}

      {/* Recent feedback */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:`1px solid ${T.border}` }}>
          <h2 className="font-bold" style={{ color: T.navy }}>Recent Feedback</h2>
          <button onClick={() => setTab("feedback")} className="text-xs font-bold" style={{ color: T.gold }}>
            View All →
          </button>
        </div>
        {recentFeedbacks.length === 0 ? (
          <div className="py-12 text-center" style={{ color: T.textMuted }}>
            <FiMessageSquare size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No feedback yet</p>
          </div>
        ) : recentFeedbacks.map(fb => (
          <div key={fb._id} className="px-5 py-4"
            style={{ borderBottom:`1px solid ${T.border}`, borderLeft:`3px solid ${fb.rating <= 2 ? "#EF4444" : fb.rating >= 5 ? "#10B981" : T.border}` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <StarRow rating={fb.rating} />
                  <StatusBadge feedback={fb} />
                  {fb.departmentName && <span className="text-xs font-semibold" style={{ color: T.gold }}>📍 {fb.departmentName}</span>}
                </div>
                <p className="text-sm line-clamp-1" style={{ color: T.textSub }}>{fb.comment || "No comment"}</p>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: T.textMuted }}>
                  <span><FiUser size={10} className="inline mr-1"/>{fb.visitor||"Anonymous"}</span>
                  <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setViewFeedback(fb)}
                  className="p-1.5 rounded-lg" style={{ background: T.surface, color: T.navy }}>
                  <FiEye size={13}/>
                </button>
                {!fb.response && (
                  <button onClick={() => { setRespondFeedback(fb); setResponseText(""); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: T.navy, color: T.goldLight }}>
                    Respond
                  </button>
                )}
                {fb.response && !fb.resolved && (
                  <button onClick={() => handleResolve(fb._id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Performance */}
      {deptPerformance.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          <div className="px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
            <h2 className="font-bold" style={{ color: T.navy }}>Department Performance</h2>
          </div>
          <div className="p-5 space-y-3">
            {deptPerformance.map(d => (
              <div key={d.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: T.text }}>{d.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: T.textMuted }}>{d.feedbackCount} reviews</span>
                    <span className="text-sm font-black" style={{ color: (d.rating||0) < 3 ? "#EF4444" : (d.rating||0) >= 4 ? "#10B981" : T.gold }}>
                      {(d.rating||0).toFixed(1)}★
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width:`${((d.rating||0)/5)*100}%`,
                      background: (d.rating||0) < 3 ? "#EF4444" : (d.rating||0) >= 4 ? "#10B981" : T.gold,
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const FeedbackTab = () => (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}` }}>
      <div className="px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold" style={{ color: T.navy }}>All Feedback</h2>
            <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
              {pagination.total} total · {sector}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
              <FiFilter size={12}/> Filters
            </button>
            <button onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
              <FiDownload size={12}/> CSV
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t" style={{ borderColor: T.border }}>
            {[
              { key:"status", options:[["all","All Status"],["pending","Pending"],["responded","Responded"],["resolved","Resolved"]] },
            ].map(f => (
              <select key={f.key} value={filters[f.key]}
                onChange={e => setFilters(prev => ({ ...prev, [f.key]:e.target.value }))}
                className="px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                {f.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
            <select value={filters.department}
              onChange={e => setFilters(prev => ({ ...prev, department:e.target.value }))}
              className="px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
              <option value="all">All Departments</option>
              {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="relative">
              <FiSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }}/>
              <input type="text" value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search:e.target.value }))}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
            </div>
            <select value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy:e.target.value }))}
              className="px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
              <option value="date">Sort: Date</option>
              <option value="rating">Sort: Rating</option>
              <option value="department">Sort: Dept</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
        </div>
      ) : allFeedbacks.length === 0 ? (
        <div className="py-12 text-center" style={{ color: T.textMuted }}>
          <FiMessageSquare size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm font-semibold">No feedback found</p>
        </div>
      ) : (
        <div>
          {allFeedbacks.map(fb => (
            <div key={fb._id} className="px-5 py-4"
              style={{ borderBottom:`1px solid ${T.border}`, borderLeft:`3px solid ${fb.rating<=2?"#EF4444":fb.rating>=5?"#10B981":T.border}` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StarRow rating={fb.rating} />
                    <StatusBadge feedback={fb} />
                    {fb.departmentName && <span className="text-xs" style={{ color: T.gold }}>📍 {fb.departmentName}</span>}
                  </div>
                  <p className="text-sm" style={{ color: T.textSub }}>{fb.comment || "No comment"}</p>
                  <div className="flex gap-3 mt-1 text-xs" style={{ color: T.textMuted }}>
                    <span><FiUser size={10} className="inline mr-1"/>{fb.visitor||"Anonymous"}</span>
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    {fb.visitorEmail && <span>{fb.visitorEmail}</span>}
                  </div>
                  {fb.response && (
                    <div className="mt-2 p-2 rounded-xl text-xs" style={{ background:"rgba(11,42,74,0.04)", borderLeft:`2px solid ${T.gold}`, color: T.textSub }}>
                      <span className="font-bold" style={{ color: T.gold }}>Response: </span>{fb.response}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setViewFeedback(fb)}
                    className="p-1.5 rounded-lg" style={{ background: T.surface, color: T.navy }}>
                    <FiEye size={13}/>
                  </button>
                  {!fb.response && (
                    <button onClick={() => { setRespondFeedback(fb); setResponseText(""); }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: T.navy, color: T.goldLight }}>
                      Respond
                    </button>
                  )}
                  {fb.response && !fb.resolved && (
                    <button onClick={() => handleResolve(fb._id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop:`1px solid ${T.border}` }}>
              <span className="text-xs" style={{ color: T.textMuted }}>
                {pagination.total} total · Page {pagination.page}/{pagination.pages}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPagination(p => ({...p, page:p.page-1}))} disabled={pagination.page===1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40"
                  style={{ background: T.surface, border:`1px solid ${T.border}` }}>
                  <FiChevronLeft size={14}/>
                </button>
                <button onClick={() => setPagination(p => ({...p, page:p.page+1}))} disabled={pagination.page===pagination.pages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40"
                  style={{ background: T.surface, border:`1px solid ${T.border}` }}>
                  <FiChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const PerformanceTab = () => {
    const dist = stats.ratingDistribution || {1:0,2:0,3:0,4:0,5:0};
    const total = Object.values(dist).reduce((a,b) => a+b, 0) || 1;
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-black" style={{ color: T.navy }}>Performance Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Rating distribution */}
          <div className="rounded-2xl p-5" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <h3 className="font-bold mb-4" style={{ color: T.navy }}>Rating Distribution</h3>
            <div className="space-y-3">
              {[5,4,3,2,1].map(star => {
                const cnt = dist[star] || 0;
                const pct = Math.round((cnt/total)*100);
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-4" style={{ color: T.text }}>{star}★</span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: T.border }}>
                      <div className="h-full rounded-full"
                        style={{ width:`${pct}%`, background: star>=4?"#10B981":star===3?T.gold:"#EF4444" }} />
                    </div>
                    <span className="text-xs w-8 text-right font-semibold" style={{ color: T.textMuted }}>{cnt}</span>
                    <span className="text-xs w-8 text-right" style={{ color: T.textMuted }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="rounded-2xl p-5" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <h3 className="font-bold mb-4" style={{ color: T.navy }}>Sector Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Total Feedback",  val: stats.totalFeedback||0,         color: T.navy },
                { label:"Avg Rating",      val: `${stats.avgRating||0}★`,       color: T.gold },
                { label:"Response Rate",   val: `${stats.responseRate||0}%`,     color:"#6366F1" },
                { label:"Departments",     val: stats.departmentCount||deptPerformance.length||0, color:"#10B981" },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: T.surface, border:`1px solid ${T.border}` }}>
                  <div className="text-xs font-bold mb-1" style={{ color: T.textMuted }}>{s.label}</div>
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department rankings */}
        {deptPerformance.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <div className="px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
              <h3 className="font-bold" style={{ color: T.navy }}>Department Rankings</h3>
            </div>
            <div className="divide-y" style={{ borderColor: T.border }}>
              {[...deptPerformance].sort((a,b) => (b.rating||0)-(a.rating||0)).map((d,i) => (
                <div key={d.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="font-black text-lg w-7" style={{ color: i<3 ? T.gold : T.textMuted }}>#{i+1}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: T.text }}>{d.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{d.feedbackCount} reviews · {d.responseRate||0}% response</div>
                  </div>
                  <span className="font-black" style={{ color: (d.rating||0)<3?"#EF4444":(d.rating||0)>=4?"#10B981":T.gold }}>
                    {(d.rating||0).toFixed(1)}★
                  </span>
                  {(d.rating||0) < 3 && <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background:"rgba(239,68,68,0.10)", color:"#DC2626" }}>⚠ Low</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ReportsTab = () => (
    <div className="space-y-5">
      <h1 className="text-2xl font-black" style={{ color: T.navy }}>Reports</h1>
      <div className="rounded-2xl p-5 space-y-4" style={{ background: T.card, border:`1px solid ${T.border}` }}>
        <h3 className="font-bold" style={{ color: T.navy }}>Generate Report</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>From Date</label>
            <input type="date" value={reportStart} onChange={e => setReportStart(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>To Date</label>
            <input type="date" value={reportEnd} onChange={e => setReportEnd(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.navy }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            <FiDownload size={14}/> Export CSV
          </button>
          <button onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: T.navy, color: T.goldLight }}
            onMouseEnter={e => (e.currentTarget.style.background = T.navyLight)}
            onMouseLeave={e => (e.currentTarget.style.background = T.navy)}>
            <FiFileText size={14}/> Export PDF
          </button>
        </div>
      </div>

      {/* Quick stats for report preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total Feedback",  val: stats.totalFeedback||0,    color: T.navy },
          { label:"Avg Rating",      val:`${stats.avgRating||0}★`,   color: T.gold },
          { label:"Response Rate",   val:`${stats.responseRate||0}%`, color:"#6366F1" },
          { label:"Pending",         val: stats.pendingCount||0,      color:"#EF4444" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <div className="text-xs font-bold mb-1 uppercase" style={{ color: T.textMuted, letterSpacing:"0.10em" }}>{s.label}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: T.navy }}>Alerts Inbox</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
            Performance alerts from General Feedback Manager
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
            <FiRefreshCw size={12}/> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAlertsRead}
              className="text-xs font-bold px-3 py-2 rounded-xl"
              style={{ background:"rgba(11,42,74,0.08)", color: T.navy }}>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          <FiAlertCircle size={36} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold" style={{ color: T.textMuted }}>No alerts yet</p>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>
            Alerts from the General Feedback Manager will appear here
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          {alerts.map((alert, i) => (
            <div key={alert.id}
              className="px-5 py-4 cursor-pointer transition-colors"
              style={{
                borderBottom: i < alerts.length-1 ? `1px solid ${T.border}` : "none",
                borderLeft: `3px solid ${alert.read ? T.border : "#EF4444"}`,
                background: alert.read ? "transparent" : "rgba(239,68,68,0.02)",
              }}
              onClick={() => !alert.read && markAlertRead(alert.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:"#EF4444" }} />
                    )}
                    <span className="text-xs font-bold uppercase" style={{ color:"#EF4444", letterSpacing:"0.10em" }}>
                      ⚠ Performance Alert
                    </span>
                    <span className="text-xs" style={{ color: T.textMuted }}>
                      from {alert.from || "General Feedback Manager"}
                    </span>
                  </div>
                  {alert.departmentName && (
                    <div className="text-sm font-bold mb-1" style={{ color: T.text }}>
                      Department: {alert.departmentName}
                    </div>
                  )}
                  {(alert.rating || alert.responseRate) && (
                    <div className="flex items-center gap-3 mb-2">
                      {alert.rating && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background:"rgba(239,68,68,0.10)", color:"#DC2626" }}>
                          Rating: {Number(alert.rating).toFixed(1)}★
                        </span>
                      )}
                      {alert.responseRate !== null && alert.responseRate !== undefined && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background:"rgba(245,158,11,0.10)", color:"#D97706" }}>
                          Response: {alert.responseRate}%
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: T.textSub }}>
                    {alert.message}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs" style={{ color: T.textMuted }}>
                  {new Date(alert.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-black" style={{ color: T.navy }}>Settings</h1>

      {/* Profile */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: T.card, border:`1px solid ${T.border}` }}>
        <div className="flex items-center gap-2 mb-1">
          <FiUser size={15} style={{ color: T.gold }} />
          <h3 className="font-bold" style={{ color: T.navy }}>Profile Information</h3>
        </div>
        {[
          { label:"Name",  val: profileForm.name,  key:"name",  type:"text" },
          { label:"Email", val: profileForm.email, key:"email", type:"email" },
          { label:"Avatar URL", val: profileForm.avatar, key:"avatar", type:"url" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>{f.label}</label>
            <input type={f.type} value={f.val}
              onChange={e => setProfileForm(p => ({ ...p, [f.key]:e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
              onFocus={e => (e.target.style.borderColor = T.gold)}
              onBlur={e => (e.target.style.borderColor = T.border)} />
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
            style={{ background:"rgba(11,42,74,0.08)", color: T.navy }}>
            <FiShield size={11}/> Sector Manager · Sector {user.sectorId}
          </span>
        </div>
        <button onClick={updateProfile} disabled={updatingProfile}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
          style={{ background: T.navy, color: T.goldLight }}>
          {updatingProfile ? "Saving…" : <><FiSave size={14}/> Save Profile</>}
        </button>
      </div>

      {/* Password */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: T.card, border:`1px solid ${T.border}` }}>
        <div className="flex items-center gap-2 mb-1">
          <FiLock size={15} style={{ color: T.gold }} />
          <h3 className="font-bold" style={{ color: T.navy }}>Change Password</h3>
        </div>
        {[
          { label:"Current Password",  key:"current",  val: passwordForm.current },
          { label:"New Password",      key:"new_",     val: passwordForm.new_ },
          { label:"Confirm Password",  key:"confirm",  val: passwordForm.confirm },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>{f.label}</label>
            <input type="password" value={f.val}
              onChange={e => setPasswordForm(p => ({ ...p, [f.key]:e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
              onFocus={e => (e.target.style.borderColor = T.gold)}
              onBlur={e => (e.target.style.borderColor = T.border)} />
          </div>
        ))}
        <button onClick={changePassword} disabled={updatingPassword}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
          style={{ background: T.navy, color: T.goldLight }}>
          {updatingPassword ? "Saving…" : <><FiLock size={14}/> Change Password</>}
        </button>
      </div>
    </div>
  );

  const TAB_CONTENT = {
    dashboard:   <DashboardTab />,
    feedback:    <FeedbackTab />,
    performance: <PerformanceTab />,
    reports:     <ReportsTab />,
    alerts:      <AlertsTab />,
    settings:    <SettingsTab />,
  };

  // ── MAIN RENDER ──
  return (
    <div className="min-h-screen flex" style={{ background: T.surface }}>
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `} style={{ background: T.navyDark }}>
        <div style={{ height:3, background:`linear-gradient(90deg, ${T.gold}, ${T.goldLight}, ${T.gold})` }} />

        {/* Brand */}
        <div className="px-5 py-5 border-b" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)" }}>
              🏛️
            </div>
            <div>
              <div className="font-bold text-white text-sm">MINT Navigator</div>
              <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.38)" }}>Sector Manager</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background:`linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navyDark }}>
              {user.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name || "Manager"}</div>
              <div className="text-xs truncate" style={{ color: T.goldLight }}>
                {sector || `Sector ${user.sectorId}`}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-5 space-y-1 overflow-y-auto">
          {MENU.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
              style={{
                background: tab === item.id ? "rgba(200,150,30,0.15)" : "transparent",
                border: tab === item.id ? "1px solid rgba(200,150,30,0.25)" : "1px solid transparent",
                color: tab === item.id ? T.goldLight : "rgba(255,255,255,0.60)",
              }}>
              {item.icon}
              <span className="text-sm font-semibold flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background:"#EF4444", color:"#fff" }}>
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background:"rgba(239,68,68,0.10)", color:"#FCA5A5", border:"1px solid rgba(239,68,68,0.20)" }}>
            <FiLogOut size={15}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
          style={{ background: T.card, borderBottom:`1px solid ${T.border}`, boxShadow:"0 1px 12px rgba(11,42,74,0.06)" }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg" style={{ background: T.surface }}
              onClick={() => setSidebarOpen(o => !o)}>
              {sidebarOpen ? <FiX size={18}/> : <FiMenu size={18}/>}
            </button>
            <div>
              <h2 className="text-sm font-bold" style={{ color: T.navy }}>
                {MENU.find(m => m.id === tab)?.label || "Dashboard"}
              </h2>
              <p className="text-xs" style={{ color: T.textMuted }}>{sector || `Sector ${user.sectorId}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Alerts bell */}
            <button onClick={() => setTab("alerts")}
              className="relative p-2 rounded-xl" style={{ background: T.surface }}>
              <FiAlertCircle size={17} style={{ color: unreadCount > 0 ? "#EF4444" : T.textMuted }} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ background:"#EF4444", color:"#fff", fontSize:9 }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {/* Feedback notifications */}
            <button onClick={() => setShowNotifications(o => !o)}
              className="relative p-2 rounded-xl" style={{ background: T.surface }}>
              <FiBell size={17} style={{ color: pendingCount > 0 ? T.gold : T.textMuted }} />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ background: T.gold, color: T.navyDark, fontSize:9 }}>
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Notification dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div className="absolute top-16 right-4 w-80 z-40 rounded-2xl overflow-hidden"
              style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 16px 40px rgba(0,0,0,0.15)" }}
              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom:`1px solid ${T.border}` }}>
                <span className="text-sm font-bold" style={{ color: T.navy }}>Pending Feedback ({pendingCount})</span>
                <button onClick={() => setShowNotifications(false)}><FiX size={16} style={{ color: T.textMuted }}/></button>
              </div>
              <div style={{ maxHeight:300, overflowY:"auto" }}>
                {notifications.slice(0,8).map(n => (
                  <div key={n.id} className="px-4 py-3" style={{ borderBottom:`1px solid ${T.border}` }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <StarRow rating={n.feedback?.rating || 0} />
                      {n.dept && <span className="text-xs" style={{ color: T.gold }}>{n.dept}</span>}
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: T.textSub }}>{n.message}</p>
                    <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{n.time}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="py-8 text-center text-sm" style={{ color: T.textMuted }}>No pending feedback</div>
                )}
              </div>
              <div className="px-4 py-2" style={{ borderTop:`1px solid ${T.border}` }}>
                <button onClick={() => { setTab("feedback"); setFilters(f => ({...f, status:"pending"})); setShowNotifications(false); }}
                  className="w-full text-xs font-bold py-2 rounded-xl" style={{ background: T.navy, color: T.goldLight }}>
                  View All Pending
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-7 overflow-auto">
          {loading && tab === "dashboard" ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
            </div>
          ) : TAB_CONTENT[tab]}
        </main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 bg-black/50 z-20 md:hidden"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* View feedback modal */}
      <AnimatePresence>
        {viewFeedback && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="rounded-2xl overflow-hidden w-full max-w-lg"
              style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}
              initial={{ scale:0.92, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.92, y:20 }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom:`1px solid ${T.border}`, background: T.surface }}>
                <h3 className="font-bold" style={{ color: T.navy }}>Feedback Detail</h3>
                <button onClick={() => setViewFeedback(null)}><FiX size={18} style={{ color: T.textMuted }}/></button>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <StarRow rating={viewFeedback.rating} />
                  <StatusBadge feedback={viewFeedback} />
                </div>
                {viewFeedback.departmentName && <p className="text-sm font-semibold" style={{ color: T.gold }}>📍 {viewFeedback.departmentName}</p>}
                <div className="p-3 rounded-xl text-sm" style={{ background: T.surface, color: T.textSub }}>
                  {viewFeedback.comment || "No comment"}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg" style={{ background: T.surface }}>
                    <span style={{ color: T.textMuted }}>Visitor: </span>
                    <span className="font-semibold" style={{ color: T.text }}>{viewFeedback.visitor||"Anonymous"}</span>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: T.surface }}>
                    <span style={{ color: T.textMuted }}>Date: </span>
                    <span className="font-semibold" style={{ color: T.text }}>{new Date(viewFeedback.createdAt).toLocaleDateString()}</span>
                  </div>
                  {viewFeedback.visitorEmail && (
                    <div className="p-2 rounded-lg col-span-2" style={{ background: T.surface }}>
                      <FiMail size={10} className="inline mr-1" style={{ color: T.textMuted }}/>
                      <span style={{ color: T.text }}>{viewFeedback.visitorEmail}</span>
                    </div>
                  )}
                </div>
                {viewFeedback.response && (
                  <div className="p-3 rounded-xl" style={{ background:"rgba(11,42,74,0.05)", borderLeft:`3px solid ${T.gold}` }}>
                    <p className="text-xs font-bold mb-1" style={{ color: T.gold }}>Your Response:</p>
                    <p className="text-sm" style={{ color: T.textSub }}>{viewFeedback.response}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  {!viewFeedback.response && (
                    <button onClick={() => { setRespondFeedback(viewFeedback); setResponseText(""); setViewFeedback(null); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                      style={{ background: T.navy, color: T.goldLight }}>
                      Respond
                    </button>
                  )}
                  {viewFeedback.response && !viewFeedback.resolved && (
                    <button onClick={() => { handleResolve(viewFeedback._id); setViewFeedback(null); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                      style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                      Mark Resolved
                    </button>
                  )}
                  <button onClick={() => setViewFeedback(null)}
                    className="py-2.5 px-4 rounded-xl text-sm font-semibold"
                    style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Respond modal */}
      <AnimatePresence>
        {respondFeedback && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="rounded-2xl overflow-hidden w-full max-w-lg"
              style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}
              initial={{ scale:0.92, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.92, y:20 }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom:`1px solid ${T.border}`, background:`linear-gradient(135deg, ${T.navy}, ${T.navyLight})` }}>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <FiSend size={14} style={{ color: T.goldLight }}/> Send Response
                  </h3>
                  {respondFeedback.departmentName && (
                    <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.55)" }}>
                      📍 {respondFeedback.departmentName}
                    </p>
                  )}
                </div>
                <button onClick={() => setRespondFeedback(null)}>
                  <FiX size={18} style={{ color:"rgba(255,255,255,0.55)" }}/>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-xl" style={{ background: T.surface, border:`1px solid ${T.border}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRow rating={respondFeedback.rating} />
                    <span className="text-xs" style={{ color: T.textMuted }}>{respondFeedback.visitor||"Anonymous"}</span>
                  </div>
                  <p className="text-sm" style={{ color: T.textSub }}>"{respondFeedback.comment || "No comment"}"</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>
                    Your Response (visitor will receive email notification)
                  </label>
                  <textarea rows={5} value={responseText} onChange={e => setResponseText(e.target.value)}
                    placeholder="Write your response here…"
                    className="w-full text-sm p-3 rounded-xl focus:outline-none resize-none"
                    style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text, lineHeight:1.6 }}
                    onFocus={e => (e.target.style.borderColor = T.gold)}
                    onBlur={e => (e.target.style.borderColor = T.border)} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setRespondFeedback(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                    Cancel
                  </button>
                  <button onClick={submitResponse} disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: T.navy, color: T.goldLight }}>
                    {submitting ? "Sending…" : <><FiSend size={14}/> Send Response</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
