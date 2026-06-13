/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiSave,
  FiUpload,
  FiImage,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { sectorService } from "../../services/sectorService";

const SectorsManager = () => {
  const [sectors, setSectors] = useState([]);
  const [filteredSectors, setFilteredSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    building: "A",
    floors: [1],
    room: "",
    color: "#0B2A4A",
    icon: "🏛️",
    image: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    filterSectors();
  }, [searchTerm, sectors]);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const data = await sectorService.getAllSectors();
      setSectors(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Failed to load sectors");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter((s) => s.isActive).length;
    setStats({ total, active });
  };

  const filterSectors = () => {
    let filtered = [...sectors];
    if (searchTerm) {
      filtered = filtered.filter((s) => {
        // name can be a multilingual object {en, am} or a plain string
        const name =
          typeof s.name === "object"
            ? s.name?.en || s.name?.am || ""
            : s.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    setFilteredSectors(filtered);
  };

  // Helper: extract display name from multilingual object or plain string
  const getName = (val) =>
    typeof val === "object" ? val?.en || val?.am || "" : val || "";

  // Helper: extract display description
  const getDesc = (val) =>
    typeof val === "object" ? val?.en || val?.am || "" : val || "";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in name and description");
      return;
    }

    // Sanitize floors — ensure it's always a clean number array
    const cleanFloors = (Array.isArray(formData.floors) ? formData.floors : String(formData.floors).split(","))
      .map((f) => parseInt(String(f).trim(), 10))
      .filter((n) => !isNaN(n));

    if (cleanFloors.length === 0) {
      toast.error("Please enter at least one valid floor number");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("building", formData.building);
      formDataToSend.append("floors", JSON.stringify(cleanFloors));
      formDataToSend.append("room", formData.room || "");
      formDataToSend.append("color", formData.color);
      formDataToSend.append("icon", formData.icon);
      formDataToSend.append("order", String(formData.order || 0));
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const result = await sectorService.createSector(formDataToSend);
      console.log("✅ Sector created:", result);
      toast.success("Sector created successfully");
      setShowModal(false);
      resetForm();
      fetchSectors();
    } catch (error) {
      console.error("❌ Error creating sector:", error);
      toast.error(error.response?.data?.message || "Failed to create sector");
    }
  };

  const handleUpdate = async () => {
    if (!editingSector) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("building", formData.building);
      formDataToSend.append("floors", JSON.stringify(formData.floors));
      formDataToSend.append("room", formData.room || "");
      formDataToSend.append("color", formData.color);
      formDataToSend.append("icon", formData.icon);
      formDataToSend.append("order", String(formData.order || 0));
      formDataToSend.append("isActive", formData.isActive);
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await sectorService.updateSector(editingSector.id, formDataToSend);
      toast.success("Sector updated successfully");
      setShowModal(false);
      setEditingSector(null);
      resetForm();
      fetchSectors();
    } catch (error) {
      console.error("Error updating sector:", error);
      toast.error("Failed to update sector");
    }
  };

  const handleDelete = async (sector) => {
    if (window.confirm(`Are you sure you want to delete "${getName(sector.name)}"?`)) {
      try {
        await sectorService.deleteSector(sector.id);
        toast.success("Sector deleted successfully");
        fetchSectors();
      } catch (error) {
        toast.error("Failed to delete sector");
      }
    }
  };

  const handleToggleStatus = async (sector) => {
    try {
      await sectorService.toggleSectorStatus(sector.id);
      toast.success(`Sector ${sector.isActive ? "disabled" : "activated"}`);
      fetchSectors();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openEditModal = (sector) => {
    setEditingSector(sector);
    setFormData({
      name: getName(sector.name),
      description: getDesc(sector.description),
      building: sector.building,
      floors: sector.floors,
      room: sector.room || "",
      color: sector.color,
      icon: sector.icon,
      image: sector.image || "",
      order: sector.order || sector.id || 0,
      isActive: sector.isActive,
    });
    setImagePreview(sector.image || "");
    setImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      building: "A",
      floors: [1],
      room: "",
      color: "#0B2A4A",
      icon: "🏛️",
      image: "",
      order: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
    setEditingSector(null);
  };

  const buildingOptions = [
    { value: "A", label: "Building A (Main)", icon: "🏛️" },
    { value: "B", label: "Building B (Annex)", icon: "🏢" },
    { value: "A/B", label: "Both Buildings", icon: "🏛️🏢" },
  ];

  const colorPresets = [
    "#1E3A5F",
    "#078930",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#3B82F6",
    "#6B7280",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading sectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toaster position="top-center" />

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              🏛️ Sectors Management
            </h1>
            <p className="text-emerald-100 text-sm">
              Manage ministry sectors (CRUD operations with image upload)
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2"
          >
            <FiPlus size={16} /> New Sector
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Total Sectors</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              🏛️
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Active Sectors</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              🟢
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search sectors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {filteredSectors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">🏛️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No sectors found
          </h3>
          <p className="text-gray-500 text-sm">Create your first sector</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSectors.map((sector) => (
            <div
              key={sector.id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden"
            >
              <div
                className="p-4 border-l-4"
                style={{ borderLeftColor: sector.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={sector.image}
                      alt={sector.name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100";
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {getName(sector.name)}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            sector.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {sector.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 max-w-md">
                        {getDesc(sector.description)?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>Building: {sector.building}</span>
                        <span>Floors: {sector.floors?.join(", ")}</span>
                        {sector.room && <span>Room: {sector.room}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(sector)}
                      className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(sector)}
                      className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                      title={sector.isActive ? "Disable" : "Activate"}
                    >
                      {sector.isActive ? (
                        <FiEyeOff size={14} />
                      ) : (
                        <FiEye size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(sector)}
                      className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingSector ? "Edit Sector" : "Create New Sector"}
                </h2>
                <p className="text-emerald-100 text-sm">
                  Manage sector details
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <FiImage className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to upload sector image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sector Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Executive Leadership"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Sector description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Building
                  </label>
                  <select
                    value={formData.building}
                    onChange={(e) =>
                      setFormData({ ...formData, building: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {buildingOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                  <div>
                  <label className="block text-sm font-medium mb-1">
                    Floors (comma separated)
                  </label>
                  <input
                    type="text"
                    value={
                      // Display raw string while typing; only convert on blur
                      Array.isArray(formData.floors)
                        ? formData.floors.join(", ")
                        : formData.floors
                    }
                    onChange={(e) =>
                      // Store raw string while user is typing — parse on blur
                      setFormData({ ...formData, floors: e.target.value })
                    }
                    onBlur={(e) => {
                      // Parse to clean number array on blur
                      const parsed = e.target.value
                        .split(",")
                        .map((f) => parseInt(f.trim(), 10))
                        .filter((n) => !isNaN(n));
                      setFormData({
                        ...formData,
                        floors: parsed.length > 0 ? parsed : [1],
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., 101"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Icon (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 🏛️"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {colorPresets.map((c) => (
                        <button
                          key={c}
                          onClick={() => setFormData({ ...formData, color: c })}
                          className="w-6 h-6 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order:
                          e.target.value === "" ? 0 : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">
                      Active (visible on public site)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingSector ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  <FiSave size={14} />
                  {editingSector ? "Save Changes" : "Create Sector"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorsManager;
