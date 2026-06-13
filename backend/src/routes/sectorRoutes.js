// backend/routes/sectorRoutes.js
// ================================================
// COMPLETE UPDATED ROUTES WITH ALL NEW ENDPOINTS
// ================================================

const express = require("express");
const router = express.Router();
const {
  getSectorFeedback,
  respondToFeedback,
  resolveFeedback,
  getSectorStats,
  exportCSV,
  updateProfile,
  changePassword,
  getPendingCount,
} = require("../controllers/sectorFeedbackController");
const { protect, sectorManagerOnly } = require("../middleware/authMiddleware");
const Admin = require("../models/Admin");

// All routes require authentication
router.use(protect);

// ============= FEEDBACK ROUTES =============
router.get("/:sectorId/feedback", sectorManagerOnly, getSectorFeedback);
router.get("/:sectorId/stats", sectorManagerOnly, getSectorStats);
router.get("/:sectorId/pending-count", sectorManagerOnly, getPendingCount);
router.get("/:sectorId/export/csv", sectorManagerOnly, exportCSV);
router.put("/feedback/:id/respond", sectorManagerOnly, respondToFeedback);
router.put("/feedback/:id/resolve", sectorManagerOnly, resolveFeedback);

// ============= PROFILE ROUTES =============
router.put("/profile/update", sectorManagerOnly, updateProfile);
router.put("/profile/change-password", sectorManagerOnly, changePassword);

// ============= ALERTS ROUTES =============
// Send alert from General Feedback Manager to sector manager
router.post("/alerts/send", protect, async (req, res) => {
  try {
    const { sectorId, message, departmentName, rating, responseRate } = req.body;
    if (!sectorId || !message) {
      return res.status(400).json({ message: "sectorId and message are required" });
    }
    // Store alert in the target sector manager's alert inbox
    // We use a simple in-memory store per sector (stored in DB via Admin model notes)
    // For persistence, we store alerts as a JSON field on the sector manager's Admin record
    const manager = await Admin.findOne({ role: "sector_manager", sectorId: parseInt(sectorId) });
    if (!manager) {
      return res.status(404).json({ message: "Sector manager not found for this sector" });
    }

    const alert = {
      id: Date.now().toString(),
      from: req.admin?.name || req.admin?.username || "General Feedback Manager",
      fromRole: req.admin?.role || "feedback_analyst",
      message,
      departmentName: departmentName || null,
      rating: rating || null,
      responseRate: responseRate || null,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Store alerts in manager's alerts array (max 50)
    if (!manager.alerts) manager.alerts = [];
    manager.alerts = [alert, ...(manager.alerts || [])].slice(0, 50);
    manager.markModified("alerts");
    await manager.save();

    res.json({ success: true, message: "Alert sent successfully", alert });
  } catch (error) {
    console.error("Error sending alert:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get alerts for current sector manager
router.get("/alerts/my", sectorManagerOnly, async (req, res) => {
  try {
    const manager = await Admin.findById(req.admin._id);
    const alerts = (manager?.alerts || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unread = alerts.filter(a => !a.read).length;
    res.json({ success: true, alerts, unread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark alert as read
router.put("/alerts/:alertId/read", sectorManagerOnly, async (req, res) => {
  try {
    const manager = await Admin.findById(req.admin._id);
    if (manager.alerts) {
      manager.alerts = manager.alerts.map(a =>
        a.id === req.params.alertId ? { ...a, read: true } : a
      );
      manager.markModified("alerts");
      await manager.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all alerts as read
router.put("/alerts/read-all", sectorManagerOnly, async (req, res) => {
  try {
    const manager = await Admin.findById(req.admin._id);
    if (manager.alerts) {
      manager.alerts = manager.alerts.map(a => ({ ...a, read: true }));
      manager.markModified("alerts");
      await manager.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
