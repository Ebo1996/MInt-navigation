const Admin = require("../models/Admin");
const Feedback = require("../models/Feedback");
const Department = require("../models/Department");
const Announcement = require("../models/Announcement");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Set JWT in HttpOnly Cookie
const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

// Generate random password
const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// ==============================================
// AUTHENTICATION ROUTES
// ==============================================

// @desc    Login admin
// @route   POST /api/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);
    setTokenCookie(res, token);

    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      sectorId: admin.sectorId || null,
      name: admin.name || admin.username,
      avatar: admin.avatar || null,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/admin/logout
const logoutAdmin = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
};

// ==============================================
// PROFILE ROUTES
// ==============================================

// @desc    Get admin profile
// @route   GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      admin.name = req.body.name || admin.name;
      admin.email = req.body.email || admin.email;
      admin.avatar = req.body.avatar || admin.avatar;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedAdmin = await admin.save();

      const token = generateToken(updatedAdmin._id);
      setTokenCookie(res, token);

      res.json({
        _id: updatedAdmin._id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        sectorId: updatedAdmin.sectorId,
        name: updatedAdmin.name,
        avatar: updatedAdmin.avatar,
        token,
      });
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/admin/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// SECTOR MANAGER MANAGEMENT
// ==============================================

// @desc    Get all sector managers
// @route   GET /api/admin/sector-managers
const getSectorManagers = async (req, res) => {
  try {
    const managers = await Admin.find({ role: "sector_manager" })
      .select("-password")
      .sort({ sectorId: 1 });

    // Get additional stats for each manager
    const managersWithStats = await Promise.all(
      managers.map(async (manager) => {
        const departments = await Department.find({
          sectorId: manager.sectorId,
        });
        const departmentIds = departments.map((d) => d.id);
        const feedbackCount = await Feedback.countDocuments({
          department: { $in: departmentIds },
        });
        const pendingCount = await Feedback.countDocuments({
          department: { $in: departmentIds },
          $or: [{ response: { $exists: false } }, { response: "" }],
          resolved: false,
        });

        return {
          ...manager.toObject(),
          departmentCount: departments.length,
          feedbackCount,
          pendingCount,
        };
      }),
    );

    res.json({ success: true, data: managersWithStats });
  } catch (error) {
    console.error("Error in getSectorManagers:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create sector manager
// @route   POST /api/admin/sector-managers
const createSectorManager = async (req, res) => {
  try {
    const { name, email, username, sectorId, sendEmail } = req.body;

    // Check if exists
    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const generatedPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    const manager = await Admin.create({
      username,
      password: hashedPassword,
      email,
      role: "sector_manager",
      sectorId: parseInt(sectorId),
      name: name,
      avatar: `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${encodeURIComponent(name)}`,
    });

    const managerData = {
      ...manager.toObject(),
      password: sendEmail ? generatedPassword : undefined,
    };
    delete managerData.password;

    res.status(201).json({
      success: true,
      data: managerData,
      generatedPassword: sendEmail ? generatedPassword : null,
    });
  } catch (error) {
    console.error("Error in createSectorManager:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sector manager
// @route   PUT /api/admin/sector-managers/:id
const updateSectorManager = async (req, res) => {
  try {
    const { name, email, sectorId, newPassword } = req.body;
    const manager = await Admin.findById(req.params.id);

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    if (name) manager.name = name;
    if (email) manager.email = email;
    if (sectorId) manager.sectorId = parseInt(sectorId);
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      manager.password = await bcrypt.hash(newPassword, salt);
    }

    await manager.save();

    res.json({ success: true, message: "Manager updated successfully" });
  } catch (error) {
    console.error("Error in updateSectorManager:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset sector manager password
// @route   POST /api/admin/sector-managers/:id/reset-password
const resetSectorManagerPassword = async (req, res) => {
  try {
    const manager = await Admin.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const newPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(10);
    manager.password = await bcrypt.hash(newPassword, salt);
    await manager.save();

    res.json({
      success: true,
      message: "Password reset successfully",
      newPassword,
    });
  } catch (error) {
    console.error("Error in resetSectorManagerPassword:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete sector manager
// @route   DELETE /api/admin/sector-managers/:id
const deleteSectorManager = async (req, res) => {
  try {
    const manager = await Admin.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    await manager.deleteOne();
    res.json({ success: true, message: "Manager deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSectorManager:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// USER MANAGEMENT (Feedback Submitters)
// ==============================================

// @desc    Get all users who submitted feedback
// @route   GET /api/admin/users
const getFeedbackUsers = async (req, res) => {
  try {
    const { search, sector, minRating, page = 1, limit = 20 } = req.query;

    let matchStage = {};

    if (search) {
      matchStage.$or = [
        { visitor: { $regex: search, $options: "i" } },
        { visitorEmail: { $regex: search, $options: "i" } },
      ];
    }

    if (sector && sector !== "all") {
      matchStage.sectorId = parseInt(sector);
    }

    if (minRating && minRating !== "all") {
      matchStage.rating = { $gte: parseInt(minRating) };
    }

    const users = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            email: { $ifNull: ["$visitorEmail", "anonymous"] },
            name: { $ifNull: ["$visitor", "Anonymous"] },
          },
          email: { $first: "$visitorEmail" },
          name: { $first: "$visitor" },
          totalFeedback: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          firstFeedback: { $min: "$createdAt" },
          lastFeedback: { $max: "$createdAt" },
          resolvedCount: { $sum: { $cond: ["$resolved", 1, 0] } },
          sectors: { $addToSet: "$sectorId" },
          feedbacks: { $push: "$$ROOT" },
        },
      },
      { $sort: { lastFeedback: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    const total = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            email: { $ifNull: ["$visitorEmail", "anonymous"] },
            name: { $ifNull: ["$visitor", "Anonymous"] },
          },
        },
      },
      { $count: "total" },
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0]?.total || 0,
        pages: Math.ceil((total[0]?.total || 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getFeedbackUsers:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user details with feedback history
// @route   GET /api/admin/users/:email
const getUserDetails = async (req, res) => {
  try {
    const { email } = req.params;

    const feedbacks = await Feedback.find({
      visitorEmail: email,
    })
      .sort({ createdAt: -1 })
      .populate("department", "name building floor");

    const stats = {
      total: feedbacks.length,
      avgRating:
        feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
      resolved: feedbacks.filter((f) => f.resolved).length,
      pending: feedbacks.filter((f) => !f.resolved && !f.response).length,
      responded: feedbacks.filter((f) => f.response && !f.resolved).length,
    };

    res.json({
      success: true,
      data: { feedbacks, stats },
    });
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// ADMIN MANAGEMENT (Super Admin only)
// ==============================================

// @desc    Register new admin (superadmin only)
const registerAdmin = async (req, res) => {
  try {
    const { username, password, email, role, sectorId, name } = req.body;

    const adminExists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      username,
      password: hashedPassword,
      email,
      role: role || "admin",
      sectorId: sectorId || null,
      name: name || username,
    });

    const token = generateToken(admin._id);
    setTokenCookie(res, token);

    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      sectorId: admin.sectorId,
      name: admin.name,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all admins (superadmin only)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select("-password");
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin role (superadmin only)
const updateAdminRole = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.role = req.body.role;
    await admin.save();

    res.json({
      success: true,
      message: "Admin role updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete admin (superadmin only)
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.deleteOne();
    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// SYSTEM STATISTICS
// ==============================================

// @desc    Get system statistics for admin dashboard
// @route   GET /api/admin/system-stats
const getSystemStats = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalSectorManagers = await Admin.countDocuments({
      role: "sector_manager",
    });
    const totalAdmins = await Admin.countDocuments({
      role: { $in: ["admin", "superadmin"] },
    });
    const pendingFeedbacks = await Feedback.countDocuments({
      $or: [{ response: { $exists: false } }, { response: "" }],
      resolved: false,
    });

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyTrend = await Feedback.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      data: {
        totalFeedbacks,
        totalDepartments,
        totalSectorManagers,
        totalAdmins,
        pendingFeedbacks,
        ratingDistribution,
        monthlyTrend: monthlyTrend.reverse(),
      },
    });
  } catch (error) {
    console.error("Error in getSystemStats:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// EXPORTS
// ==============================================

module.exports = {
  // Auth
  loginAdmin,
  logoutAdmin,
  // Profile
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  // Sector Manager Management
  getSectorManagers,
  createSectorManager,
  updateSectorManager,
  resetSectorManagerPassword,
  deleteSectorManager,
  // User Management
  getFeedbackUsers,
  getUserDetails,
  // Admin Management
  registerAdmin,
  getAllAdmins,
  updateAdminRole,
  deleteAdmin,
  // System
  getSystemStats,
};
