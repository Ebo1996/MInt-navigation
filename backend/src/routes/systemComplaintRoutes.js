const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
} = require("../controllers/systemComplaintController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/", createComplaint);

// Admin only
router.get("/stats", protect, getComplaintStats);
router.get("/", protect, getComplaints);
router.get("/:id", protect, getComplaintById);
router.put("/:id", protect, updateComplaint);
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
