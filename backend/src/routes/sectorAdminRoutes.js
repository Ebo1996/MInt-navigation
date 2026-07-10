const express = require("express");
const router = express.Router();
const {
  // Public routes
  getPublicSectors,
  getPublicSectorById,
  // Admin routes
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
  toggleSectorStatus,
  getSectorStats,
  upload,
} = require("../controllers/sectorAdminController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

// ============= PUBLIC ROUTES (No Auth) =============
router.get("/", getPublicSectors);
router.get("/public/:id", getPublicSectorById);

// ============= ADMIN ROUTES (Auth applied per-route to avoid multer conflicts) =============

// Stats
router.get("/stats", protect, getSectorStats);

// CRUD operations — protect applied individually so multer parses body first
router.get("/admin/all", protect, getAllSectors);
router.get("/admin/:id", protect, getSectorById);
router.post("/admin", protect, upload.single("image"), createSector);
router.put("/admin/:id", protect, upload.single("image"), updateSector);
router.delete("/admin/:id", protect, superAdminOnly, deleteSector);
router.patch("/admin/:id/toggle", protect, toggleSectorStatus);

module.exports = router;
