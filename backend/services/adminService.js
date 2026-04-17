const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const Department = require("../models/Department");
const User = require("../models/User");
const AppError = require("../utils/appError");
const settingsService = require("./settingsService");
const auditLogService = require("./auditLogService");
const runtimeErrorService = require("./runtimeErrorService");

const toCsv = (rows = []) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeValue(row[header])).join(","));
  });
  return lines.join("\n");
};

const toSimplePdfBuffer = (title, lines = []) => {
  const sanitize = (value) => String(value ?? "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const streamLines = [
    "BT",
    "/F1 12 Tf",
    "50 790 Td",
    `(${sanitize(title)}) Tj`
  ];

  lines.forEach((line, index) => {
    const safeLine = sanitize(line);
    streamLines.push(index === 0 ? "0 -24 Td" : "0 -14 Td");
    streamLines.push(`(${safeLine}) Tj`);
  });

  streamLines.push("ET");

  const stream = streamLines.join("\n");
  const objects = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n"
  );
  objects.push(`4 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`);
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  let content = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(content, "utf8"));
    content += obj;
  });

  const xrefStart = Buffer.byteLength(content, "utf8");
  content += `xref\n0 ${objects.length + 1}\n`;
  content += "0000000000 65535 f \n";

  for (let i = 1; i <= objects.length; i += 1) {
    content += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  content += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(content, "utf8");
};

const normalizeReportType = (type = "") => {
  const normalized = String(type || "").toLowerCase();
  if (["feedback", "feedback-trends", "feedback_trends", "trends"].includes(normalized)) return "feedback-trends";
  if (["department-health", "department-performance", "health"].includes(normalized)) return "department-performance";
  if (["users", "manager-response-stats", "manager-response", "manager"].includes(normalized)) return "manager-response-stats";
  return "department-performance";
};

const buildFeedbackTrendsRows = async () => {
  const feedback = await Feedback.find({}).sort({ createdAt: 1 });
  const monthly = new Map();

  feedback.forEach((item) => {
    const month = new Date(item.createdAt).toISOString().slice(0, 7);
    const entry = monthly.get(month) || { month, totalFeedback: 0, avgRating: 0 };
    entry.totalFeedback += 1;
    entry.avgRating += Number(item.rating || 0);
    monthly.set(month, entry);
  });

  return Array.from(monthly.values()).map((entry) => ({
    month: entry.month,
    totalFeedback: entry.totalFeedback,
    averageRating: Number((entry.avgRating / entry.totalFeedback).toFixed(2))
  }));
};

const getSystemStatus = async () => {
  const settings = await settingsService.getOrCreateSettings();
  const [departmentCount, userCount, feedbackCount] = await Promise.all([
    Department.countDocuments({}),
    User.countDocuments({}),
    Feedback.countDocuments({})
  ]);

  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const memory = process.memoryUsage();
  const recentErrors = runtimeErrorService.getRecentErrors(6);

  return {
    backendStatus: "healthy",
    dbStatus: dbStates[mongoose.connection.readyState] || "unknown",
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      rssMb: Number((memory.rss / (1024 * 1024)).toFixed(2)),
      heapUsedMb: Number((memory.heapUsed / (1024 * 1024)).toFixed(2))
    },
    lastBackupAt: settings.lastBackupAt,
    recentErrors,
    totals: {
      departments: departmentCount,
      users: userCount,
      feedback: feedbackCount
    }
  };
};

const getSlaOverview = async ({ slaHours = 24 } = {}) => {
  const hours = Math.max(1, Number(slaHours) || 24);
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  const overdue = await Feedback.find({
    status: "pending",
    createdAt: { $lt: cutoff }
  })
    .populate("departmentId", "name")
    .sort({ createdAt: 1 })
    .limit(200);

  return {
    slaHours: hours,
    overdueCount: overdue.length,
    overdueItems: overdue.map((item) => ({
      id: item._id,
      departmentId: item.departmentId?._id || null,
      departmentName: item.departmentId?.name || "Unknown",
      userName: item.userName,
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt,
      followUpCount: Number(item.followUpCount || 0),
      lastFollowedUpAt: item.lastFollowedUpAt || null,
      ageHours: Number(((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60)).toFixed(1))
    }))
  };
};

const assignSlaFeedback = async ({ feedbackId, departmentId }) => {
  const [feedback, department] = await Promise.all([Feedback.findById(feedbackId), Department.findById(departmentId)]);

  if (!feedback) throw new AppError("Feedback not found", 404);
  if (!department) throw new AppError("Department not found", 404);

  feedback.departmentId = department._id;
  await feedback.save();

  return Feedback.findById(feedbackId).populate("departmentId", "name");
};

