const express = require("express");
const {
  getSystemStatus,
  getSlaOverview,
  assignSlaFeedback,
  followUpSlaFeedback,
  getDepartmentHealth,
  getAuditLogs,
  exportReport
} = require("../controllers/adminController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(verifyToken, allowRoles([ROLES.ADMIN]));

router.get("/system-status", getSystemStatus);
router.get("/sla", getSlaOverview);
router.post("/sla/:feedbackId/assign", assignSlaFeedback);
router.post("/sla/:feedbackId/follow-up", followUpSlaFeedback);
router.get("/department-health", getDepartmentHealth);
router.get("/audit-logs", getAuditLogs);
router.get("/export/:type", exportReport);

module.exports = router;
