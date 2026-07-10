const Sector = require("../models/Sector");
const Department = require("../models/Department");
const Feedback = require("../models/Feedback");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// ── Sector images → Cloudinary ──
const sectorStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "mint/sectors",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 630, crop: "limit", quality: "auto" }],
    public_id: `sector-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  }),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage: sectorStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// ==============================================
// PUBLIC ROUTES (No Auth Required)
// ==============================================

const getPublicSectors = async (req, res) => {
  try {
    const sectors = await Sector.find({ isActive: true })
      .sort({ order: 1, id: 1 })
      .lean();

    if (sectors.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const sectorIds = sectors.map((s) => s.id);

    // Single query for all departments in these sectors
    const allDepts = await Department.find(
      { sectorId: { $in: sectorIds } },
      { id: 1, sectorId: 1, rating: 1 }
    ).lean();

    // Single aggregation for avg rating per sector
    const deptIds = allDepts.map((d) => d.id);
    const feedbackAgg = await Feedback.aggregate([
      { $match: { department: { $in: deptIds } } },
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "id",
          as: "dept",
        },
      },
      { $unwind: "$dept" },
      {
        $group: {
          _id: "$dept.sectorId",
          totalFeedback: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const feedbackBySector = {};
    for (const f of feedbackAgg) {
      feedbackBySector[f._id] = {
        totalFeedback: f.totalFeedback,
        avgRating: parseFloat(f.avgRating.toFixed(1)),
      };
    }

    const deptCountBySector = {};
    for (const d of allDepts) {
      deptCountBySector[d.sectorId] = (deptCountBySector[d.sectorId] || 0) + 1;
    }

    const sectorsWithStats = sectors.map((sector) => ({
      ...sector,
      departmentCount: deptCountBySector[sector.id] || 0,
      avgRating: feedbackBySector[sector.id]?.avgRating ?? 4.5,
      totalFeedback: feedbackBySector[sector.id]?.totalFeedback ?? 0,
    }));

    res.json({ success: true, data: sectorsWithStats });
  } catch (error) {
    console.error("Error in getPublicSectors:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPublicSectorById = async (req, res) => {
  try {
    const sectorId = parseInt(req.params.id);
    const sector = await Sector.findOne({ id: sectorId, isActive: true }).lean();
    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }

    // Departments + feedback stats in parallel
    const departments = await Department.find({ sectorId: sector.id })
      .sort({ floor: 1, id: 1 })
      .lean();

    const departmentIds = departments.map((d) => d.id);

    const fbStats = await Feedback.aggregate([
      { $match: { department: { $in: departmentIds } } },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const totalFeedback = fbStats[0]?.totalFeedback ?? 0;
    const avgRating = fbStats[0]
      ? parseFloat(fbStats[0].avgRating.toFixed(1))
      : 4.5;

    res.json({
      success: true,
      data: {
        ...sector,
        departments,
        departmentCount: departments.length,
        totalFeedback,
        avgRating,
      },
    });
  } catch (error) {
    console.error("Error in getPublicSectorById:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// ADMIN ROUTES
// ==============================================

const getAllSectors = async (req, res) => {
  try {
    const sectors = await Sector.find().sort({ order: 1, id: 1 });
    const sectorsWithStats = await Promise.all(
      sectors.map(async (sector) => {
        const departments = await Department.find({ sectorId: sector.id });
        const departmentCount = departments.length;
        const departmentIds = departments.map((d) => d.id);
        const feedbacks = await Feedback.find({
          department: { $in: departmentIds },
        });
        const totalFeedback = feedbacks.length;
        const avgRating =
          totalFeedback > 0
            ? (
                feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
              ).toFixed(1)
            : 4.5;
        return {
          ...sector.toObject(),
          departmentCount,
          totalFeedback,
          avgRating: parseFloat(avgRating),
        };
      }),
    );
    res.json({ success: true, data: sectorsWithStats });
  } catch (error) {
    console.error("Error in getAllSectors:", error);
    res.status(500).json({ message: error.message });
  }
};

const getSectorById = async (req, res) => {
  try {
    const sectorId = parseInt(req.params.id);
    const sector = await Sector.findOne({ id: sectorId });
    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }
    res.json({ success: true, data: sector });
  } catch (error) {
    console.error("Error in getSectorById:", error);
    res.status(500).json({ message: error.message });
  }
};

const createSector = async (req, res) => {
  try {
    console.log("📦 Received file:", req.file);
    console.log("📦 Received body:", req.body);

    // Extract fields from req.body (multer parses text fields automatically)
    const { name, description, building, floors, color, icon, room, order } =
      req.body;
    let image = req.body.image;

    // Validate required fields
    if (!name || !description || !building || !floors) {
      console.log("❌ Missing fields:", {
        name,
        description,
        building,
        floors,
      });
      return res.status(400).json({
        message: "Missing required fields",
        missing: {
          name: !name,
          description: !description,
          building: !building,
          floors: !floors,
        },
      });
    }

    // Handle file upload — Cloudinary returns full URL in req.file.path
    if (req.file) {
      image = req.file.path;
    }

    // Check if sector with same name exists
    const existingSector = await Sector.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingSector) {
      return res
        .status(400)
        .json({ message: "Sector with this name already exists" });
    }

    // Get next ID
    const lastSector = await Sector.findOne().sort({ id: -1 });
    const newId = lastSector ? lastSector.id + 1 : 1;

    // Parse floors if it's a string
    let parsedFloors = floors;
    if (typeof floors === "string") {
      try {
        parsedFloors = JSON.parse(floors);
      } catch (e) {
        parsedFloors = floors.split(",").map((f) => parseInt(f.trim()));
      }
    }

    const sector = await Sector.create({
      id: newId,
      name,
      description,
      building,
      floors: parsedFloors,
      room: room || "",
      color: color || "#086976",
      icon: icon || "🏛️",
      image:
        image ||
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop",
      order: order || newId,
      isActive: true,
    });

    console.log("✅ Sector created:", sector.name);
    res.status(201).json({ success: true, data: sector });
  } catch (error) {
    console.error("❌ Error in createSector:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const updateSector = async (req, res) => {
  try {
    const sectorId = parseInt(req.params.id);
    const {
      name,
      description,
      building,
      floors,
      color,
      icon,
      room,
      order,
      isActive,
    } = req.body;
    let image = req.body.image;

    const sector = await Sector.findOne({ id: sectorId });
    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }

    // Handle file upload — Cloudinary returns full URL in req.file.path
    if (req.file) {
      image = req.file.path;
    }

    if (name && name !== sector.name) {
      const existingSector = await Sector.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (existingSector) {
        return res
          .status(400)
          .json({ message: "Sector with this name already exists" });
      }
    }

    if (name) sector.name = name;
    if (description) sector.description = description;
    if (building) sector.building = building;
    if (floors) {
      let parsedFloors = floors;
      if (typeof floors === "string") {
        try {
          parsedFloors = JSON.parse(floors);
        } catch (e) {
          parsedFloors = floors.split(",").map((f) => parseInt(f.trim()));
        }
      }
      sector.floors = parsedFloors;
    }
    if (room !== undefined) sector.room = room;
    if (color) sector.color = color;
    if (icon) sector.icon = icon;
    if (image) sector.image = image;
    if (order !== undefined) sector.order = order;
    if (isActive !== undefined) sector.isActive = isActive;

    await sector.save();
    res.json({ success: true, data: sector });
  } catch (error) {
    console.error("Error in updateSector:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteSector = async (req, res) => {
  try {
    const sectorId = parseInt(req.params.id);
    const sector = await Sector.findOne({ id: sectorId });
    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }
    const departments = await Department.find({ sectorId: sector.id });
    if (departments.length > 0) {
      return res.status(400).json({
        message: `Cannot delete sector with ${departments.length} departments. Move or delete departments first.`,
      });
    }
    await sector.deleteOne();
    res.json({ success: true, message: "Sector deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSector:", error);
    res.status(500).json({ message: error.message });
  }
};

const toggleSectorStatus = async (req, res) => {
  try {
    const sectorId = parseInt(req.params.id);
    const sector = await Sector.findOne({ id: sectorId });
    if (!sector) {
      return res.status(404).json({ message: "Sector not found" });
    }
    sector.isActive = !sector.isActive;
    await sector.save();
    res.json({ success: true, data: sector });
  } catch (error) {
    console.error("Error in toggleSectorStatus:", error);
    res.status(500).json({ message: error.message });
  }
};

const getSectorStats = async (req, res) => {
  try {
    const totalSectors = await Sector.countDocuments();
    const activeSectors = await Sector.countDocuments({ isActive: true });
    const allDepartments = await Department.find();
    const totalDepartments = allDepartments.length;
    const allFeedback = await Feedback.find();
    const totalFeedback = allFeedback.length;
    const avgRating =
      totalFeedback > 0
        ? (
            allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
          ).toFixed(1)
        : 0;
    res.json({
      success: true,
      data: {
        totalSectors,
        activeSectors,
        totalDepartments,
        totalFeedback,
        avgRating: parseFloat(avgRating),
      },
    });
  } catch (error) {
    console.error("Error in getSectorStats:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPublicSectors,
  getPublicSectorById,
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
  toggleSectorStatus,
  getSectorStats,
  upload,
};
