import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  PanelRight,
  Settings,
  BarChart3
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const defaultLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/feedback", label: "Feedback", icon: MessageCircle }
];

function DashboardShell({ title, subtitle, children, links = defaultLinks, rightSidebar = null }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow md:hidden"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6">
          <h2 className="text-xl font-black text-mint-900">MInT Panel</h2>
          <p className="text-xs text-slate-500">Smart Visitor Guidance</p>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/dashboard" || link.to === "/admin-dashboard"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-mint-100 text-mint-900" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-mint-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-mint-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
            <PanelRight className="h-3.5 w-3.5" />
            Quick Tips
          </div>
          <p>Use Analytics for visual trends and Settings for portal configuration.</p>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      ) : null}

      <main className="px-4 pb-8 pt-16 md:ml-64 md:px-8 md:pt-8">
        <header className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 md:text-3xl">{title}</h1>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </header>

        <div className={rightSidebar ? "grid gap-6 xl:grid-cols-[1fr_280px]" : ""}>
          <div>{children}</div>

          {rightSidebar ? (
            <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Admin Utility Sidebar</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span>Track trends by month</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                  <Settings className="h-4 w-4 text-mint-700" />
                  <span>Manage global settings</span>
                </div>
              </div>
              {rightSidebar}
            </aside>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default DashboardShell;
