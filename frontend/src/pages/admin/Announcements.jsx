import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCalendar,
  FiClock,
  FiBell,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiMail,
  FiSend,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiTrendingDown,
  FiStar,
  FiFlag,
  FiUser,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import API from "../../services/api";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0,
  });

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "medium",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    showOnHomePage: true,
    showOnAllPages: false,
    isActive: true,
  });

  const announcementTypes = [
    { value: "general", label: "General", icon: "📢", color: "blue" },
    { value: "holiday", label: "Holiday", icon: "🎉", color: "emerald" },
    { value: "event", label: "Event", icon: "🎪", color: "purple" },
    { value: "maintenance", label: "Maintenance", icon: "🔧", color: "orange" },
    { value: "alert", label: "Alert", icon: "⚠️", color: "red" },
  ];

  const priorityLevels = [
    { value: "low", label: "Low", icon: "🔵", color: "blue" },
    { value: "medium", label: "Medium", icon: "🟡", color: "yellow" },
    { value: "high", label: "High", icon: "🟠", color: "orange" },
    { value: "urgent", label: "Urgent", icon: "🔴", color: "red" },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [searchTerm, statusFilter, typeFilter, announcements]);

  const getApiErrorMessage = (error, fallback) => {
    const apiData = error?.response?.data;
    if (apiData?.message) return apiData.message;

    const validationMessages = apiData?.errors
      ? Object.values(apiData.errors)
          .map((entry) => entry?.message)
          .filter(Boolean)
      : [];

    if (validationMessages.length > 0) {
      return validationMessages.join(", ");
    }

    return error?.message || fallback;
  };

  const hasInvalidDateRange = (startDate, endDate) => {
    if (!endDate?.trim?.()) return false;
    return new Date(endDate) < new Date(startDate);
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await API.get("/announcements");
      const data =
        response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
      setAnnouncements(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
      // Fallback mock data for demo
      const mockData = getMockAnnouncements();
      setAnnouncements(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const total = data.length;
    const active = data.filter(
      (a) => a.isActive && (!a.endDate || new Date(a.endDate) >= now),
    ).length;
    const expired = data.filter(
      (a) => a.endDate && new Date(a.endDate) < now,
    ).length;
    const expiringSoon = data.filter((a) => {
      if (!a.endDate || !a.isActive) return false;
      const daysLeft = Math.ceil(
        (new Date(a.endDate) - now) / (1000 * 60 * 60 * 24),
      );
      return daysLeft <= 3 && daysLeft > 0;
    }).length;
    setStats({ total, active, expired, expiringSoon });
  };

  const filterAnnouncements = () => {
    let filtered = [...announcements];

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.message?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      const now = new Date();
      if (statusFilter === "active") {
        filtered = filtered.filter(
          (a) => a.isActive && (!a.endDate || new Date(a.endDate) >= now),
        );
      } else if (statusFilter === "expired") {
        filtered = filtered.filter(
          (a) => a.endDate && new Date(a.endDate) < now,
        );
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((a) => !a.isActive);
      }
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    setFilteredAnnouncements(filtered);
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }
    if (hasInvalidDateRange(formData.startDate, formData.endDate)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    try {
      const payload = {
        ...formData,
        endDate: formData.endDate?.trim?.() ? formData.endDate : null,
      };
      await API.post("/announcements", payload);
      toast.success("Announcement created successfully");
      setShowAddModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error(getApiErrorMessage(error, "Failed to create announcement"));
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }
    if (hasInvalidDateRange(formData.startDate, formData.endDate)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    try {
      await API.put(`/announcements/${editingAnnouncement._id}`, {
        ...formData,
        endDate: formData.endDate?.trim?.() ? formData.endDate : null,
      });
      toast.success("Announcement updated successfully");
      setShowEditModal(false);
      setEditingAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error(getApiErrorMessage(error, "Failed to update announcement"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await API.delete(`/announcements/${id}`);
        toast.success("Announcement deleted successfully");
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error("Failed to delete announcement");
      }
    }
  };

  const handleToggleStatus = async (announcement) => {
    try {
      await API.patch(`/announcements/${announcement._id}/toggle`);
      toast.success(
        `Announcement ${announcement.isActive ? "disabled" : "activated"} successfully`,
      );
      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling announcement:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDuplicate = async (announcement) => {
    const newAnnouncement = {
      ...announcement,
      title: `${announcement.title} (Copy)`,
      startDate: new Date().toISOString().split("T")[0],
      isActive: true,
    };
    delete newAnnouncement._id;
    delete newAnnouncement.createdAt;
    delete newAnnouncement.updatedAt;
    delete newAnnouncement.__v;

    try {
      await API.post("/announcements", newAnnouncement);
      toast.success("Announcement duplicated successfully");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error duplicating announcement:", error);
      toast.error(getApiErrorMessage(error, "Failed to duplicate announcement"));
    }
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title || "",
      message: announcement.message || "",
      type: announcement.type || "general",
      priority: announcement.priority || "medium",
      startDate: announcement.startDate
        ? new Date(announcement.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: announcement.endDate
        ? new Date(announcement.endDate).toISOString().split("T")[0]
        : "",
      showOnHomePage: announcement.showOnHomePage !== false,
      showOnAllPages: announcement.showOnAllPages || false,
      isActive: announcement.isActive !== false,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "general",
      priority: "medium",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      showOnHomePage: true,
      showOnAllPages: false,
      isActive: true,
    });
  };

  const getStatusInfo = (announcement) => {
    const now = new Date();
    const isExpired =
      announcement.endDate && new Date(announcement.endDate) < now;
    const daysLeft = announcement.endDate
      ? Math.ceil(
          (new Date(announcement.endDate) - now) / (1000 * 60 * 60 * 24),
        )
      : null;

    if (!announcement.isActive)
      return { label: "Inactive", color: "gray", icon: "⚫" };
    if (isExpired) return { label: "Expired", color: "red", icon: "🔴" };
    if (daysLeft !== null && daysLeft <= 3)
      return { label: `Expires in ${daysLeft}d`, color: "orange", icon: "⚠️" };
    return { label: "Active", color: "green", icon: "🟢" };
  };

  const getTypeInfo = (type) => {
    return (
      announcementTypes.find((t) => t.value === type) || announcementTypes[0]
    );
  };

  const getPriorityInfo = (priority) => {
    return (
      priorityLevels.find((p) => p.value === priority) || priorityLevels[1]
    );
  };

  // Mock data for initial display if API fails
  const getMockAnnouncements = () => {
    return [
      {
        _id: "1",
        title: "National Holiday - Ministry Closed",
        message:
          "The Ministry of Innovation & Technology will be closed on Tuesday, May 28, 2024 in observance of National Day. Regular services will resume on Wednesday, May 29, 2024.",
        type: "holiday",
        priority: "high",
        startDate: "2024-05-28",
        endDate: "2024-05-28",
        isActive: true,
        showOnHomePage: true,
        showOnAllPages: false,
        createdBy: { name: "Admin User" },
        createdAt: "2024-05-20T10:00:00Z",
      },
      {
        _id: "2",
        title: "New Digital Service Launch",
        message:
          "We are pleased to announce the launch of our new E-Service platform. Citizens can now apply for various services online without visiting the ministry.",
        type: "event",
        priority: "high",
        startDate: "2024-05-15",
        endDate: "2024-06-15",
        isActive: true,
        showOnHomePage: true,
        showOnAllPages: true,
        createdBy: { name: "Admin User" },
        createdAt: "2024-05-14T09:00:00Z",
      },
      {
        _id: "3",
        title: "System Maintenance Notice",
        message:
          "The ministry website will be under maintenance on Saturday, May 25, 2024 from 10:00 PM to 2:00 AM. Some online services may be temporarily unavailable.",
        type: "maintenance",
        priority: "medium",
        startDate: "2024-05-25",
        endDate: "2024-05-26",
        isActive: true,
        showOnHomePage: true,
        showOnAllPages: false,
        createdBy: { name: "Admin User" },
        createdAt: "2024-05-22T14:30:00Z",
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              📢 Broadcast Management System
            </h1>
            <p className="text-rose-100 text-sm">
              Manage public announcements & citizen notifications
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2"
          >
            <FiPlus size={16} /> New Announcement
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              📢
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.active}
              </p>
            </div>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              🟢
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              🔴
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search announcements by title or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Types</option>
            {announcementTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchAnnouncements}
            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No announcements found
          </h3>
          <p className="text-gray-500 text-sm">
            Create your first announcement to notify citizens
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
          >
            + Create Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((announcement) => {
            const statusInfo = getStatusInfo(announcement);
            const typeInfo = getTypeInfo(announcement.type);
            const priorityInfo = getPriorityInfo(announcement.priority);
            const daysLeft = announcement.endDate
              ? Math.ceil(
                  (new Date(announcement.endDate) - new Date()) /
                    (1000 * 60 * 60 * 24),
                )
              : null;

            return (
              <div
                key={announcement._id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-sm`}>{typeInfo.icon}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}
                        >
                          {typeInfo.label}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full bg-${priorityInfo.color}-100 text-${priorityInfo.color}-700 flex items-center gap-1`}
                        >
                          <span>{priorityInfo.icon}</span> {priorityInfo.label}{" "}
                          Priority
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full bg-${statusInfo.color === "green" ? "emerald" : statusInfo.color === "orange" ? "orange" : statusInfo.color === "red" ? "red" : "gray"}-100 text-${statusInfo.color === "green" ? "emerald" : statusInfo.color === "orange" ? "orange" : statusInfo.color === "red" ? "red" : "gray"}-700 flex items-center gap-1`}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {announcement.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={12} /> Start:{" "}
                          {new Date(
                            announcement.startDate,
                          ).toLocaleDateString()}
                        </div>
                        {announcement.endDate && (
                          <div className="flex items-center gap-1">
                            <FiCalendar size={12} /> End:{" "}
                            {new Date(
                              announcement.endDate,
                            ).toLocaleDateString()}
                          </div>
                        )}
                        {daysLeft !== null && daysLeft > 0 && (
                          <div className="flex items-center gap-1">
                            <FiClock size={12} /> {daysLeft} days remaining
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FiEye size={12} />{" "}
                          {announcement.showOnHomePage ? "Home Page" : ""}{" "}
                          {announcement.showOnAllPages ? " + All Pages" : ""}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUser size={12} /> Created by:{" "}
                          {announcement.createdBy?.name || "Admin"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(announcement)}
                        className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(announcement)}
                        className="p-1.5 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                        title="Duplicate"
                      >
                        <FiCopy size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(announcement)}
                        className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                        title={announcement.isActive ? "Disable" : "Activate"}
                      >
                        {announcement.isActive ? (
                          <FiEyeOff size={14} />
                        ) : (
                          <FiEye size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Announcement Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {showAddModal
                    ? "Create New Announcement"
                    : "Edit Announcement"}
                </h2>
                <p className="text-emerald-100 text-sm">
                  Broadcast important updates to citizens
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

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Ministry Holiday Closure"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message *
                </label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Detailed announcement message..."
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Announcement Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {announcementTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {priorityLevels.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty for no expiry
                  </p>
                </div>
              </div>

              {/* Display Settings */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomePage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showOnHomePage: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show on Home Page Banner</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnAllPages}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showOnAllPages: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show on All Pages (Top Bar)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active (Visible to public)</span>
                </label>
              </div>

              {/* Actions */}
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {showAddModal ? "Publish Announcement" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
