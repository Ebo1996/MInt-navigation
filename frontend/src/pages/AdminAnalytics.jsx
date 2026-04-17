import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  Download,
  FileText,
  ListChecks,
  MonitorCog,
  RefreshCw,
  Search,
  Settings,
  UserCog,
  UserPlus
} from "lucide-react";
import DashboardShell from "../layouts/DashboardShell";
import api from "../api/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  assignSlaFeedback,
  exportAdminReport,
  followUpSlaFeedback,
  getAuditLogs,
  getDepartmentHealth,
  getSlaOverview,
  getSystemStatus,
  updateUserByAdmin
} from "../services/adminService";

const adminLinks = [
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/create-department", label: "Create Department", icon: Building2 },
  { to: "/dashboard/create-manager", label: "Create Manager", icon: UserPlus },
  { to: "/dashboard/settings", label: "Settings", icon: Settings }
];

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

const toLocalInput = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function AdminAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ q: "", role: "", isActive: "", departmentId: "" });

  const [status, setStatus] = useState(null);
  const [slaHours, setSlaHours] = useState(24);
  const [sla, setSla] = useState({ overdueCount: 0, overdueItems: [] });
  const [slaAssignDepartment, setSlaAssignDepartment] = useState({});

  const [health, setHealth] = useState([]);
  const [audit, setAudit] = useState({ items: [], pagination: { page: 1, limit: 15, total: 0 } });

  const [announcement, setAnnouncement] = useState({
    announcement: "",
    announcementPriority: "normal",
    announcementStartAt: "",
    announcementEndAt: ""
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  const loadUsers = async (filters = userFilters) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.role) params.set("role", filters.role);
    if (filters.isActive !== "") params.set("isActive", filters.isActive);
    if (filters.departmentId) params.set("departmentId", filters.departmentId);

    const response = await api.get(`/auth/users${params.toString() ? `?${params.toString()}` : ""}`);
    setUsers(response.data?.users || []);
  };

  const loadAll = async ({ keepMessage = false } = {}) => {
    if (!keepMessage) {
      setMessage({ type: "", text: "" });
    }

    const setBusy = loading ? setLoading : setRefreshing;
    setBusy(true);

    try {
      const [deptRes, statusRes, slaRes, healthRes, auditRes, settingsRes] = await Promise.all([
        api.get("/departments"),
        getSystemStatus(),
        getSlaOverview(slaHours),
        getDepartmentHealth(),
        getAuditLogs(1, 15),
        api.get("/settings")
      ]);

      setDepartments(deptRes.data?.departments || []);
      setStatus(statusRes || null);
      setSla(slaRes || { overdueCount: 0, overdueItems: [] });
      setHealth(healthRes || []);
      setAudit(auditRes || { items: [], pagination: { page: 1, limit: 15, total: 0 } });

      const settings = settingsRes.data?.settings;
      if (settings) {
        setAnnouncement({
          announcement: settings.announcement || "",
          announcementPriority: settings.announcementPriority || "normal",
          announcementStartAt: toLocalInput(settings.announcementStartAt),
          announcementEndAt: toLocalInput(settings.announcementEndAt)
        });
      }

      await loadUsers();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load admin analytics data." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(userFilters).catch(() => {
        setMessage({ type: "error", text: "Could not refresh users list." });
      });
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFilters]);

  const statCards = useMemo(
    () => [
      { label: "Overdue Feedback", value: String(sla.overdueCount || 0), color: "from-rose-500 to-red-700" },
      { label: "Users (Filtered)", value: String(users.length), color: "from-indigo-500 to-blue-700" },
      { label: "Departments", value: String(departments.length), color: "from-emerald-500 to-green-700" },
      { label: "Recent Errors", value: String(status?.recentErrors?.length || 0), color: "from-amber-500 to-orange-700" }
    ],
    [departments.length, sla.overdueCount, status?.recentErrors?.length, users.length]
  );

  const patchUser = async (userId, payload, successText) => {
    try {
      await updateUserByAdmin(userId, payload);
      await loadUsers();
      await loadAll({ keepMessage: true });
      setMessage({ type: "success", text: successText });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update user." });
    }
  };

  const handleResetPassword = async (user) => {
    const value = window.prompt(`Set a new password for ${user.name}:`, "");
    if (!value) return;
    await patchUser(user.id, { password: value }, `Password reset for ${user.name}.`);
  };

  const handleToggleUser = async (user) => {
    await patchUser(user.id, { isActive: !user.isActive }, `${user.name} is now ${user.isActive ? "disabled" : "active"}.`);
  };

  const handleReassignUser = async (user, departmentId) => {
    await patchUser(user.id, { departmentId: departmentId || null }, `Updated department assignment for ${user.name}.`);
  };

  const handleSlaAssign = async (item) => {
    const departmentId = slaAssignDepartment[item.id];
    if (!departmentId) return;

    try {
      await assignSlaFeedback(item.id, departmentId);
      setMessage({ type: "success", text: `Feedback from ${item.userName} reassigned.` });
      await loadAll({ keepMessage: true });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to reassign feedback." });
    }
  };

  const handleSlaFollowUp = async (item) => {
    const note = window.prompt("Optional follow-up note:", "");
    try {
      await followUpSlaFeedback(item.id, note || "");
      setMessage({ type: "success", text: `Follow-up recorded for ${item.userName}.` });
      await loadAll({ keepMessage: true });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to record follow-up." });
    }
  };

  const saveAnnouncement = async (event) => {
    event.preventDefault();
    setSavingAnnouncement(true);

    try {
      await api.put("/settings", {
        announcement: announcement.announcement,
        announcementPriority: announcement.announcementPriority,
        announcementStartAt: announcement.announcementStartAt || null,
        announcementEndAt: announcement.announcementEndAt || null
      });

      setMessage({ type: "success", text: "Announcement updated." });
      await loadAll({ keepMessage: true });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to save announcement." });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const rightSidebar = (
    <div className="space-y-3 text-xs text-slate-600">
      <button
        type="button"
        onClick={() => navigate("/dashboard/create-department")}
        className="w-full rounded-lg bg-indigo-50 p-2 text-left font-semibold text-indigo-700 hover:bg-indigo-100"
      >
        Create Department
      </button>
      <button
        type="button"
        onClick={() => navigate("/dashboard/create-manager")}
        className="w-full rounded-lg bg-emerald-50 p-2 text-left font-semibold text-emerald-700 hover:bg-emerald-100"
      >
        Create Manager
      </button>
      <button
        type="button"
        onClick={() => document.getElementById("overdue-feedback")?.scrollIntoView({ behavior: "smooth" })}
        className="w-full rounded-lg bg-rose-50 p-2 text-left font-semibold text-rose-700 hover:bg-rose-100"
      >
        View Overdue Feedback
      </button>
      <button
        type="button"
        onClick={() => exportAdminReport("department-performance", "csv")}
        className="w-full rounded-lg bg-slate-100 p-2 text-left font-semibold text-slate-700 hover:bg-slate-200"
      >
        Run Report
      </button>
    </div>
  );

  return (
    <DashboardShell
      title="Admin Analytics"
      subtitle="Operations, trust, and response control center"
      links={adminLinks}
      rightSidebar={rightSidebar}
    >
      {loading ? <LoadingSpinner label="Loading admin analytics..." /> : null}

      {!loading ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadAll({ keepMessage: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            {message.text ? (
              <p className={`text-sm ${message.type === "error" ? "text-rose-700" : "text-emerald-700"}`}>{message.text}</p>
            ) : null}
          </div>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article key={card.label} className={`rounded-2xl bg-gradient-to-r ${card.color} p-5 text-white shadow`}>
                <p className="text-xs font-semibold uppercase opacity-90">{card.label}</p>
                <p className="mt-2 text-3xl font-black">{card.value}</p>
              </article>
            ))}
          </section>

          <section className="mb-6 grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <MonitorCog className="h-4 w-4 text-sky-700" />
                <h2 className="text-base font-bold text-slate-900">System Status Widget</h2>
              </div>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>Backend: <span className="font-semibold">{status?.backendStatus || "unknown"}</span></p>
                <p>DB: <span className="font-semibold">{status?.dbStatus || "unknown"}</span></p>
                <p>Uptime: <span className="font-semibold">{status?.uptimeSeconds || 0}s</span></p>
                <p>Last Backup: <span className="font-semibold">{formatDate(status?.lastBackupAt)}</span></p>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-2">
                <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Recent Errors</p>
                {(status?.recentErrors || []).length === 0 ? (
                  <p className="text-sm text-slate-600">No recent runtime errors recorded.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-slate-700">
                    {(status?.recentErrors || []).map((err) => (
                      <li key={`${err.at}-${err.path}`} className="rounded bg-white px-2 py-1">
                        {formatDate(err.at)} | {err.statusCode} | {err.method} {err.path} | {err.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-700" />
                <h2 className="text-base font-bold text-slate-900">Announcement Broadcast</h2>
              </div>
              <form onSubmit={saveAnnouncement} className="grid gap-2 text-sm">
                <textarea
                  rows={3}
                  value={announcement.announcement}
                  onChange={(event) => setAnnouncement((prev) => ({ ...prev, announcement: event.target.value }))}
                  placeholder="Message for dashboard/landing"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                />
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    value={announcement.announcementPriority}
                    onChange={(event) => setAnnouncement((prev) => ({ ...prev, announcementPriority: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={announcement.announcementStartAt}
                    onChange={(event) => setAnnouncement((prev) => ({ ...prev, announcementStartAt: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="datetime-local"
                    value={announcement.announcementEndAt}
                    onChange={(event) => setAnnouncement((prev) => ({ ...prev, announcementEndAt: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingAnnouncement}
                  className="inline-flex w-fit items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {savingAnnouncement ? "Saving..." : "Publish Announcement"}
                </button>
              </form>
            </article>
          </section>

          <section id="overdue-feedback" className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-700" />
                <h2 className="text-base font-bold text-slate-900">Feedback SLA Panel</h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Overdue after</span>
                <input
                  type="number"
                  min={1}
                  value={slaHours}
                  onChange={(event) => setSlaHours(Math.max(1, Number(event.target.value) || 24))}
                  className="w-16 rounded border border-slate-300 px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => loadAll({ keepMessage: true })}
                  className="rounded border border-slate-300 px-2 py-1 font-semibold text-slate-700"
                >
                  Apply
                </button>
              </div>
            </div>
            <p className="mb-3 text-sm text-slate-600">Overdue pending feedback: {sla.overdueCount}</p>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Age (hrs)</th>
                    <th className="px-3 py-2">Comment</th>
                    <th className="px-3 py-2">Follow-ups</th>
                    <th className="px-3 py-2">Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sla.overdueItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-slate-500">No overdue pending feedback.</td>
                    </tr>
                  ) : (
                    sla.overdueItems.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-2 font-semibold text-slate-800">{item.userName || "Visitor"}</td>
                        <td className="px-3 py-2 text-slate-700">{item.departmentName}</td>
                        <td className="px-3 py-2 text-rose-700">{item.ageHours}</td>
                        <td className="px-3 py-2 text-slate-600">{item.comment}</td>
                        <td className="px-3 py-2 text-slate-600">{item.followUpCount || 0}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <select
                              value={slaAssignDepartment[item.id] || ""}
                              onChange={(event) =>
                                setSlaAssignDepartment((prev) => ({
                                  ...prev,
                                  [item.id]: event.target.value
                                }))
                              }
                              className="rounded border border-slate-300 px-2 py-1"
                            >
                              <option value="">Assign Department</option>
                              {departments.map((department) => (
                                <option key={department._id} value={department._id}>
                                  {department.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleSlaAssign(item)}
                              className="rounded bg-indigo-600 px-2 py-1 font-semibold text-white"
                            >
                              Assign
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSlaFollowUp(item)}
                              className="rounded bg-amber-600 px-2 py-1 font-semibold text-white"
                            >
                              Follow-up
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-cyan-700" />
              <h2 className="text-base font-bold text-slate-900">Department Health Score</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Avg Rating</th>
                    <th className="px-3 py-2">Avg Response (hrs)</th>
                    <th className="px-3 py-2">Unresolved</th>
                    <th className="px-3 py-2">Health Score</th>
                  </tr>
                </thead>
                <tbody>
                  {health.map((item) => (
                    <tr key={String(item.departmentId)} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-semibold text-slate-800">{item.department}</td>
                      <td className="px-3 py-2 text-slate-700">{item.averageRating}</td>
                      <td className="px-3 py-2 text-slate-700">{item.avgResponseHours}</td>
                      <td className="px-3 py-2 text-slate-700">{item.pending}</td>
                      <td className="px-3 py-2 font-bold text-indigo-700">{item.healthScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserCog className="h-4 w-4 text-indigo-700" />
              <h2 className="text-base font-bold text-slate-900">User Management Table</h2>
            </div>

            <div className="mb-3 grid gap-2 md:grid-cols-4">
              <label className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={userFilters.q}
                  onChange={(event) => setUserFilters((prev) => ({ ...prev, q: event.target.value }))}
                  placeholder="Search name/email"
                  className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-2 text-xs"
                />
              </label>
              <select
                value={userFilters.role}
                onChange={(event) => setUserFilters((prev) => ({ ...prev, role: event.target.value }))}
                className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="general_manager">General Manager</option>
                <option value="department_manager">Department Manager</option>
              </select>
              <select
                value={userFilters.isActive}
                onChange={(event) => setUserFilters((prev) => ({ ...prev, isActive: event.target.value }))}
                className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
              <select
                value={userFilters.departmentId}
                onChange={(event) => setUserFilters((prev) => ({ ...prev, departmentId: event.target.value }))}
                className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Last Login</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-slate-500">No users match the filters.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-2 font-semibold text-slate-800">{user.name}</td>
                        <td className="px-3 py-2 text-slate-600">{user.email}</td>
                        <td className="px-3 py-2 text-slate-700">{user.role}</td>
                        <td className="px-3 py-2 text-slate-700">{user.departmentName || "-"}</td>
                        <td className="px-3 py-2 text-slate-700">{user.isActive ? "active" : "disabled"}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(user.lastLoginAt)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResetPassword(user)}
                              className="rounded bg-slate-900 px-2 py-1 font-semibold text-white"
                            >
                              Reset Password
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleUser(user)}
                              className="rounded bg-rose-600 px-2 py-1 font-semibold text-white"
                            >
                              {user.isActive ? "Disable" : "Enable"}
                            </button>
                            {user.role === "department_manager" ? (
                              <select
                                defaultValue={user.departmentId || ""}
                                onChange={(event) => handleReassignUser(user, event.target.value)}
                                className="rounded border border-slate-300 px-2 py-1"
                              >
                                <option value="">Unassigned</option>
                                {departments.map((department) => (
                                  <option key={department._id} value={department._id}>
                                    {department.name}
                                  </option>
                                ))}
                              </select>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6 grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-700" />
                <h2 className="text-base font-bold text-slate-900">Audit Log</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[540px] w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2">Actor</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Resource</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.items.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-slate-600">{formatDate(item.createdAt)}</td>
                        <td className="px-3 py-2 text-slate-700">{item.actorId?.name || item.actorRole || "system"}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{item.action}</td>
                        <td className="px-3 py-2 text-slate-700">{item.resourceType}:{item.resourceId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-700" />
                <h2 className="text-base font-bold text-slate-900">Export & Reports</h2>
              </div>
              <p className="mb-3 text-sm text-slate-600">Download CSV or PDF reports for trends, department performance, and manager response stats.</p>
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => exportAdminReport("feedback-trends", "csv")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  Feedback Trends (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => exportAdminReport("feedback-trends", "pdf")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  Feedback Trends (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => exportAdminReport("department-performance", "csv")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  Department Performance (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => exportAdminReport("department-performance", "pdf")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  Department Performance (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => exportAdminReport("manager-response-stats", "csv")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  Manager Response Stats (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => exportAdminReport("manager-response-stats", "pdf")}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-left font-semibold text-slate-700"
                >
                  Manager Response Stats (PDF)
                </button>
              </div>
            </article>
          </section>
        </>
      ) : null}
    </DashboardShell>
  );
}

export default AdminAnalytics;
