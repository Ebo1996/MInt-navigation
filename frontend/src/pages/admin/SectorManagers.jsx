import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiMail,
  FiRefreshCw, FiSearch, FiUserPlus, FiKey,
  FiCheckCircle, FiClock, FiCalendar, FiShield,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const SECTOR_NAMES = {
  1: "Central Administration & Governance",
  2: "Innovation & Research",
  3: "ICT & Digital Economy",
};

// Official wings per sector — from the PDF
const WINGS = {
  1: [
    "Minister's Office",
    "Innovation Fund Office",
    "Strategic Operations Wing",
    "Cooperation & Partnership Wing",
  ],
  2: [
    "Research & Development Infrastructure Lead Executive",
    "Technology Transfer & Development Lead Executive",
    "Innovation Ecosystem Development Lead Executive",
  ],
  3: [
    "E-Government Development Lead Executive",
    "Government ICT Infrastructure Construction & Management Lead Executive",
    "Digital Economy Development Lead Executive",
  ],
};

const EMPTY_FORM = { name: "", email: "", username: "", sectorId: 1, wing: "", password: "", sendEmail: true };

export default function DepartmentHeads() {
  const [heads,          setHeads]          = useState([]);
  const [filtered,       setFiltered]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [showEditModal,  setShowEditModal]  = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedHead,   setSelectedHead]   = useState(null);
  const [resetPassword,  setResetPassword]  = useState("");
  const [searchTerm,     setSearchTerm]     = useState("");
  const [sectorFilter,   setSectorFilter]   = useState("all");
  const [stats,          setStats]          = useState({ total: 0, active: 0, recentlyActive: 0 });
  const [formData,       setFormData]       = useState(EMPTY_FORM);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { applyFilter(); }, [searchTerm, sectorFilter, heads]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res  = await API.get("/admin/sector-managers");
      const data = res.data.data || [];
      setHeads(data);
      setStats({
        total:          data.length,
        active:         data.filter(h => h.isActive !== false).length,
        recentlyActive: data.filter(h => h.lastLogin && (Date.now() - new Date(h.lastLogin)) < 7*24*60*60*1000).length,
      });
    } catch { toast.error("Failed to load department heads"); }
    finally   { setLoading(false); }
  };

  const applyFilter = () => {
    let f = [...heads];
    if (searchTerm)         f = f.filter(h => [h.name, h.email, h.username].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase())));
    if (sectorFilter !== "all") f = f.filter(h => h.sectorId === parseInt(sectorFilter));
    setFiltered(f);
  };

  // group by sector
  const bySector = {};
  for (const h of filtered) {
    if (!bySector[h.sectorId]) bySector[h.sectorId] = [];
    bySector[h.sectorId].push(h);
  }

  /* ── auto-fill username when wing is selected ── */
  const handleWingChange = (wingVal) => {
    const sid   = formData.sectorId;
    const wings = WINGS[sid] || [];
    const idx   = wings.indexOf(wingVal);
    const uname = idx !== -1 ? `sector${sid}dept${idx + 1}` : formData.username;
    setFormData(p => ({ ...p, wing: wingVal, username: uname }));
  };

  const handleSectorChange = (sid) => {
    setFormData(p => ({ ...p, sectorId: parseInt(sid), wing: "", username: "" }));
  };

  /* ── CRUD ── */
  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.username) { toast.error("Name, email, username required"); return; }
    try {
      const res = await API.post("/admin/sector-managers", { ...formData, sectorId: parseInt(formData.sectorId) });
      toast.success("Department head created");
      if (res.data.generatedPassword) toast.success(`Password: ${res.data.generatedPassword}`, { duration: 12000 });
      setShowAddModal(false); setFormData(EMPTY_FORM); fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const handleUpdate = async () => {
    if (!selectedHead) return;
    try {
      await API.put(`/admin/sector-managers/${selectedHead._id}`, {
        name: formData.name, email: formData.email,
        sectorId: parseInt(formData.sectorId), wing: formData.wing || null,
      });
      toast.success("Updated");
      setShowEditModal(false); setSelectedHead(null); setFormData(EMPTY_FORM); fetchAll();
    } catch { toast.error("Failed to update"); }
  };

  const handleResetPassword = async () => {
    if (!selectedHead) return;
    try {
      const res = await API.post(`/admin/sector-managers/${selectedHead._id}/reset-password`);
      setResetPassword(res.data.newPassword);
      toast.success(`New password: ${res.data.newPassword}`, { duration: 15000 });
      fetchAll();
    } catch { toast.error("Failed to reset"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department head account?")) return;
    try { await API.delete(`/admin/sector-managers/${id}`); toast.success("Deleted"); fetchAll(); }
    catch { toast.error("Failed to delete"); }
  };

  const openEdit = (head) => {
    setSelectedHead(head);
    setFormData({ name: head.name||"", email: head.email||"", username: head.username||"",
      sectorId: head.sectorId||1, wing: head.wing||"", password: "", sendEmail: true });
    setShowEditModal(true);
  };

  const fmt = (date) => {
    if (!date) return "Never";
    const d = Math.ceil((Date.now() - new Date(date)) / 86400000);
    return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
    </div>
  );

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">👤 Department Head Administration</h1>
            <p className="text-purple-100 text-sm">One department head per department wing — manages all desks in their wing</p>
          </div>
          <button onClick={() => { setFormData(EMPTY_FORM); setShowAddModal(true); }}
            className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2">
            <FiUserPlus size={16} /> Add Dept Head
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[["Total Heads", stats.total, "emerald"], ["Active", stats.active, "blue"], ["Active (7d)", stats.recentlyActive, "amber"]].map(([label, val, color]) => (
          <div key={label} className={`bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-${color}-500`}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FiShield className="text-blue-500 mt-0.5 shrink-0" size={18} />
        <div>
          <p className="text-sm font-semibold text-blue-800">Credentials & Structure (per official PDF)</p>
          <p className="text-xs text-blue-600 mt-1">
            Password: <code className="bg-blue-100 px-1 rounded">department123</code> &nbsp;|&nbsp;
            Sector 1: 4 departments &nbsp;|&nbsp; Sector 2: 3 departments &nbsp;|&nbsp; Sector 3: 3 departments
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Username pattern: <code className="bg-blue-100 px-1 rounded">sector1dept1</code> … <code className="bg-blue-100 px-1 rounded">sector3dept3</code>
          </p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search by name, email or username…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="all">All Sectors</option>
          {[1,2,3].map(s => <option key={s} value={s}>Sector {s}: {SECTOR_NAMES[s]}</option>)}
        </select>
        <button onClick={fetchAll} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <FiRefreshCw size={16} />
        </button>
      </div>

      {/* Heads list grouped by sector */}
      {Object.keys(bySector).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">👤</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No department heads found</h3>
          <p className="text-gray-500 text-sm">Run the seed script or click "Add Dept Head"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(bySector).sort(([a],[b]) => a - b).map(([sid, sectorHeads]) => (
            <div key={sid} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 flex items-center gap-3">
                <span className="text-yellow-400 font-bold text-sm">Sector {sid}</span>
                <span className="text-white text-sm">{SECTOR_NAMES[sid]}</span>
                <span className="ml-auto text-xs text-slate-400">{sectorHeads.length} head{sectorHeads.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {sectorHeads.map(head => {
                  const isRecent = head.lastLogin && (Date.now() - new Date(head.lastLogin)) < 7*24*60*60*1000;
                  return (
                    <div key={head._id} className="border rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                            {head.name?.charAt(0) || "D"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm">{head.name}</h3>
                            <p className="text-xs text-gray-500">@{head.username}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {head.wing && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                  {head.wing}
                                </span>
                              )}
                              {isRecent && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                  <FiCheckCircle size={9} /> Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(head)}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                            <FiEdit2 size={13} />
                          </button>
                          <button onClick={() => { setSelectedHead(head); setResetPassword(""); setShowResetModal(true); }}
                            className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                            <FiKey size={13} />
                          </button>
                          <button onClick={() => handleDelete(head._id)}
                            className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><FiMail size={11} /> {head.email}</span>
                        <span className="flex items-center gap-1"><FiClock size={11} /> {fmt(head.lastLogin)}</span>
                        <span className="flex items-center gap-1"><FiCalendar size={11} /> {new Date(head.createdAt).toLocaleDateString()}</span>
                        {head.feedbackCount !== undefined && <span className="text-gray-400">{head.feedbackCount} feedbacks</span>}
                        {head.pendingCount > 0 && <span className="text-amber-600 font-semibold">{head.pendingCount} pending</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-5 rounded-t-2xl flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">{showAddModal ? "Add Department Head" : "Edit Department Head"}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setFormData(EMPTY_FORM); }}
                className="text-white hover:bg-white/20 rounded-lg p-1"><FiX size={24} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Sector */}
              <div>
                <label className="block text-sm font-medium mb-1">Sector *</label>
                <select value={formData.sectorId} onChange={e => handleSectorChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  {[1,2,3].map(s => <option key={s} value={s}>Sector {s}: {SECTOR_NAMES[s]}</option>)}
                </select>
              </div>
              {/* Wing / Department */}
              <div>
                <label className="block text-sm font-medium mb-1">Department (Wing) *</label>
                <select value={formData.wing} onChange={e => handleWingChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">-- Select department --</option>
                  {(WINGS[formData.sectorId] || []).map((w, i) => (
                    <option key={w} value={w}>[{i+1}] {w}</option>
                  ))}
                </select>
              </div>
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input type="text" value={formData.username}
                  onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="sector1dept1" />
                <p className="text-xs text-gray-400 mt-1">Auto-filled when you pick a department</p>
              </div>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input type="text" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ato Kebede Alemu" />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="s1d1@mint.gov.et" />
              </div>
              {showAddModal && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password (blank = auto-generate)</label>
                  <input type="password" value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="department123" />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setFormData(EMPTY_FORM); }}
                  className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button onClick={showAddModal ? handleCreate : handleUpdate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                  {showAddModal ? "Create Account" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {showResetModal && selectedHead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-amber-100 text-sm">{selectedHead.name}</p>
              </div>
              <button onClick={() => { setShowResetModal(false); setSelectedHead(null); }}
                className="text-white hover:bg-white/20 rounded-lg p-1"><FiX size={24} /></button>
            </div>
            <div className="p-5">
              {resetPassword ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <FiCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">New password generated</p>
                    <code className="text-lg font-mono font-bold text-green-700">{resetPassword}</code>
                  </div>
                  <button onClick={() => { setShowResetModal(false); setSelectedHead(null); setResetPassword(""); }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Close</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">Generate a new random password for <strong>{selectedHead.name}</strong>?</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setShowResetModal(false); setSelectedHead(null); }}
                      className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                    <button onClick={handleResetPassword}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">Generate</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
