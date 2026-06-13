const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/adminController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const {
  adminLoginLimiter,
  superAdminLimiter,
  adminApiLimiter,
} = require("../middleware/rateLimitMiddleware");

// ============= PUBLIC ROUTES =============

// @route   POST /api/admin/login
// @desc    Login admin
// @access  Public
router.post("/login", adminLoginLimiter, loginAdmin);

// @route   POST /api/admin/logout
// @desc    Logout admin / clear cookie
// @access  Public
router.post("/logout", logoutAdmin);

// ============= PROTECTED ROUTES (All authenticated) =============

router.use(protect);

// Profile Routes
router.get("/profile", adminApiLimiter, getAdminProfile);
router.put("/profile", adminApiLimiter, updateAdminProfile);
router.put("/change-password", adminApiLimiter, changePassword);

// System Stats
router.get("/system-stats", getSystemStats);

// Sector Manager Management
router.get("/sector-managers", getSectorManagers);
router.post("/sector-managers", superAdminOnly, createSectorManager);
router.put("/sector-managers/:id", superAdminOnly, updateSectorManager);
router.post(
  "/sector-managers/:id/reset-password",
  superAdminOnly,
  resetSectorManagerPassword,
);
router.delete("/sector-managers/:id", superAdminOnly, deleteSectorManager);

// User Management (Feedback Submitters)
router.get("/users", getFeedbackUsers);
router.get("/users/:email", getUserDetails);

// ============= SUPER ADMIN ONLY ROUTES =============

// Admin Management
router.post("/register", superAdminLimiter, superAdminOnly, registerAdmin);
router.get("/all", superAdminLimiter, superAdminOnly, getAllAdmins);
router.put("/:id/role", superAdminLimiter, superAdminOnly, updateAdminRole);
router.delete("/:id", superAdminLimiter, superAdminOnly, deleteAdmin);

module.exports = router;
