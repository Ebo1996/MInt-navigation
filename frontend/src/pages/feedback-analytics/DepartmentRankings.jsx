import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrendingUp, FiTrendingDown, FiMinus,
  FiSearch, FiDownload, FiEye, FiAlertTriangle,
  FiAward, FiX, FiSend, FiRefreshCw,
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { sectorService } from "../../services/sectorService";
import { toast } from "react-hot-toast";

const T = {
  navy: "#0B2A4A", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", card: "#FFFFFF", border: "#D8E2EF",
  text: "#0B2A4A", textSub: "#4A5568", textMuted: "#8896A6",
};

export default function DepartmentRankings() {
  const [loading,    setLoading]    = useState(true);
  const [all,        setAll]        = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [sectors,    setSectors]    = useState([]);
  const [search,     setSearch]     = useState("");
  const [building,   setBuilding]   = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy,     setSortBy]     = useState("rating");
  const [order,      setOrder]      = useState("desc");
  const [alertDept,  setAlertDept]  = useState(null);
  const [alertMsg,   setAlertMsg]   = useState("");
  const [alertSector, setAlertSector] = useState("");
  const [sending,    setSending]    = useState(false);

  // Load sectors for filter + alert selector
  useEffect(() => {
    sectorService.getPublicSectors()
      .then(d => setSectors(Array.isArray(d) ? d : []))
      .catch(() => setSectors([]));
  }, []);

  // Reload rankings when sort changes
  useEffect(() => { load(); }, [sortBy, order]);

  // Re-filter locally when search/building/sectorFilter changes
  useEffect(() => { applyFilter(); }, [all, search, building, sectorFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getRankings({ sortBy, order });
      setAll(Array.isArray(data) ? data : []);
    } catch(e) {
      toast.error("Failed to load rankings");
      setAll([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let r = [...all];
    if (building !== "all")
      r = r.filter(d => d?.building === building);
    if (sectorFilter !== "all")
      r = r.filter(d => String(d?.sectorId) === String(sectorFilter));
    if (search.trim())
      r = r.filter(d =>
        (d?.name?.en || d?.name || "").toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(r);
  };

  const toggleSort = (field) => {
    if (sortBy === field) setOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortBy(field); setOrder("desc"); }
  };

  const exportCSV = () => {
    if (!filtered.length) { toast.error("No data to export"); return; }
    const headers = "Rank,Department,Sector ID,Building,Floor,Avg Rating,Total Feedback,Response Rate%,Trend\n";
    const rows = filtered.map((d, i) =>
      `${i+1},"${d?.name?.en || d?.name || ""}",${d?.sectorId||""},${d?.building||""},${d?.floor||""},${(d?.rating||0).toFixed(1)},${d?.totalFeedback||0},${d?.responseRate||0},${(d?.trend||0).toFixed(2)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `MINT_Rankings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Rankings exported as CSV");
  };

  const openAlert = (dept) => {
    setAlertDept(dept);
    setAlertMsg(
      `Dear Sector Manager,\n\nThis is a performance alert for the department "${dept?.name?.en || dept?.name}".\n\nCurrent Rating: ${(dept?.rating||0).toFixed(1)}★\nResponse Rate: ${dept?.responseRate||0}%\n\nPlease review and take action to improve service quality.\n\nRegards,\nGeneral Feedback Manager`
    );
    // Pre-select the sector of this department
    setAlertSector(String(dept?.sectorId || ""));
  };

  const sendAlert = async () => {
    if (!alertMsg.trim()) { toast.error("Please write a message"); return; }
    if (!alertSector) { toast.error("Please select a sector"); return; }
    setSending(true);
    try {
      await analyticsService.sendAlert(
        alertSector,
        alertMsg,
        alertDept?.name?.en || alertDept?.name,
        alertDept?.rating,
        alertDept?.responseRate,
      );
      const sectorName = sectors.find(s => String(s.id) === String(alertSector))?.name?.en || `Sector ${alertSector}`;
      toast.success(`✅ Alert sent to manager of ${sectorName}`);
      setAlertDept(null);
      setAlertMsg("");
      setAlertSector("");
    } catch(e) {
      toast.error("Failed to send alert — check your connection");
    } finally {
      setSending(false);
    }
  };

  const getFlag = (d) => {
    const rating = d?.rating || 0;
    const rr = d?.responseRate || 0;
    if (rating > 0 && rating < 2)  return { color: "#EF4444", label: "🚨 Critical",    bg: "rgba(239,68,68,0.10)" };
    if (rating > 0 && rating < 3)  return { color: "#EF4444", label: "⚠ Low Rating",   bg: "rgba(239,68,68,0.08)" };
    if (rr > 0 && rr < 30)         return { color: "#D97706", label: "🔔 Low Response", bg: "rgba(245,158,11,0.08)" };
    return null;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: `${T.gold} transparent ${T.gold} ${T.gold}` }} />
    </div>
  );

  const sorted = [...all].sort((a,b) => (b?.rating||0) - (a?.rating||0));
  const top3   = sorted.slice(0,3).map(d => d?.id);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: T.navy }}>Performance Rankings</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
            Real-time ratings calculated from actual visitor feedback · {all.length} departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            <FiRefreshCw size={13} /> Refresh
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: T.navy, color: "#fff" }}
            onMouseEnter={e => (e.currentTarget.style.background = T.navyLight)}
            onMouseLeave={e => (e.currentTarget.style.background = T.navy)}>
            <FiDownload size={13} /> CSV
          </button>
        </div>
      </div>

      {/* Top 3 podium — only if they have real feedback */}
      {sorted.filter(d => (d?.totalFeedback||0) > 0).length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {sorted.filter(d => (d?.totalFeedback||0) > 0).slice(0,3).map((d, i) => (
            <motion.div key={d.id} whileHover={{ y: -3 }}
              className="rounded-2xl p-4 text-center"
              style={{
                background: i === 0 ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` : T.card,
                border: `1px solid ${i === 0 ? T.gold : T.border}`,
                boxShadow: i === 0 ? `0 8px 24px rgba(11,42,74,0.20)` : "0 2px 8px rgba(11,42,74,0.06)",
              }}>
              <div className="text-2xl mb-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
              <div className="text-xs font-extrabold truncate px-1" style={{ color: i === 0 ? T.goldLight : T.text }}>
                {(d?.name?.en || d?.name || "").substring(0, 22)}
              </div>
              <div className="text-xl font-black mt-1" style={{ color: i === 0 ? T.goldLight : T.gold }}>
                {(d?.rating || 0).toFixed(1)}★
              </div>
              <div className="text-xs mt-0.5" style={{ color: i === 0 ? "rgba(255,255,255,0.55)" : T.textMuted }}>
                {d?.totalFeedback||0} reviews
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Flagged departments warning bar */}
      {(() => {
        const flagged = all.filter(d => getFlag(d));
        if (!flagged.length) return null;
        return (
          <div className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ background:"#FFF5F5", border:"1.5px solid rgba(239,68,68,0.25)" }}>
            <div className="flex items-center gap-2 flex-1">
              <FiAlertTriangle size={16} style={{ color:"#EF4444", flexShrink:0 }} />
              <span className="text-sm font-bold" style={{ color:"#B91C1C" }}>
                {flagged.length} department{flagged.length > 1 ? "s" : ""} flagged for low performance
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {flagged.slice(0,3).map(d => (
                <button key={d.id} onClick={() => openAlert(d)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl"
                  style={{ background:"#EF4444", color:"#fff" }}>
                  Alert: {(d?.name?.en || d?.name || "").substring(0,14)}…
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
        style={{ background: T.card, border:`1px solid ${T.border}` }}>
        <div className="relative flex-1">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }} />
          <input type="text" placeholder="Search departments…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
        </div>
        <select value={building} onChange={e => setBuilding(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
          style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
          <option value="all">All Buildings</option>
          <option value="A">Building A</option>
          <option value="B">Building B</option>
        </select>
        <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
          style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
          <option value="all">All Sectors</option>
          {sectors.map(s => (
            <option key={s.id} value={String(s.id)}>
              {s.name?.en || s.name || `Sector ${s.id}`}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setOrder("desc"); }}
          className="px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
          style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
          <option value="rating">Sort: Rating</option>
          <option value="totalFeedback">Sort: Feedback Count</option>
          <option value="responseRate">Sort: Response Rate</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          <FiAward size={36} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold" style={{ color: T.textMuted }}>
            {all.length === 0 ? "No departments with feedback yet" : "No departments match your filters"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(11,42,74,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: T.surface, borderBottom:`1px solid ${T.border}` }}>
                  {[
                    { label:"#",           field: null },
                    { label:"Department",  field: "name" },
                    { label:"Bldg",        field: null },
                    { label:"Avg Rating",  field: "rating" },
                    { label:"Feedback",    field: "totalFeedback" },
                    { label:"Response %",  field: "responseRate" },
                    { label:"Trend",       field: null },
                    { label:"Flag",        field: null },
                    { label:"",            field: null },
                  ].map(({ label, field }) => (
                    <th key={label}
                      className="px-4 py-3 text-left text-xs font-bold uppercase select-none"
                      style={{ color: T.textMuted, letterSpacing:"0.10em", cursor: field ? "pointer" : "default" }}
                      onClick={() => field && toggleSort(field)}>
                      <span className="flex items-center gap-1">
                        {label}
                        {field && sortBy === field && (
                          <span style={{ color: T.gold }}>{order === "desc" ? "↓" : "↑"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept, idx) => {
                  const flag     = getFlag(dept);
                  const isTop    = top3.includes(dept?.id) && (dept?.totalFeedback||0) > 0;
                  const deptName = dept?.name?.en || dept?.name || "Unknown";
                  const noFeedback = (dept?.totalFeedback||0) === 0;
                  return (
                    <motion.tr key={dept?.id || idx}
                      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: idx * 0.025 }}
                      style={{ borderBottom:`1px solid ${T.border}`, opacity: noFeedback ? 0.55 : 1 }}
                      onMouseEnter={e => (e.currentTarget.style.background = T.surface)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                      <td className="px-4 py-3">
                        <span className="font-black text-base" style={{ color: idx < 3 && !noFeedback ? T.gold : T.textMuted }}>
                          #{idx + 1}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold" style={{ color: T.text }}>{deptName}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                          Floor {dept?.floor || "—"} · Rm {dept?.room || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background:"rgba(11,42,74,0.08)", color: T.navy }}>
                          {dept?.building || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {noFeedback ? (
                          <span className="text-xs" style={{ color: T.textMuted }}>No feedback</span>
                        ) : (
                          <span className="font-black text-base"
                            style={{ color: (dept?.rating||0) < 3 ? "#EF4444" : (dept?.rating||0) >= 4 ? "#10B981" : T.gold }}>
                            {(dept?.rating || 0).toFixed(1)} ★
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold" style={{ color: T.text }}>
                        {dept?.totalFeedback || 0}
                      </td>

                      <td className="px-4 py-3">
                        {noFeedback ? (
                          <span className="text-xs" style={{ color: T.textMuted }}>—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                              <div className="h-full rounded-full"
                                style={{
                                  width:`${dept?.responseRate || 0}%`,
                                  background: (dept?.responseRate||0) < 30 ? "#EF4444"
                                    : (dept?.responseRate||0) >= 70 ? "#10B981" : T.gold,
                                }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: T.text }}>
                              {dept?.responseRate || 0}%
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {noFeedback ? <span className="text-xs" style={{ color: T.textMuted }}>—</span>
                          : (dept?.trend || 0) > 0.1
                          ? <span className="flex items-center gap-1 text-xs font-bold" style={{ color:"#10B981" }}><FiTrendingUp size={12}/> +{(dept.trend).toFixed(2)}</span>
                          : (dept?.trend || 0) < -0.1
                          ? <span className="flex items-center gap-1 text-xs font-bold" style={{ color:"#EF4444" }}><FiTrendingDown size={12}/> {(dept.trend).toFixed(2)}</span>
                          : <span className="flex items-center gap-1 text-xs font-bold" style={{ color: T.textMuted }}><FiMinus size={12}/> 0.00</span>
                        }
                      </td>

                      <td className="px-4 py-3">
                        {flag ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
                            style={{ background: flag.bg, color: flag.color }}>
                            {flag.label}
                          </span>
                        ) : isTop ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background:"rgba(16,185,129,0.10)", color:"#059669" }}>
                            ★ Top
                          </span>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/feedback-analytics/department/${dept?.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={{ background: T.surface, color: T.navy, border:`1px solid ${T.border}` }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
                            <FiEye size={11}/> View
                          </Link>
                          {flag && (
                            <button onClick={() => openAlert(dept)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold"
                              style={{ background:"#EF4444", color:"#fff" }}>
                              <FiAlertTriangle size={11}/> Alert
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-xs font-semibold" style={{ borderTop:`1px solid ${T.border}`, background: T.surface, color: T.textMuted }}>
            Showing {filtered.length} of {all.length} departments · Ratings calculated from real visitor feedback
          </div>
        </div>
      )}

      {/* Alert modal */}
      <AnimatePresence>
        {alertDept && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="rounded-2xl overflow-hidden w-full max-w-lg"
              style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 24px 60px rgba(0,0,0,0.30)" }}
              initial={{ scale:0.92, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.92, y:20 }}>

              {/* Modal header */}
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom:`1px solid ${T.border}`, background:`linear-gradient(135deg, ${T.navy}, ${T.navyLight})` }}>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <FiAlertTriangle size={14} style={{ color: T.goldLight }} />
                    Send Performance Alert
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.55)" }}>
                    Department: {alertDept?.name?.en || alertDept?.name}
                  </p>
                </div>
                <button onClick={() => setAlertDept(null)}
                  style={{ color:"rgba(255,255,255,0.55)", background:"none", border:"none", cursor:"pointer" }}>
                  <FiX size={18}/>
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Performance summary */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label:"Rating",      val: (alertDept?.rating||0).toFixed(1)+"★", color: (alertDept?.rating||0) < 3 ? "#EF4444" : T.gold },
                    { label:"Response",    val: (alertDept?.responseRate||0)+"%",       color: (alertDept?.responseRate||0) < 30 ? "#EF4444" : "#10B981" },
                    { label:"Feedback",    val: alertDept?.totalFeedback||0,            color: T.navy },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                      style={{ background: T.surface, border:`1px solid ${T.border}` }}>
                      <div className="text-xs font-bold mb-1" style={{ color: T.textMuted }}>{s.label}</div>
                      <div className="font-black text-base" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Send to sector selector */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>
                    Send Alert To (Sector)
                  </label>
                  <select value={alertSector} onChange={e => setAlertSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
                    style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                    <option value="">Select sector manager…</option>
                    {sectors.map(s => (
                      <option key={s.id} value={String(s.id)}>
                        Sector {s.id} — {s.name?.en || s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>
                    Alert Message
                  </label>
                  <textarea rows={6} value={alertMsg} onChange={e => setAlertMsg(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl focus:outline-none resize-none"
                    style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text, lineHeight:1.6 }} />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button onClick={() => setAlertDept(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}>
                    Cancel
                  </button>
                  <button onClick={sendAlert} disabled={sending || !alertSector}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background:"#EF4444", color:"#fff" }}>
                    {sending
                      ? <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:"rgba(255,255,255,0.6) transparent" }}/> Sending…</>
                      : <><FiSend size={14}/> Send Alert</>}
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
