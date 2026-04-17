import { useEffect, useState } from "react";
import { BarChart3, Settings, Save, Building2, UserPlus } from "lucide-react";
import DashboardShell from "../layouts/DashboardShell";
import api from "../api/api";
import LoadingSpinner from "../components/LoadingSpinner";

const adminLinks = [
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/create-department", label: "Create Department", icon: Building2 },
  { to: "/dashboard/create-manager", label: "Create Manager", icon: UserPlus },
  { to: "/dashboard/settings", label: "Settings", icon: Settings }
];

const initialForm = {
  appName: "",
  supportEmail: "",
  defaultTheme: "light",
  allowPublicFeedback: true,
  announcement: "",
  announcementPriority: "normal",
  announcementStartAt: "",
  announcementEndAt: "",
  lastBackupAt: ""
};

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get("/settings");
        const settings = response.data?.settings;
        if (settings) {
          setForm({
            appName: settings.appName || "",
            supportEmail: settings.supportEmail || "",
            defaultTheme: settings.defaultTheme || "light",
            allowPublicFeedback: Boolean(settings.allowPublicFeedback),
            announcement: settings.announcement || "",
            announcementPriority: settings.announcementPriority || "normal",
            announcementStartAt: settings.announcementStartAt
              ? new Date(settings.announcementStartAt).toISOString().slice(0, 16)
              : "",
            announcementEndAt: settings.announcementEndAt
              ? new Date(settings.announcementEndAt).toISOString().slice(0, 16)
              : "",
            lastBackupAt: settings.lastBackupAt ? new Date(settings.lastBackupAt).toISOString().slice(0, 16) : ""
          });
        }
      } catch (error) {
        setMessage("Could not load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        announcementStartAt: form.announcementStartAt || null,
        announcementEndAt: form.announcementEndAt || null,
        lastBackupAt: form.lastBackupAt || null
      };
      const response = await api.put("/settings", payload);
      const settings = response.data?.settings || form;
      setForm({
        appName: settings.appName || "",
        supportEmail: settings.supportEmail || "",
        defaultTheme: settings.defaultTheme || "light",
        allowPublicFeedback: Boolean(settings.allowPublicFeedback),
        announcement: settings.announcement || "",
        announcementPriority: settings.announcementPriority || "normal",
        announcementStartAt: settings.announcementStartAt
          ? new Date(settings.announcementStartAt).toISOString().slice(0, 16)
          : "",
        announcementEndAt: settings.announcementEndAt
          ? new Date(settings.announcementEndAt).toISOString().slice(0, 16)
          : "",
        lastBackupAt: settings.lastBackupAt ? new Date(settings.lastBackupAt).toISOString().slice(0, 16) : ""
      });
      setMessage("Settings saved successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const rightSidebar = (
    <div className="space-y-3 text-xs text-slate-600">
      <p className="rounded-lg bg-amber-50 p-2">Only admins can update these global values.</p>
      <p className="rounded-lg bg-emerald-50 p-2">These settings can drive frontend branding and behavior.</p>
    </div>
  );

  return (
    <DashboardShell
      title="Admin Settings"
      subtitle="Configure portal-wide behavior and branding"
      links={adminLinks}
      rightSidebar={rightSidebar}
    >
      {loading ? <LoadingSpinner label="Loading settings..." /> : null}

      {!loading ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">App Name</span>
              <input
                name="appName"
                value={form.appName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Support Email</span>
              <input
                name="supportEmail"
                value={form.supportEmail}
                onChange={handleChange}
                type="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Default Theme</span>
              <select
                name="defaultTheme"
                value={form.defaultTheme}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </label>

            <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                name="allowPublicFeedback"
                checked={form.allowPublicFeedback}
                onChange={handleChange}
                type="checkbox"
                className="h-4 w-4"
              />
              Allow Public Feedback
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Announcement</span>
            <textarea
              name="announcement"
              value={form.announcement}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
            />
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Announcement Priority</span>
              <select
                name="announcementPriority"
                value={form.announcementPriority}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Last Backup Time</span>
              <input
                name="lastBackupAt"
                value={form.lastBackupAt}
                onChange={handleChange}
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Announcement Start</span>
              <input
                name="announcementStartAt"
                value={form.announcementStartAt}
                onChange={handleChange}
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Announcement End</span>
              <input
                name="announcementEndAt"
                value={form.announcementEndAt}
                onChange={handleChange}
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-mint-300"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mint-800 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>

          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </form>
      ) : null}
    </DashboardShell>
  );
}

export default AdminSettings;
