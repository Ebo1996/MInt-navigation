/**
 * DepartmentsManager.jsx
 * Admin page for managing Departments (wings/groups within sectors).
 * Hierarchy: Sector → Department → Desk
 *
 * Departments are derived from the `wing` field on Desk (Department) records.
 * Admin can rename a department, reassign it to a different sector,
 * or see all desks inside it.
 */
import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX,
  FiSearch, FiRefreshCw, FiLayers, FiChevronDown,
  FiChevronRight, FiGrid, FiUsers, FiMapPin,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import API from "../../services/api";
import { departmentService } from "../../services/departmentService";

/* ── The 10 official departments per the MINT directory ── */
const OFFICIAL_WINGS = {
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

const WING_ICONS = {
  "Minister's Office": "🏛️",
  "Innovation Fund Office": "💡",
  "Strategic Operations Wing": "⚙️",
  "Cooperation & Partnership Wing": "🤝",
  "Research & Development Infrastructure Lead Executive": "🔬",
  "Technology Transfer & Development Lead Executive": "🔄",
  "Innovation Ecosystem Development Lead Executive": "🌱",
  "E-Government Development Lead Executive": "🖥️",
  "Government ICT Infrastructure Construction & Management Lead Executive": "🔧",
  "Digital Economy Development Lead Executive": "🌐",
};

export default function DepartmentsManager() {
  const [sectors,   setSectors]   = useState([]);
  const [allDesks,  setAllDesks]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  /* department list built from desks data */
  const [departments, setDepartments] = useState([]);

  /* add modal */
  const [showAdd,    setShowAdd]    = useState(false);
  const [addForm,    setAddForm]    = useState({ sectorId: 1, name: "", nameAm: "" });

  /* edit modal */
  const [editDept,   setEditDept]   = useState(null); // { sectorId, wing, newName, newNameAm, newSectorId }

  /* expand row */
  const [expanded,   setExpanded]   = useState({});

  /* ── load ── */
  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [secRes, desks] = await Promise.all([
        API.get("/sectors"),
        departmentService.getAll(),
      ]);
      const secs = (secRes.data?.data || secRes.data || []).map(s => ({
        id: s.id,
        name: typeof s.name === "object" ? (s.name.en || "") : s.name,
      }));
      setSectors(secs);
      setAllDesks(desks || []);
      buildDepartments(secs, desks || []);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const buildDepartments = (secs, desks) => {
    /* group desks by sectorId + wing */
    const map = {};
    for (const d of desks) {
      const wing = d.wing || "Unassigned";
      const key  = `${d.sectorId}__${wing}`;
      if (!map[key]) {
        map[key] = {
          key,
          sectorId:   d.sectorId,
          sectorName: secs.find(s => s.id === d.sectorId)?.name || `Sector ${d.sectorId}`,
          name:       wing,
          deskCount:  0,
          desks:      [],
        };
      }
      map[key].deskCount++;
      map[key].desks.push(d);
    }
    setDepartments(Object.values(map).sort((a,b) => a.sectorId - b.sectorId || a.name.localeCompare(b.name)));
  };

  /* ── rename a department (update wing on all its desks) ── */
  const handleRename = async () => {
    if (!editDept?.newName?.trim()) { toast.error("Name is required"); return; }
    try {
      const deskIds = allDesks
        .filter(d => d.sectorId === editDept.sectorId && d.wing === editDept.wing)
        .map(d => d.id);
      await Promise.all(
        deskIds.map(id =>
          departmentService.update(id, {
            wing:     editDept.newName.trim(),
            sectorId: editDept.newSectorId,
          })
        )
      );
      toast.success(`Renamed to "${editDept.newName}" — ${deskIds.length} desks updated`);
      setEditDept(null);
      load();
    } catch {
      toast.error("Failed to rename department");
    }
  };

  /* ── add a new (empty) department — just creates a placeholder entry ── */
  const handleAdd = async () => {
    if (!addForm.name.trim()) { toast.error("Department name is required"); return; }
    /* Check it doesn't already exist */
    const exists = departments.find(
      d => d.sectorId === addForm.sectorId && d.name.toLowerCase() === addForm.name.trim().toLowerCase()
    );
    if (exists) { toast.error("Department already exists in this sector"); return; }
    toast.success(`Department "${addForm.name}" is ready — add desks to populate it`);
    setShowAdd(false);
    setAddForm({ sectorId: 1, name: "", nameAm: "" });
    /* Note: departments only exist when they have desks — the name is stored on desks */
  };

  /* ── delete a department (removes wing from all its desks) ── */
  const handleDelete = async (dept) => {
    if (!window.confirm(
      `Delete department "${dept.name}"?\nThis will clear the department field on ${dept.deskCount} desk(s). The desks will remain but won't belong to any department.`
    )) return;
    try {
      await Promise.all(
        dept.desks.map(d => departmentService.update(d.id, { wing: "" }))
      );
      toast.success(`Department deleted — ${dept.deskCount} desk(s) unassigned`);
      load();
    } catch {
      toast.error("Failed to delete department");
    }
  };

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.sectorName.toLowerCase().includes(search.toLowerCase())
  );

  /* group filtered by sector for display */
  const bySector = {};
  for (const d of filtered) {
    if (!bySector[d.sectorId]) bySector[d.sectorId] = { name: d.sectorName, items: [] };
    bySector[d.sectorId].items.push(d);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto" />
        <p className="mt-4 text-gray-500">Loading departments…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏢 Department Management</h1>
            <p className="text-teal-100">
              Departments sit between Sectors and Desks — Sector → <strong>Department</strong> → Desk
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={load}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition flex items-center gap-2">
              <FiPlus /> Add Department
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-teal-500">
          <p className="text-xs text-gray-500">Total Departments</p>
          <p className="text-2xl font-bold text-teal-600">{departments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Total Desks</p>
          <p className="text-2xl font-bold text-blue-600">{allDesks.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-indigo-500">
          <p className="text-xs text-gray-500">Sectors</p>
          <p className="text-2xl font-bold text-indigo-600">{sectors.length}</p>
        </div>
      </div>

      {/* ── Hierarchy explanation ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FiLayers className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
        <div>
          <p className="text-sm font-semibold text-blue-800">Hierarchy</p>
          <p className="text-xs text-blue-600 mt-0.5">
            <strong>Sector</strong> (e.g. Central Administration) →{" "}
            <strong>Department</strong> (e.g. Minister's Office) →{" "}
            <strong>Desk</strong> (e.g. Legal Affairs Executive)
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Departments are managed here. To rename a department it updates the wing field on all its desks automatically.
          </p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search departments or sectors…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>

      {/* ── Department list grouped by sector ── */}
      <div className="space-y-6">
        {Object.entries(bySector).map(([sectorId, { name: sectorName, items }]) => (
          <div key={sectorId} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* Sector header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800 flex items-center gap-3">
              <FiGrid className="text-yellow-400" size={16} />
              <h3 className="font-bold text-white text-sm">{sectorName}</h3>
              <span className="ml-auto text-xs text-slate-400">{items.length} departments</span>
            </div>

            {/* Department rows */}
            <div className="divide-y">
              {items.map(dept => {
                const icon = WING_ICONS[dept.name] || "🏢";
                const isExpanded = expanded[dept.key];
                return (
                  <div key={dept.key}>
                    {/* Department row */}
                    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpanded(prev => ({ ...prev, [dept.key]: !prev[dept.key] }))}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        {isExpanded ? <FiChevronDown size={14}/> : <FiChevronRight size={14}/>}
                      </button>

                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-slate-50">
                        {icon}
                      </div>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{dept.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FiUsers size={10}/> {dept.deskCount} {dept.deskCount === 1 ? "desk" : "desks"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditDept({
                            sectorId:     dept.sectorId,
                            wing:         dept.name,
                            newName:      dept.name,
                            newNameAm:    dept.nameAm || "",
                            newSectorId:  dept.sectorId,
                          })}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Rename">
                          <FiEdit2 size={14}/>
                        </button>
                        <button
                          onClick={() => handleDelete(dept)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                          <FiTrash2 size={14}/>
                        </button>
                      </div>
                    </div>

                    {/* Expanded desks list */}
                    {isExpanded && (
                      <div className="bg-slate-50 border-t px-6 py-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Desks in this department
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dept.desks.map(d => (
                            <div key={d.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"/>
                              <span className="font-medium text-gray-700 truncate">
                                {typeof d.name === "object" ? d.name.en : d.name}
                              </span>
                              {d.room && (
                                <span className="ml-auto text-gray-400 flex items-center gap-1 flex-shrink-0">
                                  <FiMapPin size={9}/> Rm {d.room}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border py-16 text-center text-gray-400">
            <FiLayers size={36} className="mx-auto mb-3 opacity-20"/>
            <p className="font-semibold">No departments found</p>
          </div>
        )}
      </div>

      {/* ── Add Department Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Add Department</h2>
                <p className="text-teal-100 text-xs mt-0.5">Create a new department within a sector</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <FiX size={20}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                <select value={addForm.sectorId}
                  onChange={e => setAddForm({ ...addForm, sectorId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400 mb-1 block">English</span>
                    <input type="text" value={addForm.name}
                      onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="e.g., Minister's Office"
                      dir="ltr" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 mb-1 block">አማርኛ</span>
                    <input type="text" value={addForm.nameAm}
                      onChange={e => setAddForm({ ...addForm, nameAm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-right"
                      placeholder="ለምሳሌ፣ የሚኒስትሩ ጽ/ቤት"
                      dir="auto" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  After creating, add desks and assign them to this department.
                </p>
              </div>

              {/* Quick-fill from official list */}
              {OFFICIAL_WINGS[addForm.sectorId] && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Quick-fill (official departments):</p>
                  <div className="flex flex-wrap gap-2">
                    {OFFICIAL_WINGS[addForm.sectorId].map(w => (
                      <button key={w} onClick={() => setAddForm({ ...addForm, name: w })}
                        className="text-xs px-2.5 py-1 rounded-full border border-teal-200 text-teal-700 hover:bg-teal-50 transition">
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition">
                  Add Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit / Rename Modal ── */}
      {editDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Department</h2>
                <p className="text-amber-100 text-xs mt-0.5">Renaming updates all desks in this department</p>
              </div>
              <button onClick={() => setEditDept(null)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <FiX size={20}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <select value={editDept.newSectorId}
                  onChange={e => setEditDept({ ...editDept, newSectorId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400 mb-1 block">English</span>
                    <input type="text" value={editDept.newName}
                      onChange={e => setEditDept({ ...editDept, newName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      dir="ltr" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 mb-1 block">አማርኛ</span>
                    <input type="text" value={editDept.newNameAm || ""}
                      onChange={e => setEditDept({ ...editDept, newNameAm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-right"
                      placeholder="የአማርኛ ስም"
                      dir="auto" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  This will update the wing field on all {
                    allDesks.filter(d => d.sectorId === editDept.sectorId && d.wing === editDept.wing).length
                  } desk(s) in this department.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditDept(null)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleRename}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2">
                  <FiSave size={14}/> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
