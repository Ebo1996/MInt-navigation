import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBarChart2, FiTrendingUp, FiTrendingDown,
  FiStar, FiMessageSquare, FiRefreshCw,
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";
import { toast } from "react-hot-toast";

const T = {
  navy: "#086976", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", card: "#FFFFFF", border: "#D8E2EF",
  text: "#086976", textSub: "#4A5568", textMuted: "#8896A6",
};

export default function Insights() {
  const [loading,  setLoading]  = useState(true);
  const [rankings, setRankings] = useState([]);
  const [overview, setOverview] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [rank, ov] = await Promise.all([
        analyticsService.getRankings({ sortBy: "rating", order: "desc" }),
        analyticsService.getOverview(30),
      ]);
      setRankings(Array.isArray(rank) ? rank : []);
      setOverview(ov);
    } catch(e) {
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
    </div>
  );

  // Rating distribution from all departments
  const ratingDist = { 1:0, 2:0, 3:0, 4:0, 5:0 };
  const maxRating = Math.max(...Object.values(ratingDist), 1);

  const avgRating = overview?.avgRating || 0;
  const responseRate = overview?.responseRate || 0;
  const top5 = [...rankings].slice(0, 5);
  const bottom5 = [...rankings].sort((a,b) => (a?.rating||0) - (b?.rating||0)).slice(0, 5);
  const improving = rankings.filter(d => (d?.trend||0) > 0.1).length;
  const declining = rankings.filter(d => (d?.trend||0) < -0.1).length;

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: T.navy }}>Deep Insights</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>Trend analysis across all departments</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
          <FiRefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Ministry health summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Ministry Avg Rating",   val: avgRating > 0 ? `${avgRating.toFixed(1)}★` : "—", color: avgRating >= 4 ? "#10B981" : avgRating >= 3 ? T.gold : "#EF4444" },
          { label:"Response Rate",          val: `${responseRate}%`,                               color: responseRate >= 70 ? "#10B981" : responseRate >= 40 ? T.gold : "#EF4444" },
          { label:"Improving Depts",        val: improving,                                         color: "#10B981" },
          { label:"Declining Depts",        val: declining,                                         color: declining > 0 ? "#EF4444" : T.textMuted },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className="rounded-2xl p-4" style={{ background: T.card, border:`1px solid ${T.border}` }}>
            <div className="text-xs font-bold uppercase mb-2" style={{ color: T.textMuted, letterSpacing:"0.10em" }}>{s.label}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top performers */}
        <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom:`1px solid ${T.border}`, background: T.surface }}>
            <FiTrendingUp size={14} style={{ color:"#10B981" }} />
            <span className="text-sm font-bold" style={{ color: T.navy }}>Top Performers</span>
          </div>
          <div className="divide-y" style={{ borderColor: T.border }}>
            {top5.map((d, i) => (
              <div key={d?.id || i} className="flex items-center gap-3 px-5 py-3">
                <span className="font-black w-6 text-center" style={{ color: i === 0 ? T.gold : T.textMuted }}>#{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: T.text }}>{d?.name?.en || d?.name || "—"}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{d?.totalFeedback||0} reviews · {d?.responseRate||0}% response rate</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FiStar size={12} style={{ color: T.gold, fill: T.gold }} />
                  <span className="font-black text-sm" style={{ color: T.text }}>{(d?.rating||0).toFixed(1)}</span>
                </div>
                {(d?.trend||0) > 0 && <FiTrendingUp size={13} style={{ color:"#10B981" }} />}
              </div>
            ))}
            {top5.length === 0 && <div className="py-8 text-center text-sm" style={{ color: T.textMuted }}>No data available</div>}
          </div>
        </div>

        {/* Bottom performers */}
        <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1.5px solid rgba(239,68,68,0.20)` }}>
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom:"1px solid rgba(239,68,68,0.15)", background:"rgba(239,68,68,0.04)" }}>
            <FiTrendingDown size={14} style={{ color:"#EF4444" }} />
            <span className="text-sm font-bold" style={{ color:"#B91C1C" }}>Needs Attention</span>
          </div>
          <div className="divide-y" style={{ borderColor: T.border }}>
            {bottom5.map((d, i) => (
              <div key={d?.id || i} className="flex items-center gap-3 px-5 py-3">
                <span className="text-base">⚠</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: T.text }}>{d?.name?.en || d?.name || "—"}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textMuted }}>{d?.totalFeedback||0} reviews · {d?.responseRate||0}% response rate</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FiStar size={12} style={{ color:"#EF4444" }} />
                  <span className="font-black text-sm" style={{ color:"#EF4444" }}>{(d?.rating||0).toFixed(1)}</span>
                </div>
                {(d?.trend||0) < 0 && <FiTrendingDown size={13} style={{ color:"#EF4444" }} />}
              </div>
            ))}
            {bottom5.length === 0 && <div className="py-8 text-center text-sm" style={{ color: T.textMuted }}>No data available</div>}
          </div>
        </div>
      </div>

      {/* All departments rating bar chart */}
      {rankings.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: T.navy }}>
            <FiBarChart2 size={15} style={{ color: T.gold }} /> All Departments — Rating Comparison
          </h3>
          <div className="space-y-2.5">
            {rankings.slice(0, 15).map((d, i) => {
              const pct = ((d?.rating || 0) / 5) * 100;
              const color = (d?.rating||0) < 3 ? "#EF4444" : (d?.rating||0) >= 4 ? "#10B981" : T.gold;
              return (
                <div key={d?.id || i} className="flex items-center gap-3">
                  <div className="text-xs font-semibold w-32 truncate flex-shrink-0" style={{ color: T.textSub }}>
                    {(d?.name?.en || d?.name || "").substring(0, 18)}
                  </div>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: T.surface }}>
                    <motion.div className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ background: color, width:`${pct}%`, minWidth: 40 }}
                      initial={{ width:0 }} animate={{ width:`${pct}%` }}
                      transition={{ duration:0.6, delay: i*0.04 }}>
                      <span className="text-xs font-black text-white">{(d?.rating||0).toFixed(1)}</span>
                    </motion.div>
                  </div>
                  <div className="text-xs font-semibold w-14 text-right flex-shrink-0" style={{ color: T.textMuted }}>
                    {d?.totalFeedback||0} <FiMessageSquare size={9} className="inline" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
