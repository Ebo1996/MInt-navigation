// backend/routes/sectorRoutes.js
// ================================================
// COMPLETE UPDATED ROUTES WITH ALL NEW ENDPOINTS
// Works for both sector_manager (sector-scoped) and
// department_head (department-scoped) roles.
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
// Send alert from General Feedback Manager to ALL dept heads + sector manager in a sector
router.post("/alerts/send", protect, async (req, res) => {
  try {
    const { sectorId, departmentId, message, departmentName, rating, responseRate } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }
    if (!sectorId) {
      return res.status(400).json({ message: "sectorId is required" });
    }

    const parsedSectorId = parseInt(sectorId);

    // Build the alert object
    const alert = {
      id: Date.now().toString(),
      from: req.admin?.name || req.admin?.username || "General Feedback Manager",
      fromRole: req.admin?.role || "feedback_analyst",
      message: message.trim(),
      departmentName: departmentName || null,
      rating: rating || null,
      responseRate: responseRate || null,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Find ALL recipients in this sector:
    // 1. The sector_manager for this sector
    // 2. ALL department_heads belonging to this sector
    let recipients = await Admin.find({
      sectorId: parsedSectorId,
      role: { $in: ["sector_manager", "department_head"] },
    });

    // Fallback: if no sector-specific admins exist yet,
    // deliver to all superadmins so the alert is never lost
    let fallback = false;
    if (recipients.length === 0) {
      recipients = await Admin.find({ role: { $in: ["superadmin", "admin"] } });
      fallback = true;
    }

    // Push the alert to every recipient (max 50 alerts stored per user)
    await Promise.all(
      recipients.map(async (target) => {
        if (!Array.isArray(target.alerts)) target.alerts = [];
        target.alerts = [alert, ...target.alerts].slice(0, 50);
        target.markModified("alerts");
        await target.save();
      })
    );

    res.json({
      success: true,
      message: fallback
        ? `No sector managers found for sector ${parsedSectorId}. Alert delivered to ${recipients.length} system admin(s) instead.`
        : `Alert sent to ${recipients.length} recipient(s) in sector ${parsedSectorId}`,
      recipientCount: recipients.length,
      fallback,
      recipients: recipients.map(r => ({ id: r._id, role: r.role, name: r.name || r.username })),
      alert,
    });
  } catch (error) {
    console.error("Error sending alert:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get alerts for current dept head / sector manager
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
