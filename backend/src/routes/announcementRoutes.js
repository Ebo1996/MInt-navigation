const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
} = require("../controllers/announcementController");
const { protect } = require("../middleware/authMiddleware");

// Public route
router.get("/", getAnnouncements);

// Admin only routes
router.use(protect);
router.get("/:id", getAnnouncementById);
router.post("/", createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);
router.patch("/:id/toggle", toggleAnnouncement);

module.exports = router;
