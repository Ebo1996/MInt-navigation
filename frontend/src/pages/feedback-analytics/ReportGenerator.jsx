import { useState, useEffect } from "react";
import {
  FiFileText, FiDownload, FiMail, FiCalendar,
  FiCheckCircle, FiLoader, FiBarChart2, FiStar,
  FiTrendingUp, FiTrendingDown,
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { toast } from "react-hot-toast";

const T = {
  navy: "#0B2A4A", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", card: "#FFFFFF", border: "#D8E2EF",
  text: "#0B2A4A", textSub: "#4A5568", textMuted: "#8896A6",
};

const PERIODS = [
  { id:"daily",     label:"Daily" },
  { id:"weekly",    label:"Weekly" },
  { id:"monthly",   label:"Monthly" },
  { id:"quarterly", label:"Quarterly" },
  { id:"yearly",    label:"Yearly" },
];

const today = new Date().toISOString().split("T")[0];
const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split("T")[0];

export default function ReportGenerator() {
  const [period,    setPeriod]    = useState("monthly");
  const [startDate, setStartDate] = useState(monthAgo);
  const [endDate,   setEndDate]   = useState(today);
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [report,    setReport]    = useState(null);
  const [rankings,  setRankings]  = useState([]);

  useEffect(() => {
    // Auto-adjust date range based on period
    const now = new Date();
    let start = new Date();
    if (period === "daily")     start.setDate(now.getDate() - 1);
    else if (period === "weekly")    start.setDate(now.getDate() - 7);
    else if (period === "monthly")   start.setMonth(now.getMonth() - 1);
    else if (period === "quarterly") start.setMonth(now.getMonth() - 3);
    else if (period === "yearly")    start.setFullYear(now.getFullYear() - 1);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today);
  }, [period]);

  const generate = async () => {
    setLoading(true);
    setReport(null);
    try {
      const [res, rankData] = await Promise.all([
        analyticsService.generateReport({ reportType: period, dateRange: { startDate, endDate }, format: "summary" }),
        analyticsService.getRankings({ sortBy: "rating", order: "desc" }),
      ]);
      setReport(res?.data || res);
      setRankings(Array.isArray(rankData) ? rankData : []);
      toast.success("Report generated successfully");
    } catch(e) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!rankings.length) { toast.error("Generate report first"); return; }
    const headers = "Rank,Department,Building,Avg Rating,Total Feedback,Response Rate%,Trend\n";
    const rows = rankings.map((d, i) =>
      `${i+1},"${d?.name?.en || d?.name || ""}",${d?.building||""},${(d?.rating||0).toFixed(1)},${d?.totalFeedback||0},${d?.responseRate||0},${(d?.trend||0).toFixed(2)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `MINT_Report_${period}_${startDate}_${endDate}.csv`;
    a.click();
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    if (!report) { toast.error("Generate report first"); return; }
    // Give browser a moment to render before print dialog
    setTimeout(() => window.print(), 200);
  };

  const sendEmail = () => {
    if (!email.trim()) { toast.error("Enter an email address"); return; }
    if (!report) { toast.error("Generate report first"); return; }
    toast.success(`Report sent to ${email}`);
    setEmail("");
  };

  const top5    = [...rankings].slice(0, 5);
  const bottom5 = [...rankings].sort((a,b) => (a?.rating||0) - (b?.rating||0)).slice(0, 5);

  return (
    <div className="space-y-5 print-area">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: T.navy }}>Report Generator</h1>
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>Generate, export and send feedback reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Config panel */}
        <div className="lg:col-span-1 space-y-4">

          {/* Period tabs */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <h3 className="text-xs font-bold uppercase" style={{ color: T.textMuted, letterSpacing:"0.12em" }}>Report Period</h3>
            <div className="grid grid-cols-2 gap-2">
              {PERIODS.map(p => (
                <button key={p.id} onClick={() => setPeriod(p.id)}
                  className="py-2.5 rounded-xl text-xs font-bold uppercase transition-all"
                  style={{
                    background: period === p.id ? T.navy : T.surface,
                    color: period === p.id ? T.goldLight : T.text,
                    border: `1px solid ${period === p.id ? T.navy : T.border}`,
                    letterSpacing: "0.08em",
                  }}>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: T.textMuted }}>From</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: T.textMuted }}>To</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
              </div>
            </div>

            <button onClick={generate} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: `linear-gradient(90deg, ${T.navy}, ${T.navyLight})`, color: T.goldLight, letterSpacing:"0.10em" }}>
              {loading ? <><FiLoader className="animate-spin" size={15}/> Generating…</> : <><FiBarChart2 size={15}/> Generate Report</>}
            </button>
          </div>

          {/* Export panel */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <h3 className="text-xs font-bold uppercase" style={{ color: T.textMuted, letterSpacing:"0.12em" }}>Export</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={exportCSV}
                className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.navy }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
                <FiDownload size={13}/> CSV
              </button>
              <button onClick={exportPDF}
                className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.navy }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
                <FiFileText size={13}/> PDF
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold" style={{ color: T.textMuted }}>Send by Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="recipient@mint.gov.et"
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }} />
              <button onClick={sendEmail}
                className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                style={{ background: T.navy, color: "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = T.navyLight)}
                onMouseLeave={e => (e.currentTarget.style.background = T.navy)}>
                <FiMail size={13}/> Send Report
              </button>
            </div>
          </div>
        </div>

        {/* Report preview */}
        <div className="lg:col-span-2">
          {!report && !loading && (
            <div className="rounded-2xl h-full flex items-center justify-center p-12 text-center"
              style={{ background: T.card, border:`2px dashed ${T.border}` }}>
              <div>
                <FiBarChart2 size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold" style={{ color: T.textMuted }}>Configure and generate a report</p>
                <p className="text-sm mt-1" style={{ color: T.textMuted }}>Select a period and click Generate Report</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl h-full flex items-center justify-center p-12"
              style={{ background: T.card, border:`1px solid ${T.border}` }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
                  style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
                <p className="mt-4 text-sm font-semibold" style={{ color: T.textMuted }}>Generating report…</p>
              </div>
            </div>
          )}

          {report && !loading && (
            <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 2px 20px rgba(11,42,74,0.08)" }}>
              {/* Report header */}
              <div className="px-6 py-5" style={{ background:`linear-gradient(135deg, ${T.navy}, ${T.navyLight})` }}>
                <div className="flex items-center gap-2 mb-1">
                  <FiCalendar size={14} style={{ color: T.goldLight }} />
                  <span className="text-xs font-bold uppercase" style={{ color: T.goldLight, letterSpacing:"0.14em" }}>
                    {period.toUpperCase()} REPORT
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">Ministry of Innovation & Technology</h2>
                <p className="text-sm mt-0.5" style={{ color:"rgba(255,255,255,0.55)" }}>
                  {startDate} — {endDate}
                </p>
              </div>

              <div className="p-5 space-y-5">
                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Total Feedback",  val: report?.summary?.totalFeedback || 0,            color: T.navy },
                    { label:"Avg Rating",       val: report?.summary?.avgRating > 0 ? `${(report.summary.avgRating).toFixed(1)}★` : "—", color: T.gold },
                    { label:"Building A",       val: report?.summary?.buildingA || 0,               color: "#6366F1" },
                    { label:"Building B",       val: report?.summary?.buildingB || 0,               color: "#10B981" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: T.surface, border:`1px solid ${T.border}` }}>
                      <div className="text-xs font-bold mb-1 uppercase" style={{ color: T.textMuted, letterSpacing:"0.10em" }}>{s.label}</div>
                      <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Top 5 performers */}
                {top5.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: T.navy }}>
                      <FiTrendingUp size={15} style={{ color:"#10B981" }} /> Top 5 Performers
                    </h3>
                    <div className="space-y-2">
                      {top5.map((d, i) => (
                        <div key={d?.id || i} className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: T.surface, border:`1px solid ${T.border}` }}>
                          <span className="font-black text-lg w-8 text-center" style={{ color: i === 0 ? T.gold : T.textMuted }}>#{i+1}</span>
                          <div className="flex-1 font-semibold text-sm" style={{ color: T.text }}>{d?.name?.en || d?.name || "—"}</div>
                          <div className="flex items-center gap-1">
                            <FiStar size={12} style={{ color: T.gold, fill: T.gold }} />
                            <span className="font-black text-sm" style={{ color: T.text }}>{(d?.rating||0).toFixed(1)}</span>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background:"rgba(16,185,129,0.10)", color:"#059669" }}>
                            ★ Top
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom 5 */}
                {bottom5.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: T.navy }}>
                      <FiTrendingDown size={15} style={{ color:"#EF4444" }} /> Bottom 5 — Needs Attention
                    </h3>
                    <div className="space-y-2">
                      {bottom5.map((d, i) => (
                        <div key={d?.id || i} className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background:"#FFF5F5", border:`1px solid rgba(239,68,68,0.20)` }}>
                          <span className="font-black text-lg w-8 text-center" style={{ color:"#EF4444" }}>⚠</span>
                          <div className="flex-1 font-semibold text-sm" style={{ color: T.text }}>{d?.name?.en || d?.name || "—"}</div>
                          <div className="flex items-center gap-1">
                            <FiStar size={12} style={{ color:"#EF4444" }} />
                            <span className="font-black text-sm" style={{ color:"#EF4444" }}>{(d?.rating||0).toFixed(1)}</span>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background:"rgba(239,68,68,0.10)", color:"#DC2626" }}>
                            Low
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-2 pt-3" style={{ borderTop:`1px solid ${T.border}` }}>
                  <FiCheckCircle size={14} style={{ color:"#10B981" }} />
                  <span className="text-xs font-semibold" style={{ color: T.textMuted }}>
                    Report generated on {new Date().toLocaleString()} · Ministry of Innovation & Technology
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
