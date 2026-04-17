const asyncHandler = require("../utils/asyncHandler");
const adminService = require("../services/adminService");
const auditLogService = require("../services/auditLogService");

const getSystemStatus = asyncHandler(async (req, res) => {
  const status = await adminService.getSystemStatus();
  res.status(200).json({ success: true, status });
});

const getSlaOverview = asyncHandler(async (req, res) => {
  const data = await adminService.getSlaOverview({ slaHours: req.query.slaHours });
  res.status(200).json({ success: true, ...data });
});

const assignSlaFeedback = asyncHandler(async (req, res) => {
  const feedback = await adminService.assignSlaFeedback({
    feedbackId: req.params.feedbackId,
    departmentId: req.body.departmentId
  });

  await auditLogService.logAction(req, {
    action: "assign_feedback_department",
    resourceType: "feedback",
    resourceId: feedback._id,
    metadata: {
      departmentId: feedback.departmentId?._id || null,
      departmentName: feedback.departmentId?.name || ""
    }
  });

  res.status(200).json({ success: true, message: "Feedback reassigned successfully", feedback });
});

const followUpSlaFeedback = asyncHandler(async (req, res) => {
  const feedback = await adminService.followUpSlaFeedback({
    feedbackId: req.params.feedbackId,
    note: req.body?.note || ""
  });

  await auditLogService.logAction(req, {
    action: "followup_feedback",
    resourceType: "feedback",
    resourceId: feedback._id,
    metadata: {
      followUpCount: feedback.followUpCount,
      note: feedback.lastFollowUpNote || ""
    }
  });

  res.status(200).json({ success: true, message: "Follow-up recorded", feedback });
});

const getDepartmentHealth = asyncHandler(async (req, res) => {
  const health = await adminService.getDepartmentHealth();
  res.status(200).json({ success: true, health });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  res.status(200).json({ success: true, ...result });
});

const exportReport = asyncHandler(async (req, res) => {
  const type = req.params.type || "department-performance";
  const format = req.query.format || "csv";
  const report = await adminService.exportReport(type, format);

  res.setHeader("Content-Type", report.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
  res.status(200).send(report.content);
});

module.exports = {
  getSystemStatus,
  getSlaOverview,
  assignSlaFeedback,
  followUpSlaFeedback,
  getDepartmentHealth,
  getAuditLogs,
  exportReport
};
