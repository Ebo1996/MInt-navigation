const express = require("express");
const router = express.Router();
const {
  // Public routes
  getDepartments,
  getDepartmentById,
  getBuildingStats,

  // Admin routes
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAdminStats,
} = require("../controllers/departmentController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const { uploadDepartmentImages } = require("../middleware/uploadMiddleware");

// ============= PUBLIC ROUTES =============
// These are accessible without authentication

// @route   GET /api/departments
// @desc    Get all departments with optional building filter
// @access  Public
router.get("/", getDepartments);

// @route   GET /api/departments/stats/buildings
// @desc    Get statistics for Building A and B
// @access  Public
router.get("/stats/buildings", getBuildingStats);

// @route   GET /api/departments/:id
// @desc    Get single department by ID
// @access  Public
router.get("/:id", getDepartmentById);

// ============= ADMIN ROUTES =============
// All routes below require authentication

// @route   GET /api/departments/admin/stats
// @desc    Get detailed admin statistics
// @access  Private/Admin
router.get("/admin/stats", protect, getAdminStats);

// @route   POST /api/departments
// @desc    Create new department
// @access  Private/Admin
router.post("/", protect, uploadDepartmentImages, createDepartment);

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private/Admin
router.put("/:id", protect, uploadDepartmentImages, updateDepartment);

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private/Admin (SuperAdmin only)
router.delete("/:id", protect, superAdminOnly, deleteDepartment);

module.exports = router;
