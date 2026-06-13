import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api";
import {
  FiHome,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiTrendingUp,
  FiBell,
  FiSearch,
  FiUserCheck,
  FiInbox,
} from "react-icons/fi";
// Note: FiStar and FiUsers removed with Feedback/Users menu items
import { adminService } from "../../services/adminService";
import { toast } from "react-hot-toast";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [activeBroadcasts, setActiveBroadcasts] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const notifRefDesktop = useRef(null);
  const notifRefMobile = useRef(null);

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem("adminUser") || "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(userData);
    } catch (error) {
      console.error("Error parsing adminUser:", error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadNotificationData = async () => {
      try {
        const [complaintsRes, recentRes, annRes] = await Promise.all([
          API.get("/system-complaints/stats"),
          API.get("/system-complaints?limit=5&status=pending"),
          API.get("/announcements"),
        ]);
        if (cancelled) return;
        setNotifications(complaintsRes.data?.data?.pending ?? 0);
        setPendingComplaints(recentRes.data?.data?.slice(0, 5) || []);
        const raw = annRes.data?.data ?? [];
        const ann = Array.isArray(raw) ? raw : [];
        const now = new Date();
        setActiveBroadcasts(
          ann.filter((a) => a.isActive && (!a.endDate || new Date(a.endDate) >= now)).length,
        );
      } catch (error) {
        console.error("Error loading notification summary:", error);
      }
    };
    loadNotificationData();
    const id = setInterval(loadNotificationData, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => {
      const inDesktop = notifRefDesktop.current?.contains(e.target);
      const inMobile = notifRefMobile.current?.contains(e.target);
      if (!inDesktop && !inMobile) setNotifOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [notifOpen]);

  const handleLogout = async () => {
    try {
      await adminService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const bellBadge =
    notifications > 0 ? notifications : activeBroadcasts > 0 ? 1 : 0;

  const NotificationPanel = ({ align = "right" }) => (
    <div
      className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden`}
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-sm font-semibold text-gray-900">Notifications</p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Live summaries from feedback and announcements
        </p>
      </div>
      <div className="max-h-72 overflow-y-auto">
        <button
          type="button"
          onClick={() => { setNotifOpen(false); navigate("/admin/system-inbox"); }}
          className="w-full text-left px-4 py-3 hover:bg-red-50/80 border-b border-gray-50 flex items-start gap-3 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <FiInbox className="text-lg" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">System feedback pending</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {notifications} pending submission{notifications !== 1 ? "s" : ""}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => { setNotifOpen(false); navigate("/admin/announcements"); }}
          className="w-full text-left px-4 py-3 hover:bg-rose-50/80 border-b border-gray-50 flex items-start gap-3 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <FiBell className="text-lg" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Public announcements</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeBroadcasts} active broadcast{activeBroadcasts !== 1 ? "s" : ""}
            </p>
          </div>
        </button>
        {pendingComplaints.length > 0 ? (
          <div className="px-3 py-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">
              Latest pending
            </p>
            <ul className="space-y-1">
              {pendingComplaints.map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => { setNotifOpen(false); navigate("/admin/system-inbox"); }}
                    className="w-full text-left text-xs px-2 py-2 rounded-lg hover:bg-gray-100 text-gray-700 flex flex-col gap-0.5"
                  >
                    <span className="font-medium line-clamp-1">{c.subject}</span>
                    <span className="text-[10px] text-gray-400 line-clamp-1">
                      {c.visitor || "Anonymous"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="px-4 py-4 text-xs text-gray-500 text-center">
            No pending system feedback.
          </p>
        )}
      </div>
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
        <Link
          to="/admin/system-inbox"
          onClick={() => setNotifOpen(false)}
          className="block text-center text-xs font-medium text-red-600 hover:text-red-700 py-2"
        >
          Open System Inbox →
        </Link>
      </div>
    </div>
  );

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: FiHome,
      label: "Dashboard",
      color: "from-[#C8961E] to-[#E8B84B]",
      description: "Executive Summary & KPIs",
    },
    {
      path: "/admin/announcements",
      icon: FiBell,
      label: "Announcements",
      color: "from-rose-400 to-pink-400",
      description: "Manage Public Broadcasts",
    },
    {
      path: "/admin/sectors",
      icon: FiGrid,
      label: "Sectors",
      color: "from-[#0B2A4A] to-[#1C3F65]",
      description: "Manage Ministry Sectors",
    },
    {
      path: "/admin/sector-managers",
      icon: FiUserCheck,
      label: "Sector Managers",
      color: "from-purple-400 to-violet-400",
      description: "User Access Control",
    },
    {
      path: "/admin/departments",
      icon: FiGrid,
      label: "Departments",
      color: "from-blue-400 to-indigo-400",
      description: "Full CRUD Operations",
    },
    {
      path: "/admin/system-inbox",
      icon: FiInbox,
      label: "System Inbox",
      color: "from-red-400 to-rose-400",
      description: "Comments & Complaints",
    },
    {
      path: "/admin/settings",
      icon: FiSettings,
      label: "Settings",
      color: "from-slate-400 to-gray-400",
      description: "Configuration & Preferences",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex overflow-x-hidden">
      {/* Premium Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 transform 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-all duration-300 ease-in-out
          z-30 w-80 bg-gradient-to-b from-[#071E35] via-[#0B2A4A] to-[#071E35]
          text-white flex flex-col shadow-2xl
        `}
      >
        {/* Logo Area with Navy/Gold Gradient */}
        <div className="bg-gradient-to-r from-[#0B2A4A] to-[#1C3F65]">
          <div style={{height:3, background:'linear-gradient(90deg,#C8961E,#E8B84B,#C8961E)'}} />
          <div className="p-6">
          <Link
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl -m-2 p-2 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl shrink-0">
              🇪🇹
            </div>
            <div className="min-w-0 text-left">
              <h1 className="text-xl font-bold tracking-tight">
                MINT<span style={{color:'#E8B84B'}}>Admin</span>
              </h1>
              <p className="text-[10px] text-blue-200 opacity-90 mt-0.5 leading-tight">
                Ministry of Innovation & Technology
              </p>
            </div>
          </Link>
          </div>
        </div>

        {/* User Profile Card */}
        <Link
          to="/admin/settings"
          onClick={() => setSidebarOpen(false)}
          className="mx-4 mt-6 p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10 block hover:bg-white/10 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8961E] to-[#E8B84B] flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-sm truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.email || "admin@mint.gov.et"}
              </p>
              <p className="text-[9px] text-[#C8961E] mt-0.5 capitalize">
                {user?.role || "Super Admin"}
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-3">
            Main Navigation
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? `bg-[#C8961E]/20 text-[#E8B84B] border border-[#C8961E]/30`
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon className="text-lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] opacity-70">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-4 mt-auto border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                System Status
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#C8961E] rounded-full animate-pulse"></div>
                <span className="text-[9px] text-[#C8961E]">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-gray-500">
              <span>Last Backup: Today 02:00 AM</span>
              <FiTrendingUp size={10} className="text-[#C8961E]" />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 text-sm font-medium"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 z-20">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-gradient-to-r from-[#0B2A4A] to-[#1C3F65] text-white rounded-xl shadow-lg"
          >
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRefMobile}>
              <button
                type="button"
                aria-label="Open notifications"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-700"
              >
                <FiBell className="text-xl text-gray-600" />
                {bellBadge > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {notifications > 0 ? notifications : "!"}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel align="right" />}
            </div>
            <Link
              to="/admin/settings"
              className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C8961E] to-[#E8B84B] flex items-center justify-center text-white font-bold text-sm shadow-md"
            >
              {user?.name?.charAt(0) || "A"}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="hidden md:block bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#0B2A4A] to-[#1C3F65] bg-clip-text text-transparent">
                {menuItems.find((item) => item.path === location.pathname)
                  ?.label || "System Inbox"}
              </h2>
              <span className="px-2 py-0.5 bg-[#C8961E]/10 text-[#C8961E] rounded-full text-[10px] font-medium">
                Live
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="pl-9 pr-3 py-1.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C8961E] w-56 text-sm"
                />
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRefDesktop}>
                <button
                  type="button"
                  aria-label="Open notifications"
                  aria-expanded={notifOpen}
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative p-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <FiBell className="text-xl text-gray-600" />
                  {bellBadge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {notifications > 0 ? notifications : "!"}
                    </span>
                  )}
                </button>
                {notifOpen && <NotificationPanel align="right" />}
              </div>

              {/* Profile */}
              <Link
                to="/admin/settings"
                className="flex items-center gap-2 pl-3 border-l border-gray-200 rounded-lg py-1 pr-2 hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C8961E] to-[#E8B84B] flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="font-semibold text-sm">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize">
                    {user?.role || "Super Admin"}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 pt-20 md:pt-6">
          <Outlet />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
