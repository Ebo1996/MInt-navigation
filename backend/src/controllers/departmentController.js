const Department = require("../models/Department");
const Feedback = require("../models/Feedback");

const DEFAULT_DEPARTMENT_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400";

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }
  return fallback;
};

const normalizeString = (value, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const normalizeServices = (services, fallback = { en: [], am: [], om: [] }) => {
  const parsed = parseMaybeJson(services, fallback);
  return {
    en: Array.isArray(parsed?.en)
      ? parsed.en.map((item) => normalizeString(item)).filter(Boolean)
      : fallback.en || [],
    am: Array.isArray(parsed?.am)
      ? parsed.am.map((item) => normalizeString(item)).filter(Boolean)
      : fallback.am || [],
    om: Array.isArray(parsed?.om)
      ? parsed.om.map((item) => normalizeString(item)).filter(Boolean)
      : fallback.om || [],
  };
};

const buildFileUrl = (req, file) => {
  if (!file) return null;
  // Cloudinary returns the full https URL in file.path
  return file.path || null;
};
// ============= PUBLIC ROUTES =============
// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res) => {
  try {
    const { building } = req.query;
    const filter = building && building !== "all" ? { building } : {};
    const departments = await Department.find(filter)
      .sort({ floor: 1, id: 1 })
      .lean();
    res.json(departments);
  } catch (error) {
    console.error("Error in getDepartments:", error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      id: parseInt(req.params.id),
    });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  } catch (error) {
    console.error("Error in getDepartmentById:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get building statistics
// @route   GET /api/departments/stats/buildings
// @access  Public
const getBuildingStats = async (req, res) => {
  try {
    const results = await Department.aggregate([
      {
        $group: {
          _id: "$building",
          count: { $sum: 1 },
          floors: { $addToSet: "$floor" },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const stats = { A: { depts: 0, floors: 0, rating: 4.8 }, B: { depts: 0, floors: 0, rating: 4.7 } };
    for (const r of results) {
      if (r._id === "A" || r._id === "B") {
        stats[r._id] = {
          depts: r.count,
          floors: r.floors.length,
          rating: parseFloat((r.avgRating || 4.8).toFixed(1)),
        };
      }
    }
    res.json(stats);
  } catch (error) {
    console.error("Error in getBuildingStats:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============= ADMIN ROUTES =============

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res) => {
  try {
    const name = parseMaybeJson(req.body.name, {});
    const description = parseMaybeJson(req.body.description, {});
    const directions = parseMaybeJson(req.body.directions, {});
    const services = normalizeServices(req.body.services);

    const building = normalizeString(req.body.building).toUpperCase();
    const room = normalizeString(req.body.room);
    const floor = Number.parseInt(req.body.floor, 10);
    const sectorId = Number.parseInt(req.body.sectorId, 10);

    const departmentImageFile = req.files?.departmentImage?.[0];
    const headImageFile = req.files?.headImage?.[0];
    const departmentImageFromFile = buildFileUrl(req, departmentImageFile);
    const headImageFromFile = buildFileUrl(req, headImageFile);

    if (
      !normalizeString(name?.en) ||
      !normalizeString(description?.en) ||
      !normalizeString(directions?.en) ||
      !["A", "B"].includes(building) ||
      Number.isNaN(floor) ||
      floor < 0 ||
      floor > 8 ||
      !room
    ) {
      return res.status(400).json({
        message:
          "Missing or invalid required fields: name.en, description.en, directions.en, building(A|B), floor(0-8), room",
      });
    }

    // Check if department with same room in same building exists
    const existingRoom = await Department.findOne({ building, room: room.trim() });
    if (existingRoom) {
      return res
        .status(400)
        .json({ message: "Room already exists in this building" });
    }

    // Generate a unique ID (find max existing id + 1)
    const lastDept = await Department.findOne().sort({ id: -1 });
    const newId = lastDept ? lastDept.id + 1 : 1;

    console.log("Generated new ID:", newId);

    const department = await Department.create({
      id: newId, // Auto-generated ID
      sectorId: Number.isNaN(sectorId) ? 1 : sectorId,
      name: {
        en: normalizeString(name.en),
        am: normalizeString(name.am),
        om: normalizeString(name.om),
      },
      description: {
        en: normalizeString(description.en),
        am: normalizeString(description.am),
        om: normalizeString(description.om),
      },
      building,
      floor,
      room,
      directions: {
        en: normalizeString(directions.en),
        am: normalizeString(directions.am),
        om: normalizeString(directions.om),
      },
      services,
      contact: normalizeString(req.body.contact),
      email: normalizeString(req.body.email),
      walkingTime: normalizeString(req.body.walkingTime),
      icon: normalizeString(req.body.icon, "🏢") || "🏢",
      image:
        departmentImageFromFile ||
        normalizeString(req.body.image) ||
        normalizeString(req.body.departmentImage) ||
        DEFAULT_DEPARTMENT_IMAGE,
      departmentImage:
        departmentImageFromFile ||
        normalizeString(req.body.departmentImage) ||
        normalizeString(req.body.image) ||
        DEFAULT_DEPARTMENT_IMAGE,
      head: normalizeString(req.body.head),
      headImage: headImageFromFile || normalizeString(req.body.headImage),
      corridorSide: normalizeString(req.body.corridorSide),
      corridorOrder: req.body.corridorOrder
        ? parseInt(req.body.corridorOrder, 10)
        : 0,
      landmark: normalizeString(req.body.landmark),
      rating: 4.8,
      reviewCount: 0,
    });
    console.log("Department created successfully:", department);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Error in createDepartment:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: error.message || "Failed to create department",
      error: error.name,
    });
  }
};
// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);

    // Find the department first
    let department = await Department.findOne({ id: departmentId });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const nextRoomValue =
      req.body.room !== undefined ? normalizeString(req.body.room) : department.room;
    const nextBuildingValue =
      req.body.building !== undefined
        ? normalizeString(req.body.building).toUpperCase()
        : department.building;

    if (!["A", "B"].includes(nextBuildingValue)) {
      return res.status(400).json({ message: "Building must be A or B" });
    }

    if (req.body.floor !== undefined) {
      const parsedFloor = Number.parseInt(req.body.floor, 10);
      if (Number.isNaN(parsedFloor) || parsedFloor < 0 || parsedFloor > 8) {
        return res.status(400).json({ message: "Floor must be between 0 and 8" });
      }
    }

    const parsedName = parseMaybeJson(req.body.name, null);
    if (parsedName && !normalizeString(parsedName.en, department.name?.en || "")) {
      return res.status(400).json({ message: "Department name (en) is required" });
    }

    // Check if trying to update to an existing room (if room or building changed)
    if (
      (req.body.room && nextRoomValue !== department.room) ||
      (req.body.building && nextBuildingValue !== department.building)
    ) {
      const existingRoom = await Department.findOne({
        building: nextBuildingValue,
        room: nextRoomValue,
        id: { $ne: departmentId },
      });

      if (existingRoom) {
        return res
          .status(400)
          .json({ message: "Room already exists in this building" });
      }
    }

    const namePayload = parseMaybeJson(req.body.name, {});
    const descriptionPayload = parseMaybeJson(req.body.description, {});
    const directionsPayload = parseMaybeJson(req.body.directions, {});
    const servicesPayload = req.body.services
      ? normalizeServices(req.body.services, department.services || {})
      : department.services;

    const departmentImageFile = req.files?.departmentImage?.[0];
    const headImageFile = req.files?.headImage?.[0];
    const departmentImageFromFile = buildFileUrl(req, departmentImageFile);
    const headImageFromFile = buildFileUrl(req, headImageFile);

    // Prepare update data
    const updateData = {
      name: {
        en: normalizeString(namePayload.en, department.name.en),
        am: normalizeString(namePayload.am, department.name.am),
        om: normalizeString(namePayload.om, department.name.om),
      },
      description: {
        en: normalizeString(descriptionPayload.en, department.description.en),
        am: normalizeString(descriptionPayload.am, department.description.am),
        om: normalizeString(descriptionPayload.om, department.description.om),
      },
      sectorId:
        req.body.sectorId !== undefined
          ? Number.parseInt(req.body.sectorId, 10) || department.sectorId
          : department.sectorId,
      building: nextBuildingValue,
      floor:
        req.body.floor !== undefined
          ? parseInt(req.body.floor, 10)
          : department.floor,
      room: nextRoomValue || department.room,
      directions: {
        en: normalizeString(directionsPayload.en, department.directions.en),
        am: normalizeString(directionsPayload.am, department.directions.am),
        om: normalizeString(directionsPayload.om, department.directions.om),
      },
      services: servicesPayload,
      contact:
        req.body.contact === undefined
          ? department.contact
          : normalizeString(req.body.contact),
      email:
        req.body.email === undefined ? department.email : normalizeString(req.body.email),
      walkingTime:
        req.body.walkingTime === undefined
          ? department.walkingTime
          : normalizeString(req.body.walkingTime),
      icon: req.body.icon === undefined ? department.icon : normalizeString(req.body.icon),
      image:
        departmentImageFromFile ||
        (req.body.image === undefined ? department.image : normalizeString(req.body.image)) ||
        (req.body.departmentImage === undefined
          ? department.departmentImage
          : normalizeString(req.body.departmentImage)) ||
        department.image ||
        department.departmentImage ||
        DEFAULT_DEPARTMENT_IMAGE,
      departmentImage:
        departmentImageFromFile ||
        (req.body.departmentImage === undefined
          ? department.departmentImage
          : normalizeString(req.body.departmentImage)) ||
        (req.body.image === undefined ? department.image : normalizeString(req.body.image)) ||
        department.departmentImage ||
        department.image ||
        DEFAULT_DEPARTMENT_IMAGE,
      head: req.body.head === undefined ? department.head : normalizeString(req.body.head),
      headImage:
        headImageFromFile ||
        (req.body.headImage === undefined
          ? department.headImage
          : normalizeString(req.body.headImage)),
      corridorSide:
        req.body.corridorSide === undefined
          ? department.corridorSide
          : normalizeString(req.body.corridorSide),
      corridorOrder:
        req.body.corridorOrder === undefined
          ? department.corridorOrder
          : req.body.corridorOrder
            ? parseInt(req.body.corridorOrder, 10)
            : 0,
      landmark:
        req.body.landmark === undefined
          ? department.landmark
          : normalizeString(req.body.landmark),
    };

    // Update the department
    department = await Department.findOneAndUpdate(
      { id: departmentId },
      updateData,
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Error in updateDepartment:", error);
    res.status(500).json({
      message: error.message || "Failed to update department",
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);

    const department = await Department.findOne({ id: departmentId });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if department has feedback
    const feedbackCount = await Feedback.countDocuments({
      department: departmentId,
    });

    if (feedbackCount > 0) {
      return res.status(400).json({
        message: `Cannot delete department with ${feedbackCount} feedback entries. Delete feedback first.`,
      });
    }
    await Department.findOneAndDelete({ id: departmentId });

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteDepartment:", error);
    res.status(500).json({
      message: error.message || "Failed to delete department",
    });
  }
};
// @desc    Get department statistics (admin)
// @route   GET /api/departments/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalDepts = await Department.countDocuments();
    const buildingACount = await Department.countDocuments({ building: "A" });
    const buildingBCount = await Department.countDocuments({ building: "B" });

    const floors = await Department.distinct("floor");
    const totalFloors = floors.length;

    // Get departments with most feedback
    const deptFeedback = await Feedback.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get department names for top departments
    const topDepartments = await Promise.all(
      deptFeedback.map(async (item) => {
        const dept = await Department.findOne({ id: item._id });
        return {
          departmentId: item._id,
          departmentName: dept ? dept.name.en : "Unknown",
          feedbackCount: item.count,
          rating: dept ? dept.rating : 0,
        };
      }),
    );

    // Get average rating across all departments
    const allDepts = await Department.find({});
    const avgRating =
      allDepts.length > 0
        ? (
            allDepts.reduce((acc, d) => acc + d.rating, 0) / allDepts.length
          ).toFixed(1)
        : "4.8";

    res.json({
      totalDepartments: totalDepts,
      buildingA: buildingACount,
      buildingB: buildingBCount,
      totalFloors,
      averageRating: parseFloat(avgRating),
      topDepartments,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all departments for admin (with additional data)
// @route   GET /api/departments/admin/all
// @access  Private/Admin
const getAdminAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ floor: 1, id: 1 });
    // Get feedback counts for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const feedbackCount = await Feedback.countDocuments({
          department: dept.id,
        });
        const avgRating = await Feedback.aggregate([
          { $match: { department: dept.id } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]);
        return {
          ...dept.toObject(),
          feedbackCount,
          calculatedRating:
            avgRating.length > 0 ? avgRating[0].avg.toFixed(1) : dept.rating,
        };
      }),
    );
    res.json(departmentsWithStats);
  } catch (error) {
    console.error("Error in getAdminAllDepartments:", error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Bulk delete departments
// @route   DELETE /api/departments/admin/bulk
// @access  Private/SuperAdmin
const bulkDeleteDepartments = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No department IDs provided" });
    }
    // Check if any departments have feedback
    const deptsWithFeedback = await Promise.all(
      ids.map(async (id) => {
        const count = await Feedback.countDocuments({
          department: parseInt(id),
        });
        return count > 0 ? id : null;
      }),
    );
    const problematicIds = deptsWithFeedback.filter((id) => id !== null);

    if (problematicIds.length > 0) {
      return res.status(400).json({
        message: "Cannot delete departments with existing feedback",
        departmentIds: problematicIds,
      });
    }
    await Department.deleteMany({ id: { $in: ids.map((id) => parseInt(id)) } });

    res.json({
      success: true,
      message: `Successfully deleted ${ids.length} departments`,
    });
  } catch (error) {
    console.error("Error in bulkDeleteDepartments:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============= EXPORTS =============

module.exports = {
  // Public routes
  getDepartments,
  getDepartmentById,
  getBuildingStats,

  // Admin routes
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAdminStats,
  getAdminAllDepartments,
  bulkDeleteDepartments,
};