const followUpSlaFeedback = async ({ feedbackId, note = "" }) => {
  const feedback = await Feedback.findById(feedbackId).populate("departmentId", "name");
  if (!feedback) throw new AppError("Feedback not found", 404);

  feedback.followUpCount = Number(feedback.followUpCount || 0) + 1;
  feedback.lastFollowedUpAt = new Date();
  feedback.lastFollowUpNote = String(note || "").trim();
  await feedback.save();

  return feedback;
};

const getDepartmentHealth = async () => {
  const [departments, feedback] = await Promise.all([
    Department.find({}).sort({ name: 1 }),
    Feedback.find({}).populate("departmentId", "name")
  ]);

  const map = new Map();
  departments.forEach((department) => {
    map.set(String(department._id), {
      departmentId: department._id,
      department: department.name,
      totalFeedback: 0,
      responded: 0,
      pending: 0,
      averageRating: 0,
      avgResponseHours: 0,
      healthScore: 0
    });
  });

  feedback.forEach((item) => {
    const departmentId = String(item.departmentId?._id || item.departmentId);
    if (!map.has(departmentId)) return;
    const entry = map.get(departmentId);
    entry.totalFeedback += 1;
    if (item.status === "responded") {
      entry.responded += 1;
      if (item.respondedAt) {
        entry.avgResponseHours +=
          (new Date(item.respondedAt).getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
      }
    } else {
      entry.pending += 1;
    }
    entry.averageRating += Number(item.rating || 0);
  });

  return Array.from(map.values()).map((item) => {
    const avgRating = item.totalFeedback ? item.averageRating / item.totalFeedback : 0;
    const avgResp = item.responded ? item.avgResponseHours / item.responded : 0;
    const responseRate = item.totalFeedback ? item.responded / item.totalFeedback : 1;

    const ratingScore = (avgRating / 5) * 40;
    const responseRateScore = responseRate * 40;
    const speedScore = Math.max(0, 20 - Math.min(20, avgResp));
    const unresolvedPenalty = Math.min(20, item.pending * 2.5);
    const healthScore = Number((ratingScore + responseRateScore + speedScore - unresolvedPenalty).toFixed(1));

    return {
      ...item,
      averageRating: Number(avgRating.toFixed(2)),
      avgResponseHours: Number(avgResp.toFixed(2)),
      healthScore: Math.max(0, healthScore)
    };
  });
};

const buildManagerResponseRows = async () => {
  const feedback = await Feedback.find({ status: "responded", respondedBy: { $ne: null } }).populate("respondedBy", "name");

  const map = new Map();
  feedback.forEach((item) => {
    const managerId = String(item.respondedBy?._id || item.respondedBy || "unknown");
    const managerName = item.respondedBy?.name || "Unknown";
    const entry = map.get(managerId) || {
      managerId,
      manager: managerName,
      respondedCount: 0,
      avgResponseHours: 0
    };

    const elapsed = (new Date(item.respondedAt).getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
    entry.respondedCount += 1;
    entry.avgResponseHours += Number.isFinite(elapsed) ? elapsed : 0;
    map.set(managerId, entry);
  });

  return Array.from(map.values())
    .map((entry) => ({
      managerId: entry.managerId,
      manager: entry.manager,
      respondedCount: entry.respondedCount,
      avgResponseHours: Number((entry.avgResponseHours / entry.respondedCount).toFixed(2))
    }))
    .sort((a, b) => b.respondedCount - a.respondedCount);
};

const exportReport = async (type, format = "csv") => {
  const normalizedType = normalizeReportType(type);
  const normalizedFormat = String(format || "csv").toLowerCase() === "pdf" ? "pdf" : "csv";

  let rows = [];
  let title = "Admin Report";

  if (normalizedType === "feedback-trends") {
    rows = await buildFeedbackTrendsRows();
    title = "Feedback Trends";
  } else if (normalizedType === "manager-response-stats") {
    rows = await buildManagerResponseRows();
    title = "Manager Response Stats";
  } else {
    rows = (await getDepartmentHealth()).map((item) => ({
      department: item.department,
      totalFeedback: item.totalFeedback,
      responded: item.responded,
      pending: item.pending,
      averageRating: item.averageRating,
      avgResponseHours: item.avgResponseHours,
      healthScore: item.healthScore
    }));
    title = "Department Performance";
  }

  if (normalizedFormat === "pdf") {
    const lines = rows.slice(0, 45).map((row) =>
      Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" | ")
    );

    return {
      filename: `${normalizedType}-${Date.now()}.pdf`,
      contentType: "application/pdf",
      content: toSimplePdfBuffer(title, lines)
    };
  }

  return {
    filename: `${normalizedType}-${Date.now()}.csv`,
    contentType: "text/csv",
    content: toCsv(rows)
  };
};

const getAuditLogs = async (query) => auditLogService.listLogs(query);

module.exports = {
  getSystemStatus,
  getSlaOverview,
  assignSlaFeedback,
  followUpSlaFeedback,
  getDepartmentHealth,
  exportReport,
  getAuditLogs
};
