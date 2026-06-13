import React, { useState, useEffect } from "react";
import {
  FiAlertTriangle, FiCheckCircle,
  FiClock, FiSearch, FiEye, FiTrash2, FiX,
  FiUser, FiMail, FiCalendar, FiEdit3,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
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

const T = {
  navy:      "#0B2A4A",
  navyLight: "#1C3F65",
  gold:      "#C8961E",
  surface:   "#F0F4FA",
  card:      "#FFFFFF",
  border:    "#D8E2EF",
  text:      "#0B2A4A",
  textSub:   "#4A5568",
  textMuted: "#8896A6",
  red:       "#DC2626",
  redLight:  "#FEF2F2",
  redBorder: "#FECACA",
  green:     "#16A34A",
  greenLight:"#F0FDF4",
  amber:     "#D97706",
  amberLight:"#FFFBEB",
};

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: T.amber,  bg: T.amberLight,  icon: FiClock },
  reviewed: { label: "Reviewed", color: T.navy,   bg: T.surface,     icon: FiEye },
  resolved: { label: "Resolved", color: T.green,  bg: T.greenLight,  icon: FiCheckCircle },
};

const TYPE_CONFIG = {
  complaint: { label: "Complaint", color: T.red, bg: T.redLight, icon: FiAlertTriangle },
};

const Badge = ({ cfg }) => {
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

/* ════════════════════════════════════════════════ */
const SystemComplaints = () => {
  const [items,    setItems]    = useState([]);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [note,     setNote]     = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        API.get("/system-complaints"),
        API.get("/system-complaints/stats"),
      ]);
      setItems(listRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openItem = (item) => {
    setSelected(item);
    setNote(item.adminNote || "");
  };

  const handleUpdate = async (newStatus) => {
    if (!selected) return;
    setSaving(true);
    try {
      await API.put(`/system-complaints/${selected._id}`, {
        status: newStatus,
        adminNote: note,
      });
      toast.success("Updated successfully");
      setSelected(null);
      loadData();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await API.delete(`/system-complaints/${id}`);
      toast.success("Deleted");
      setSelected(null);
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = items.filter((item) => {
    if (status !== "all" && item.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.subject?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q) ||
        item.visitor?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: T.text }}>System Inbox</h1>
        <p className="text-sm mt-1" style={{ color: T.textMuted }}>
          Comments and complaints submitted by users about the system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: stats.total,    color: T.navy  },
          { label: "Pending",  value: stats.pending,  color: T.amber },
          { label: "Reviewed", value: stats.reviewed, color: T.navy  },
          { label: "Resolved", value: stats.resolved, color: T.green },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center"
            style={{ background: T.card, border: `1px solid ${T.border}` }}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value ?? "—"}</div>
            <div className="text-xs mt-1" style={{ color: T.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, message, name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
            style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none" }}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text, outline: "none" }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `${T.navy} transparent ${T.navy} ${T.navy}` }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: T.textMuted }}>
          <FiAlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const typeCfg   = TYPE_CONFIG[item.type]   || TYPE_CONFIG.comment;
            const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <div key={item._id}
                className="rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md"
                style={{ background: T.card, border: `1px solid ${item.type === "complaint" ? T.redBorder : T.border}` }}
                onClick={() => openItem(item)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: typeCfg.bg }}>
                  <typeCfg.icon size={18} style={{ color: typeCfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm truncate" style={{ color: T.text }}>{item.subject}</span>
                    <Badge cfg={typeCfg} />
                    <Badge cfg={statusCfg} />
                  </div>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: T.textSub }}>{item.message}</p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: T.textMuted }}>
                    <span className="flex items-center gap-1"><FiUser size={10} />{item.visitor || "Anonymous"}</span>
                    <span className="flex items-center gap-1"><FiCalendar size={10} />{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                  className="p-2 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: T.textMuted }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}
                  title="Delete"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelected(null)}
        >
          <div className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: T.card, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${T.border}`, background: selected.type === "complaint" ? T.redLight : T.surface }}>
              <div className="flex items-center gap-2">
                {selected.type === "complaint"
                  ? <FiAlertTriangle size={18} style={{ color: T.red }} />
                  : <FiMessageSquare size={18} style={{ color: T.navy }} />}
                <span className="font-bold text-sm" style={{ color: T.text }}>
                  {selected.type === "complaint" ? "Complaint Detail" : "Comment Detail"}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg"
                style={{ color: T.textMuted }} onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}>
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Subject */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>Subject</p>
                <p className="font-bold" style={{ color: T.text }}>{selected.subject}</p>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>Message</p>
                <p className="text-sm leading-relaxed p-3 rounded-xl" style={{ color: T.textSub, background: T.surface }}>{selected.message}</p>
              </div>

              {/* Submitter info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: T.surface }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>Submitted by</p>
                  <p className="text-sm flex items-center gap-1.5" style={{ color: T.text }}>
                    <FiUser size={13} />{selected.visitor || "Anonymous"}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: T.surface }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>Email</p>
                  <p className="text-sm flex items-center gap-1.5 truncate" style={{ color: T.text }}>
                    <FiMail size={13} />{selected.visitorEmail || "—"}
                  </p>
                </div>
              </div>

              {/* Date + Status */}
              <div className="flex items-center gap-3">
                <Badge cfg={TYPE_CONFIG[selected.type] || TYPE_CONFIG.comment} />
                <Badge cfg={STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending} />
                <span className="text-xs ml-auto" style={{ color: T.textMuted }}>
                  {new Date(selected.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Admin note */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: T.textMuted }}>
                  <FiEdit3 size={11} /> Admin Note (internal)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add an internal note about this entry…"
                  className="w-full p-3 rounded-xl text-sm resize-none"
                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, outline: "none" }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {selected.status !== "reviewed" && (
                  <button onClick={() => handleUpdate("reviewed")} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: T.navy }}>
                    {saving ? "Saving…" : "Mark Reviewed"}
                  </button>
                )}
                {selected.status !== "resolved" && (
                  <button onClick={() => handleUpdate("resolved")} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: T.green }}>
                    {saving ? "Saving…" : "Mark Resolved"}
                  </button>
                )}
                <button onClick={() => handleDelete(selected._id)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: T.redLight, color: T.red }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemComplaints;
