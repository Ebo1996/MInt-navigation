import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiX,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiStar,
  FiMail,
  FiUser,
  FiCalendar,
  FiMessageCircle,
  FiCheckCircle,
  FiClock,
  FiFilter,
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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    withEmail: 0,
    withName: 0,
    avgFeedback: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, sectorFilter, ratingFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/users");
      const data = response.data.data || response.data || [];
      setUsers(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      const mockData = getMockUsers();
      setUsers(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const withEmail = data.filter(
      (u) => u.email && u.email !== "anonymous",
    ).length;
    const withName = data.filter(
      (u) => u.name && u.name !== "Anonymous",
    ).length;
    const avgFeedback = (
      data.reduce((sum, u) => sum + (u.totalFeedback || 0), 0) / total || 0
    ).toFixed(1);
    setStats({ total, withEmail, withName, avgFeedback });
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (u) => (u.avgRating || 0) >= parseInt(ratingFilter),
      );
    }
    setFilteredUsers(filtered);
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Total Feedback",
      "Avg Rating",
      "First Feedback",
      "Last Feedback",
    ];
    const rows = filteredUsers.map((u) => [
      u.name || "Anonymous",
      u.email || "N/A",
      u.totalFeedback || 0,
      (u.avgRating || 0).toFixed(1),
      u.firstFeedback ? new Date(u.firstFeedback).toLocaleDateString() : "N/A",
      u.lastFeedback ? new Date(u.lastFeedback).toLocaleDateString() : "N/A",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-submitters-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  const getMockUsers = () => {
    return [
      {
        _id: "1",
        name: "John Doe",
        email: "john.doe@email.com",
        totalFeedback: 3,
        avgRating: 4.7,
        firstFeedback: "2024-05-01T10:00:00Z",
        lastFeedback: "2024-05-10T14:30:00Z",
      },
      {
        _id: "2",
        name: "Sara Ahmed",
        email: "sara.ahmed@email.com",
        totalFeedback: 1,
        avgRating: 5.0,
        firstFeedback: "2024-05-09T09:15:00Z",
        lastFeedback: "2024-05-09T09:15:00Z",
      },
      {
        _id: "3",
        name: "Anonymous",
        email: "anonymous",
        totalFeedback: 2,
        avgRating: 3.5,
        firstFeedback: "2024-05-05T11:00:00Z",
        lastFeedback: "2024-05-08T16:20:00Z",
      },
      {
        _id: "4",
        name: "Michael Tefera",
        email: "michael.t@email.com",
        totalFeedback: 5,
        avgRating: 4.9,
        firstFeedback: "2024-04-20T10:00:00Z",
        lastFeedback: "2024-05-10T13:00:00Z",
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">
            Loading feedback submitters...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              👤 Citizen Feedback Directory
            </h1>
            <p className="text-teal-100 text-sm">
              Directory of citizens who have provided feedback
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2"
          >
            <FiDownload size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Total Submitters</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">With Email</p>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.withEmail}
              </p>
            </div>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              📧
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">With Name</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.withName}
              </p>
            </div>
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              📝
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Avg Feedback/User</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.avgFeedback}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              📊
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Ratings</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
            <option value="2">2★ & above</option>
          </select>
          <button
            onClick={fetchUsers}
            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">👤</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No feedback submitters found
          </h3>
          <p className="text-gray-500 text-sm">
            When citizens leave feedback, they will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FiMail size={10} />{" "}
                      {user.email === "anonymous"
                        ? "No email provided"
                        : user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.totalFeedback || 0} feedback
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <FiStar
                        className="text-amber-500 fill-amber-500"
                        size={12}
                      />{" "}
                      {(user.avgRating || 0).toFixed(1)} avg
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewUser(user)}
                    className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">User Profile</h2>
                <p className="text-teal-100 text-sm">
                  Feedback history and statistics
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-semibold text-xl">
                    {selectedUser.name || "Anonymous"}
                  </p>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <FiMail />{" "}
                    {selectedUser.email === "anonymous"
                      ? "No email provided"
                      : selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-teal-600">
                    {selectedUser.totalFeedback || 0}
                  </p>
                  <p className="text-xs text-gray-500">Total Feedback</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <FiStar className="text-amber-500 fill-amber-500" />
                    <p className="text-2xl font-bold text-amber-600">
                      {(selectedUser.avgRating || 0).toFixed(1)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">Average Rating</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedUser.firstFeedback
                      ? Math.ceil(
                          (new Date() - new Date(selectedUser.firstFeedback)) /
                            (1000 * 60 * 60 * 24),
                        )
                      : 0}{" "}
                    days
                  </p>
                  <p className="text-xs text-gray-500">Member Since</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiMessageCircle className="text-teal-600" /> Feedback History
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedUser.feedbacks?.slice(0, 10).map((f, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, s) => (
                              <FiStar
                                key={s}
                                className={`text-xs ${s < f.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {f.rating}.0
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {f.comment || "No comment"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
