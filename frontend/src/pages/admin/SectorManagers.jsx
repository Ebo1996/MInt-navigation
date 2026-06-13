import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUserPlus,
  FiLock,
  FiUnlock,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiShield,
  FiKey,
  FiSend,
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

const SectorManagers = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recentlyActive: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    sectorId: 1,
    password: "",
    sendEmail: true,
  });

  const sectors = [
    { id: 1, name: "Executive Leadership", building: "A", color: "emerald" },
    { id: 2, name: "Innovation & Technology", building: "A", color: "blue" },
    { id: 3, name: "Finance & Administration", building: "A", color: "amber" },
    { id: 4, name: "Policy & Strategy", building: "A", color: "purple" },
    { id: 5, name: "HR & Competency", building: "A", color: "pink" },
    { id: 6, name: "Operations & Services", building: "A/B", color: "teal" },
    { id: 7, name: "Digital & ICT", building: "A/B", color: "cyan" },
    { id: 8, name: "Support Services", building: "A", color: "gray" },
  ];

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    filterManagers();
  }, [searchTerm, sectorFilter, managers]);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/sector-managers");
      const data = response.data.data || response.data || [];
      setManagers(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching sector managers:", error);
      toast.error("Failed to load sector managers");
      // Mock data for demo
      const mockData = getMockManagers();
      setManagers(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter((m) => m.isActive !== false).length;
    const recentlyActive = data.filter((m) => {
      if (!m.lastLogin) return false;
      const daysSinceLogin = Math.ceil(
        (new Date() - new Date(m.lastLogin)) / (1000 * 60 * 60 * 24),
      );
      return daysSinceLogin <= 7;
    }).length;
    setStats({ total, active, recentlyActive });
  };

  const filterManagers = () => {
    let filtered = [...managers];
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.username?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (sectorFilter !== "all") {
      filtered = filtered.filter((m) => m.sectorId === parseInt(sectorFilter));
    }
    setFilteredManagers(filtered);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.username) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await API.post("/admin/sector-managers", formData);
      toast.success("Sector manager created successfully");
      if (response.data.generatedPassword) {
        toast.success(`Password: ${response.data.generatedPassword}`, {
          duration: 10000,
        });
      }
      setShowAddModal(false);
      resetForm();
      fetchManagers();
    } catch (error) {
      console.error("Error creating sector manager:", error);
      toast.error(
        error.response?.data?.message || "Failed to create sector manager",
      );
    }
  };

  const handleUpdate = async () => {
    if (!selectedManager) return;

    try {
      await API.put(`/admin/sector-managers/${selectedManager._id}`, {
        name: formData.name,
        email: formData.email,
        sectorId: formData.sectorId,
      });
      toast.success("Sector manager updated successfully");
      setShowEditModal(false);
      setSelectedManager(null);
      resetForm();
      fetchManagers();
    } catch (error) {
      console.error("Error updating sector manager:", error);
      toast.error("Failed to update sector manager");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedManager) return;

    try {
      const response = await API.post(
        `/admin/sector-managers/${selectedManager._id}/reset-password`,
      );
      const newPassword = response.data.newPassword;
      setResetPassword(newPassword);
      toast.success(`New password: ${newPassword}`, { duration: 15000 });
      fetchManagers();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this sector manager?")
    ) {
      try {
        await API.delete(`/admin/sector-managers/${id}`);
        toast.success("Sector manager deleted successfully");
        fetchManagers();
      } catch (error) {
        console.error("Error deleting sector manager:", error);
        toast.error("Failed to delete sector manager");
      }
    }
  };

  const openEditModal = (manager) => {
    setSelectedManager(manager);
    setFormData({
      name: manager.name || "",
      email: manager.email || "",
      username: manager.username || "",
      sectorId: manager.sectorId || 1,
      password: "",
      sendEmail: true,
    });
    setShowEditModal(true);
  };

  const openResetModal = (manager) => {
    setSelectedManager(manager);
    setResetPassword("");
    setShowResetModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      username: "",
      sectorId: 1,
      password: "",
      sendEmail: true,
    });
  };

  const formatLastLogin = (date) => {
    if (!date) return "Never";
    const lastLogin = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((now - lastLogin) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const getSectorInfo = (sectorId) => {
    return sectors.find((s) => s.id === sectorId) || sectors[0];
  };

  const getMockManagers = () => {
    return [
      {
        _id: "1",
        name: "Ato Solomon Aynimar",
        email: "sector1@mint.gov.et",
        username: "sector1.manager",
        sectorId: 1,
        lastLogin: new Date().toISOString(),
        isActive: true,
        createdAt: "2024-01-15",
      },
      {
        _id: "2",
        name: "Dr. Alemitu Bekele",
        email: "sector2@mint.gov.et",
        username: "sector2.manager",
        sectorId: 2,
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        isActive: true,
        createdAt: "2024-01-15",
      },
      {
        _id: "3",
        name: "W/o Etalemew Gezahegn",
        email: "sector3@mint.gov.et",
        username: "sector3.manager",
        sectorId: 3,
        lastLogin: new Date(Date.now() - 3 * 86400000).toISOString(),
        isActive: true,
        createdAt: "2024-01-15",
      },
      {
        _id: "4",
        name: "Dr. Worku Mekonnen",
        email: "sector4@mint.gov.et",
        username: "sector4.manager",
        sectorId: 4,
        lastLogin: new Date(Date.now() - 5 * 86400000).toISOString(),
        isActive: true,
        createdAt: "2024-01-15",
      },
      {
        _id: "5",
        name: "Ato Dagne Assefa",
        email: "sector5@mint.gov.et",
        username: "sector5.manager",
        sectorId: 5,
        lastLogin: new Date(Date.now() - 10 * 86400000).toISOString(),
        isActive: true,
        createdAt: "2024-01-15",
      },
      {
        _id: "6",
        name: "Sector 6 Manager",
        email: "sector6@mint.gov.et",
        username: "sector6.manager",
        sectorId: 6,
        lastLogin: null,
        isActive: true,
        createdAt: "2024-01-15",
      },
      {
        _id: "7",
        name: "Ato Denber Getahun",
        email: "sector7@mint.gov.et",
        username: "sector7.manager",
        sectorId: 7,
        lastLogin: new Date(Date.now() - 2 * 86400000).toISOString(),
        isActive: true,
        createdAt: "2024-01-15",
      },
      {
        _id: "8",
        name: "Sector 8 Manager",
        email: "sector8@mint.gov.et",
        username: "sector8.manager",
        sectorId: 8,
        lastLogin: null,
        isActive: true,
        createdAt: "2024-01-15",
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">
            Loading sector managers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              👥 Sector Manager Administration
            </h1>
            <p className="text-purple-100 text-sm">
              Manage sector manager accounts & access permissions
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2"
          >
            <FiUserPlus size={16} /> Add Manager
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Total Managers</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              🟢
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Recently Active</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.recentlyActive}
              </p>
            </div>
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              📱
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, email or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Sectors</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                Sector {s.id}: {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchManagers}
            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Managers List */}
      {filteredManagers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No sector managers found
          </h3>
          <p className="text-gray-500 text-sm">
            Add sector managers to manage different sectors
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredManagers.map((manager) => {
            const sectorInfo = getSectorInfo(manager.sectorId);
            const lastLoginText = formatLastLogin(manager.lastLogin);
            const isRecentlyActive =
              manager.lastLogin &&
              new Date() - new Date(manager.lastLogin) <
                7 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={manager._id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden"
              >
                <div
                  className={`p-4 border-l-4 border-l-${sectorInfo.color}-500`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br from-${sectorInfo.color}-500 to-${sectorInfo.color}-600 flex items-center justify-center text-white font-bold text-lg`}
                      >
                        {manager.name?.charAt(0) || "M"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {manager.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          @{manager.username}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full bg-${sectorInfo.color}-100 text-${sectorInfo.color}-700`}
                          >
                            Sector {manager.sectorId}: {sectorInfo.name}
                          </span>
                          {isRecentlyActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                              <FiCheckCircle size={10} /> Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(manager)}
                        className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => openResetModal(manager)}
                        className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                        title="Reset Password"
                      >
                        <FiKey size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(manager._id)}
                        className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiMail size={12} /> {manager.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock size={12} /> Last login: {lastLoginText}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar size={12} /> Created:{" "}
                        {new Date(manager.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {showAddModal ? "Add Sector Manager" : "Edit Sector Manager"}
                </h2>
                <p className="text-purple-100 text-sm">
                  Manage sector access permissions
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Dr. Alemitu Bekele"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="sector2@mint.gov.et"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="sector2.manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Assigned Sector *
                </label>
                <select
                  value={formData.sectorId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sectorId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      Sector {s.id}: {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {showAddModal && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password (leave blank for auto-generate)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Optional"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sendEmail: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      Send welcome email with credentials
                    </span>
                  </label>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={showAddModal ? handleCreate : handleUpdate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {showAddModal ? "Create Account" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedManager && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-amber-100 text-sm">
                  Generate new password for {selectedManager.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedManager(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-5">
              {resetPassword ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <FiCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      New password generated successfully
                    </p>
                    <div className="bg-white rounded-lg p-3 border">
                      <code className="text-lg font-mono font-bold text-green-700">
                        {resetPassword}
                      </code>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Please provide this password to the manager
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowResetModal(false);
                      setSelectedManager(null);
                      setResetPassword("");
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    This will generate a new random password for{" "}
                    <strong>{selectedManager.name}</strong>. The old password
                    will no longer work.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowResetModal(false);
                        setSelectedManager(null);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg"
                    >
                      Generate New Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorManagers;
