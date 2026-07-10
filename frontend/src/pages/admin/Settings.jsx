import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiUser,
  FiLock,
  FiBell,
  FiGlobe,
  FiMail,
  FiShield,
  FiDatabase,
  FiClock,
  FiUsers,
  FiRefreshCw,
  FiServer,
  FiActivity,
  FiEdit2,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    role: "",
    avatar: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    sessionTimeout: "30",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/profile");
      const userData = response.data;
      setProfile(userData);
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await API.put("/admin/profile", profileForm);
      setProfile({
        ...profile,
        name: response.data.name,
        email: response.data.email,
      });
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
      storedUser.name = response.data.name;
      storedUser.email = response.data.email;
      localStorage.setItem("adminUser", JSON.stringify(storedUser));
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      await API.put("/admin/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveSettings = () => {
    // Save to localStorage for now (will integrate with backend API later)
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">System Settings</h1>
        <p className="text-slate-300 text-sm">
          Configure and customize your admin panel
        </p>
      </div>

      {/* System Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-3 border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FiServer className="text-emerald-600" size={14} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">API Status</p>
              <p className="font-semibold text-green-600 text-sm">Connected</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiDatabase className="text-blue-600" size={14} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Database</p>
              <p className="font-semibold text-sm">Online</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiUsers className="text-purple-600" size={14} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Active Sessions</p>
              <p className="font-semibold text-sm">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiActivity className="text-amber-600" size={14} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Last Login</p>
              <p className="font-semibold text-sm text-emerald-600">Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Settings Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiUser className="text-emerald-600" /> Admin Profile
              </h2>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <FiEdit2 size={14} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <FiX size={14} />
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="p-1 text-emerald-600 hover:text-emerald-700"
                  >
                    <FiCheck size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name?.charAt(0) || profile.username?.charAt(0) || "A"}
              </div>
              <div>
                {isEditingProfile ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="px-3 py-1 border rounded-lg text-sm w-48"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="px-3 py-1 border rounded-lg text-sm w-48"
                      placeholder="Email"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">
                      {profile.name || profile.username}
                    </p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <p className="text-xs text-emerald-600 capitalize mt-1">
                      {profile.role}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiLock className="text-emerald-600" /> Change Password
            </h2>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleChangePassword}
                disabled={updatingPassword}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm"
              >
                {updatingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiBell className="text-amber-600" /> Notification Settings
            </h2>
            <div className="space-y-3">
              <ToggleSwitch
                label="Email Notifications"
                description="Receive email alerts for new feedback"
                checked={settings.notifications}
                onChange={(val) =>
                  setSettings({ ...settings, notifications: val })
                }
              />
              <ToggleSwitch
                label="Email Alerts"
                description="Get notified about system updates"
                checked={settings.emailAlerts}
                onChange={(val) =>
                  setSettings({ ...settings, emailAlerts: val })
                }
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white">
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm flex items-center justify-center gap-2">
                <FiRefreshCw size={14} /> Clear Cache
              </button>
              <button className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm flex items-center justify-center gap-2">
                <FiDatabase size={14} /> Backup Now
              </button>
              <button className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm flex items-center justify-center gap-2">
                <FiMail size={14} /> Test Email
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold mb-3">System Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">2.0.0</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Environment</span>
                <span className="font-medium text-emerald-600">Production</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">MongoDB</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm flex items-center gap-2"
        >
          <FiSave size={14} /> Save Changes
        </button>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-emerald-600" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "transform translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
};

export default Settings;
