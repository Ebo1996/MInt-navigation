import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid, FiAward, FiInbox, FiFileText,
  FiLogOut, FiMenu, FiX, FiBell, FiSettings,
  FiUser, FiChevronRight,
} from "react-icons/fi";
import { analyticsService } from "../../services/analyticsService";

const T = {
  navy: "#086976", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", border: "#D8E2EF",
};

const MENU = [
  { path: "/feedback-analytics",           icon: FiGrid,     label: "Overview",        desc: "Dashboard & KPIs" },
  { path: "/feedback-analytics/rankings",  icon: FiAward,    label: "Rankings & Flags",desc: "Performance & Alerts" },
  { path: "/feedback-analytics/inbox",     icon: FiInbox,    label: "Feedback Inbox",  desc: "All Submissions", badge: true },
  { path: "/feedback-analytics/reports",   icon: FiFileText, label: "Reports",         desc: "Export & Schedule" },
  { path: "/feedback-analytics/settings",  icon: FiSettings, label: "Settings",        desc: "Profile" },
];

export default function AnalyticsLayout() {
  const [open, setOpen]       = useState(false);
  const [pending, setPending] = useState(0);
  const [pendingSeen, setPendingSeen] = useState(false);
  const [user, setUser]       = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const displayPending = pendingSeen ? 0 : pending;

  const handleBellClick = () => {
    setPendingSeen(true);
    navigate("/feedback-analytics/inbox");
  };

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("adminUser") || "null")); } catch(_) {}
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsService.getInbox({ status: "pending", limit: 1 });
        const newCount = res?.pagination?.total || 0;
        if (newCount > pending) setPendingSeen(false); // new items arrived
        setPending(newCount);
      } catch(_) { setPending(0); }
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  const logout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const isActive = (path) =>
    path === "/feedback-analytics"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const pageTitle = MENU.find(m => isActive(m.path))?.label || "Feedback Manager";

  return (
    <div className="min-h-screen flex" style={{ background: T.surface }}>

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-72 flex flex-col
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `} style={{ background: T.navyDark }}>

        {/* Gold accent top */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight}, ${T.gold})` }} />

        {/* Brand */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link to="/feedback-analytics" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              📊
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">
                MINT <span style={{ color: T.goldLight }}>Feedback</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                General Feedback Manager
              </div>
            </div>
          </Link>
        </div>

        {/* User card */}
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navyDark }}>
              {user?.name?.charAt(0) || user?.username?.charAt(0) || "M"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name || "Manager"}</div>
              <div className="text-xs truncate" style={{ color: T.goldLight }}>General Feedback Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-5 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold uppercase mb-3 px-2" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em" }}>
            Navigation
          </p>
          {MENU.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  background: active ? "rgba(200,150,30,0.15)" : "transparent",
                  border: active ? `1px solid rgba(200,150,30,0.25)` : "1px solid transparent",
                  color: active ? T.goldLight : "rgba(255,255,255,0.60)",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <Icon size={16} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{item.label}</span>
                    {item.badge && displayPending > 0 && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#EF4444", color: "#fff", minWidth: 18, textAlign: "center" }}>
                        {displayPending > 99 ? "99+" : displayPending}
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>{item.desc}</div>
                </div>
                {active && <FiChevronRight size={13} style={{ color: T.goldLight }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(239,68,68,0.10)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.20)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; }}>
            <FiLogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
          style={{ background: "#fff", borderBottom: `1px solid ${T.border}`, boxShadow: "0 1px 12px rgba(11,42,74,0.06)" }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg" style={{ background: T.surface }}
              onClick={() => setOpen(!open)}>
              {open ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
            <div>
              <h1 className="text-base font-bold" style={{ color: T.navy }}>{pageTitle}</h1>
              <p className="text-xs" style={{ color: "#8896A6" }}>General Feedback Manager Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBellClick}
              className="relative p-2 rounded-xl transition-colors"
              style={{ background: T.surface }}
              onMouseEnter={e => (e.currentTarget.style.background = T.border)}
              onMouseLeave={e => (e.currentTarget.style.background = T.surface)}>
              <FiBell size={17} style={{ color: T.navy }} />
              {displayPending > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ background: "#EF4444", color: "#fff", fontSize: 9 }}>
                  {displayPending > 9 ? "9+" : displayPending}
                </span>
              )}
            </button>
            <Link to="/feedback-analytics/settings"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, color: T.goldLight }}>
                {user?.name?.charAt(0) || "M"}
              </div>
              <span className="hidden sm:block text-xs font-semibold" style={{ color: T.navy }}>
                {user?.name || "Manager"}
              </span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-7 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 bg-black/50 z-20 md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
