import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiInbox, FiStar, FiSearch, FiUser, FiMapPin,
  FiCalendar, FiRefreshCw, FiAlertTriangle,
  FiCheckCircle, FiClock, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { departmentService } from "../../services/departmentService";
import { toast } from "react-hot-toast";

const T = {
  navy: "#086976", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", card: "#FFFFFF", border: "#D8E2EF",
  text: "#086976", textSub: "#4A5568", textMuted: "#8896A6",
};

export default function Inbox() {
  const [loading,     setLoading]     = useState(true);
  const [feedbacks,   setFeedbacks]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters,     setFilters]     = useState({ status:"all", building:"all", rating:"all", department:"all", search:"" });
  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState({ total:0, pages:1 });

  useEffect(() => {
    departmentService.getAll().then(d => setDepartments(d||[])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filters, page]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        page, limit: 15,
        ...(filters.status   !== "all" && { status:     filters.status }),
        ...(filters.building !== "all" && { building:   filters.building }),
        ...(filters.rating   !== "all" && { minRating:  filters.rating }),
        ...(filters.department !== "all" && { department: filters.department }),
      };
      const res = await analyticsService.getInbox(params);
      setFeedbacks(res?.data || []);
      setPagination(res?.pagination || { total:0, pages:1 });
    } catch(e) {
      toast.error("Failed to load feedback");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (k, v) => { setFilters(f => ({...f, [k]: v})); setPage(1); };

  const statusBadge = (fb) => {
    if (fb.resolved) return <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1" style={{ background:"rgba(16,185,129,0.10)", color:"#059669" }}><FiCheckCircle size={10}/>Resolved</span>;
    if (fb.response) return <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background:"rgba(99,102,241,0.10)", color:"#6366F1" }}>Responded</span>;
    return <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1" style={{ background:"rgba(245,158,11,0.10)", color:"#D97706" }}><FiClock size={10}/>Pending</span>;
  };

  const filteredLocal = filters.search
    ? feedbacks.filter(fb =>
        (fb.comment||"").toLowerCase().includes(filters.search.toLowerCase()) ||
        (fb.visitor||"").toLowerCase().includes(filters.search.toLowerCase()) ||
        (fb.deptName||"").toLowerCase().includes(filters.search.toLowerCase()))
    : feedbacks;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: T.navy }}>Feedback Inbox</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
            Read-only view — responses are handled by department heads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background:"rgba(99,102,241,0.10)", color:"#6366F1", border:"1px solid rgba(99,102,241,0.20)" }}>
            👁 View Only
          </div>
          <button onClick={() => { setPage(1); load(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total",    val: pagination.total,                                                      color: T.navy },
          { label:"Pending",  val: feedbacks.filter(f => !f.response && !f.resolved).length,              color: "#D97706" },
          { label:"Responded",val: feedbacks.filter(f => f.response && !f.resolved).length,               color: "#6366F1" },
          { label:"Resolved", val: feedbacks.filter(f => f.resolved).length,                              color: "#10B981" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: T.textMuted, letterSpacing:"0.10em" }}>{s.label}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3" style={{ background: T.card, border:`1px solid ${T.border}` }}>
        <div className="relative flex-1">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }} />
          <input type="text" placeholder="Search feedback, visitor, department…"
            value={filters.search} onChange={e => setFilter("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
        </div>
        {[
          { key:"status",   options:[["all","All Status"],["pending","Pending"],["responded","Responded"]] },
          { key:"building", options:[["all","All Buildings"],["A","Building A"],["B","Building B"]] },
          { key:"rating",   options:[["all","All Ratings"],["5","5★ Excellent"],["4","4★ Good"],["3","3★ Neutral"],["2","2★ Poor"],["1","1★ Critical"]] },
        ].map(f => (
          <select key={f.key} value={filters[f.key]} onChange={e => setFilter(f.key, e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
            style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
            {f.options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <select value={filters.department} onChange={e => setFilter("department", e.target.value)}
          className="px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
          style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name?.en || d.name || ""}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
        </div>
      ) : filteredLocal.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          <FiInbox size={36} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold" style={{ color: T.textMuted }}>No feedback found</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(11,42,74,0.06)" }}>
          {filteredLocal.map((fb, i) => {
            const isLow  = fb.rating <= 2;
            const isHigh = fb.rating >= 5;
            return (
              <motion.div key={fb._id}
                initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.03 }}
                className="px-5 py-4"
                style={{
                  borderBottom: i < filteredLocal.length-1 ? `1px solid ${T.border}` : "none",
                  borderLeft: `3px solid ${isLow ? "#EF4444" : isHigh ? "#10B981" : T.border}`,
                }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-sm" style={{ color: T.text }}>{fb.deptName || "Unknown Dept"}</span>
                      {isLow && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background:"rgba(239,68,68,0.12)", color:"#DC2626" }}>⚠ Low Rating</span>}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background:"rgba(11,42,74,0.08)", color: T.navy }}>
                        Bldg {fb.building}
                      </span>
                    </div>

                    {/* Stars + meta */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <FiStar key={s} size={13} style={{ color: s<=fb.rating ? T.gold : T.border, fill: s<=fb.rating ? T.gold : "none" }} />
                        ))}
                        <span className="ml-1 text-xs font-bold" style={{ color: T.text }}>{fb.rating}.0</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                        <FiUser size={10}/> {fb.visitor || "Anonymous"}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                        <FiCalendar size={10}/> {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                      {fb.visitorEmail && (
                        <span className="text-xs" style={{ color: T.textMuted }}>{fb.visitorEmail}</span>
                      )}
                    </div>

                    {/* Comment */}
                    {fb.comment && (
                      <div className="p-3 rounded-xl text-sm" style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.textSub }}>
                        "{fb.comment}"
                      </div>
                    )}

                    {/* Response thread */}
                    {fb.response && (
                      <div className="mt-2 p-3 rounded-xl" style={{ background:"rgba(11,42,74,0.04)", border:`1px solid rgba(11,42,74,0.10)` }}>
                        <div className="text-xs font-bold mb-1" style={{ color: T.navy }}>
                          Department Head Response:
                        </div>
                        <p className="text-sm" style={{ color: T.textSub }}>{fb.response}</p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {statusBadge(fb)}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop:`1px solid ${T.border}`, background: T.surface }}>
              <span className="text-xs font-semibold" style={{ color: T.textMuted }}>
                {pagination.total} total · Page {page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{ background: T.card, border:`1px solid ${T.border}` }}>
                  <FiChevronLeft size={14} style={{ color: T.navy }} />
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))} disabled={page === pagination.pages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{ background: T.card, border:`1px solid ${T.border}` }}>
                  <FiChevronRight size={14} style={{ color: T.navy }} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
