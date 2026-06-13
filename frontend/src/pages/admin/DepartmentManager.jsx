/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiCopy,
  FiImage,
  FiUpload,
  FiLink,
  FiChevronDown,
  FiUser,
  FiMapPin,
  FiStar,
  FiFileText,
  FiBriefcase,
  FiClock,
  FiMail,
  FiPhone,
  FiNavigation,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { departmentService } from "../../services/departmentService";

const DepartmentManager = () => {
  const [deptList, setDeptList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDept, setSelectedDept] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [headImagePreview, setHeadImagePreview] = useState(null);
  const [headImageFile, setHeadImageFile] = useState(null);
  const [editingImagePreview, setEditingImagePreview] = useState(null);
  const [editingImageFile, setEditingImageFile] = useState(null);
  const [editingHeadImagePreview, setEditingHeadImagePreview] = useState(null);
  const [editingHeadImageFile, setEditingHeadImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageTab, setImageTab] = useState("upload");
  const [sectors, setSectors] = useState([]);
  const itemsPerPage = 5;

  const getImageSource = (dept) =>
    dept?.departmentImage ||
    dept?.image ||
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400";

  const [newDepartment, setNewDepartment] = useState({
    name: { en: "" },
    sectorId: 1,
    floor: 1,
    room: "",
    building: "A",
    corridorSide: "",
    corridorOrder: 0,
    landmark: "",
    directions: { en: "" },
    description: { en: "" },
    services: { en: [] },
    walkingTime: "",
    icon: "🏢",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    contact: "",
    email: "",
    head: "",
    headImage: "",
    rating: 4.8,
  });

  // Load departments from API
  useEffect(() => {
    loadDepartments();
    loadSectors();
  }, []);

  const loadSectors = () => {
    const sectorList = [
      { id: 1, name: "Executive Leadership" },
      { id: 2, name: "Innovation & Technology" },
      { id: 3, name: "Finance & Administration" },
      { id: 4, name: "Policy & Strategy" },
      { id: 5, name: "HR & Competency" },
      { id: 6, name: "Operations & Services" },
      { id: 7, name: "Digital & ICT" },
      { id: 8, name: "Support Services" },
    ];
    setSectors(sectorList);
  };

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getAll();
      setDeptList(data);
      setFilteredList(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  // Filter departments
  useEffect(() => {
    let filtered = deptList;

    if (searchTerm) {
      filtered = filtered.filter(
        (dept) =>
          dept.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.room?.includes(searchTerm) ||
          dept.head?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (floorFilter !== "all") {
      filtered = filtered.filter(
        (dept) => dept.floor === parseInt(floorFilter),
      );
    }

    if (buildingFilter !== "all") {
      filtered = filtered.filter((dept) => dept.building === buildingFilter);
    }

    if (sectorFilter !== "all") {
      filtered = filtered.filter(
        (dept) => dept.sectorId === parseInt(sectorFilter),
      );
    }

    setFilteredList(filtered);
    setCurrentPage(1);
  }, [searchTerm, floorFilter, buildingFilter, sectorFilter, deptList]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedDepts = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeadImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setHeadImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeadImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditHeadImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditingHeadImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingHeadImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrl = (url) => {
    setImagePreview(url);
    setNewDepartment({ ...newDepartment, image: url });
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setNewDepartment({
      ...newDepartment,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    });
    setHeadImageFile(null);
    setHeadImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await departmentService.delete(id);
        await loadDepartments();
        toast.success("Department deleted successfully");
      } catch (error) {
        toast.error(error.message || "Failed to delete department");
      }
    }
  };

  const handleEdit = (id) => {
    const dept = deptList.find((d) => d.id === id);
    setEditingId(id);
    setEditingData(JSON.parse(JSON.stringify(dept)));
    setEditingImagePreview(getImageSource(dept));
    setEditingHeadImagePreview(dept?.headImage || "");
    setEditingImageFile(null);
    setEditingHeadImageFile(null);
  };

  const handleEditChange = (field, value) => {
    setEditingData({ ...editingData, [field]: value });
  };

  const handleEditNestedChange = (parent, field, value) => {
    setEditingData({
      ...editingData,
      [parent]: { ...editingData[parent], [field]: value },
    });
  };

  const handleSave = async (id) => {
    try {
      const payload = { ...editingData };
      if (editingImageFile) payload.departmentImageFile = editingImageFile;
      if (editingHeadImageFile) payload.headImageFile = editingHeadImageFile;
      await departmentService.update(id, payload);
      await loadDepartments();
      setEditingId(null);
      setEditingData(null);
      setEditingImagePreview(null);
      setEditingHeadImagePreview(null);
      setEditingImageFile(null);
      setEditingHeadImageFile(null);
      toast.success("Department updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update department");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
    setEditingImagePreview(null);
    setEditingHeadImagePreview(null);
    setEditingImageFile(null);
    setEditingHeadImageFile(null);
  };

  const handleView = (dept) => {
    setSelectedDept(dept);
    setShowViewModal(true);
  };

  const handleDuplicate = async (dept) => {
    try {
      const { id, ...deptCopy } = dept;
      const newDept = {
        ...deptCopy,
        name: { ...dept.name, en: `${dept.name.en} (Copy)` },
      };
      await departmentService.create(newDept);
      await loadDepartments();
      toast.success("Department duplicated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to duplicate department");
    }
  };

  const handleAddDepartment = async () => {
    if (
      !newDepartment.name?.en ||
      !newDepartment.room ||
      !newDepartment.description?.en ||
      !newDepartment.directions?.en
    ) {
      toast.error("Please fill required fields: name, room, description, directions");
      return;
    }

    try {
      setImageUploading(true);
      const departmentToAdd = { ...newDepartment };
      if (imageFile) departmentToAdd.departmentImageFile = imageFile;
      if (headImageFile) departmentToAdd.headImageFile = headImageFile;
      await departmentService.create(departmentToAdd);
      await loadDepartments();
      setShowAddModal(false);
      toast.success("Department added successfully!");

      setNewDepartment({
        name: { en: "" },
        sectorId: 1,
        floor: 1,
        room: "",
        building: "A",
        corridorSide: "",
        corridorOrder: 0,
        landmark: "",
        directions: { en: "" },
        description: { en: "" },
        services: { en: [] },
        walkingTime: "",
        icon: "🏢",
        image:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
        contact: "",
        email: "",
        head: "",
        headImage: "",
        rating: 4.8,
      });
      setImagePreview(null);
      setImageFile(null);
      setHeadImagePreview(null);
      setHeadImageFile(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Failed to add department",
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Sector",
      "Building",
      "Floor",
      "Room",
      "Head",
      "Contact",
      "Email",
      "Rating",
      "Feedback Count",
    ];
    const rows = filteredList.map((d) => [
      d.id,
      d.name?.en || "",
      sectors.find((s) => s.id === d.sectorId)?.name || "",
      d.building,
      d.floor,
      d.room,
      d.head || "",
      d.contact || "",
      d.email || "",
      d.rating || 4.8,
      d.reviewCount || 0,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `departments-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  const floorColors = {
    1: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    2: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    3: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    4: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    5: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🏛️ Department Management
            </h1>
            <p className="text-emerald-100">
              Complete CRUD operations for all ministry departments
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition flex items-center gap-2"
            >
              <FiDownload /> Export CSV
            </button>
            <button
              onClick={loadDepartments}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
          <p className="text-xs text-gray-500">Total Departments</p>
          <p className="text-2xl font-bold text-emerald-600">
            {deptList.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Building A</p>
          <p className="text-2xl font-bold text-blue-600">
            {deptList.filter((d) => d.building === "A").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-cyan-500">
          <p className="text-xs text-gray-500">Building B</p>
          <p className="text-2xl font-bold text-cyan-600">
            {deptList.filter((d) => d.building === "B").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-xs text-gray-500">Avg Rating</p>
          <p className="text-2xl font-bold text-purple-600">
            {(
              deptList.reduce((a, b) => a + (b.rating || 4.8), 0) /
                deptList.length || 0
            ).toFixed(1)}{" "}
            ★
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
          <p className="text-xs text-gray-500">Total Floors</p>
          <p className="text-2xl font-bold text-amber-600">
            {new Set(deptList.map((d) => d.floor)).size}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Sectors</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Floors</option>
            {[1, 2, 3, 4, 5].map((f) => (
              <option key={f} value={f}>
                Floor {f}
              </option>
            ))}
          </select>
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Buildings</option>
            <option value="A">Building A 🏛️</option>
            <option value="B">Building B 🏢</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <FiPlus /> Add Department
          </button>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Sector
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Building
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Floor/Room
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Head
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDepts.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <img
                        src={
                          editingId === dept.id
                            ? editingImagePreview || getImageSource(dept)
                            : getImageSource(dept)
                        }
                        alt={dept.name?.en}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      {editingId === dept.id && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="mt-1 text-xs w-24"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === dept.id ? (
                      <input
                        type="text"
                        value={editingData?.name?.en || ""}
                        onChange={(e) =>
                          handleEditNestedChange("name", "en", e.target.value)
                        }
                        className="px-2 py-1 border rounded text-sm w-40"
                      />
                    ) : (
                      <div>
                        <p className="font-medium text-gray-800">
                          {dept.name?.en}
                        </p>
                        <p className="text-xs text-gray-400">ID: D{dept.id}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === dept.id ? (
                      <select
                        value={editingData?.sectorId || 1}
                        onChange={(e) =>
                          handleEditChange("sectorId", parseInt(e.target.value))
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        {sectors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm">
                        {sectors.find((s) => s.id === dept.sectorId)?.name ||
                          "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === dept.id ? (
                      <select
                        value={editingData?.building || "A"}
                        onChange={(e) =>
                          handleEditChange("building", e.target.value)
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${dept.building === "A" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {dept.building === "A" ? "🏛️ A" : "🏢 B"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === dept.id ? (
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={editingData?.floor || 1}
                          onChange={(e) =>
                            handleEditChange("floor", parseInt(e.target.value))
                          }
                          className="w-12 px-1 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          value={editingData?.room || ""}
                          onChange={(e) =>
                            handleEditChange("room", e.target.value)
                          }
                          className="w-16 px-1 py-1 border rounded text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">
                        Floor {dept.floor} • Rm {dept.room}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === dept.id ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editingData?.head || ""}
                          onChange={(e) =>
                            handleEditChange("head", e.target.value)
                          }
                          className="px-2 py-1 border rounded text-sm w-32"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditHeadImageUpload}
                          className="text-xs w-24"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {dept.headImage && (
                          <img
                            src={dept.headImage}
                            alt={dept.head || "Head"}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        )}
                        <span className="text-sm">{dept.head || "—"}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <FiStar
                        className="text-amber-500 fill-amber-500"
                        size={14}
                      />
                      <span className="font-semibold">
                        {dept.rating || 4.8}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {editingId === dept.id ? (
                        <>
                          <button
                            onClick={() => handleSave(dept.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <FiSave size={14} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                            title="Cancel"
                          >
                            <FiX size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleView(dept)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(dept.id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(dept)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                            title="Duplicate"
                          >
                            <FiCopy size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredList.length > itemsPerPage && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredList.length)} of{" "}
            {filteredList.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              <FiChevronLeft /> Prev
            </button>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Add New Department
                </h2>
                <p className="text-emerald-100 text-sm">
                  Fill in department details
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={newDepartment.name.en}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      name: { en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Technology Center"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sector *
                  </label>
                  <select
                    value={newDepartment.sectorId}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        sectorId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Building *
                  </label>
                  <select
                    value={newDepartment.building}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        building: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="A">Building A 🏛️</option>
                    <option value="B">Building B 🏢</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Floor *
                  </label>
                  <input
                    type="number"
                    value={newDepartment.floor}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        floor: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={newDepartment.room}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        room: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 101"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  value={newDepartment.description.en}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      description: { en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe the department's responsibilities..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Directions *
                </label>
                <textarea
                  rows="2"
                  value={newDepartment.directions.en}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      directions: { en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Take elevator to Floor 2, room 214 on the right corridor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Services (comma separated)
                </label>
                <input
                  type="text"
                  value={newDepartment.services.en.join(", ")}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      services: {
                        en: e.target.value.split(",").map((s) => s.trim()),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Tech support, Innovation consulting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Head of Department
                </label>
                <input
                  type="text"
                  value={newDepartment.head}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, head: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Dr. Belete Molla"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={newDepartment.contact}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        contact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newDepartment.email}
                    onChange={(e) =>
                      setNewDepartment({
                        ...newDepartment,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department Image URL (optional)
                </label>
                <input
                  type="url"
                  value={newDepartment.image}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      image: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Image URL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Department Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {(imagePreview || newDepartment.image) && (
                    <img
                      src={imagePreview || newDepartment.image}
                      alt="Department preview"
                      className="mt-2 w-24 h-24 rounded-lg object-cover border"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Head Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeadImageUpload}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {headImagePreview && (
                    <img
                      src={headImagePreview}
                      alt="Head preview"
                      className="mt-2 w-20 h-20 rounded-full object-cover border"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  disabled={imageUploading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {imageUploading ? "Adding..." : "Add Department"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Department Modal */}
      {showViewModal && selectedDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedDept.name?.en}
                </h2>
                <p className="text-emerald-100 text-sm">Department Details</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-6 mb-6">
                <img
                  src={
                    getImageSource(selectedDept).replace("w=400", "w=200")
                  }
                  alt={selectedDept.name?.en}
                  className="w-28 h-28 rounded-xl object-cover border-4 border-emerald-100"
                />
                <div>
                  <div className="flex gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${selectedDept.building === "A" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {selectedDept.building === "A"
                        ? "🏛️ Building A"
                        : "🏢 Building B"}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      Floor {selectedDept.floor}
                    </span>
                  </div>
                  <p className="text-gray-600">Room {selectedDept.room}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDept.walkingTime || "2 min walk"}
                  </p>
                </div>
              </div>
              {selectedDept.head && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FiUser className="text-emerald-600" /> Head of Department
                  </h3>
                  <p>{selectedDept.head}</p>
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FiFileText className="text-emerald-600" /> Description
                </h3>
                <p className="text-gray-700">{selectedDept.description?.en}</p>
              </div>
              {selectedDept.services?.en?.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FiStar className="text-emerald-600" /> Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDept.services.en.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={
                          i < Math.round(selectedDept.rating || 4.8)
                            ? "fill-yellow-400"
                            : ""
                        }
                      />
                    ))}
                  </div>
                  <span className="font-semibold">
                    {(selectedDept.rating || 4.8).toFixed(1)} ★
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {selectedDept.reviewCount || 0} reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
