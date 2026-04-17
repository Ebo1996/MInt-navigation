const Feedback = require("../models/Feedback");
const Department = require("../models/Department");
const AppError = require("../utils/appError");
const ROLES = require("../constants/roles");
const settingsService = require("./settingsService");

const canRoleRespond = (role) =>
  [ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER].includes(role);

const buildFeedbackQueryByRole = (user) => {
  if (user.role === ROLES.DEPARTMENT_MANAGER) {
    return user.departmentId ? { departmentId: user.departmentId } : { _id: null };
  }

  return {};
};

const createFeedback = async ({ departmentId, rating, comment, userName }, user = null) => {
  if (user) {
    throw new AppError("Only visitors can submit feedback", 403);
  }

  const settings = await settingsService.getOrCreateSettings();
  if (!settings.allowPublicFeedback) {
    throw new AppError("Public feedback is currently disabled", 403);
  }

  const department = await Department.findById(departmentId);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  return Feedback.create({
    departmentId,
    rating,
    comment,
    userName: userName || "Visitor"
  });
};

const listFeedback = async (user) => {
  const query = buildFeedbackQueryByRole(user);

  return Feedback.find(query)
    .populate("departmentId", "name sector building floor officeNumber")
    .populate("respondedBy", "name role")
    .sort({ createdAt: -1 });
};

const listAllFeedback = async () =>
  Feedback.find({})
    .populate("departmentId", "name sector building floor officeNumber")
    .populate("respondedBy", "name role")
    .sort({ createdAt: -1 });

const listFeedbackByDepartment = async (departmentId, user) => {
  if (
    user &&
    user.role === ROLES.DEPARTMENT_MANAGER &&
    (!user.departmentId || String(user.departmentId) !== String(departmentId))
  ) {
    throw new AppError("Forbidden: cannot access feedback outside your department", 403);
  }

  return Feedback.find({ departmentId })
    .populate("departmentId", "name sector building floor officeNumber")
    .populate("respondedBy", "name role")
    .sort({ createdAt: -1 });
};

const respondToFeedback = async ({ feedbackId, response, user }) => {
  if (!user || !canRoleRespond(user.role)) {
    throw new AppError("Forbidden: insufficient permissions to respond", 403);
  }

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    throw new AppError("Feedback not found", 404);
  }

  if (
    user.role === ROLES.DEPARTMENT_MANAGER &&
    (!user.departmentId || String(user.departmentId) !== String(feedback.departmentId))
  ) {
    throw new AppError("Forbidden: cannot respond to feedback outside your department", 403);
  }

  feedback.response = response;
  feedback.status = "responded";
  feedback.respondedBy = user._id;
  feedback.respondedAt = new Date();

  await feedback.save();

  return feedback;
};

const getFeedbackAnalytics = async (user) => {
  const query = buildFeedbackQueryByRole(user);
  const feedback = await Feedback.find(query);

  const totalFeedback = feedback.length;
  const responded = feedback.filter((item) => item.status === "responded").length;
  const pending = totalFeedback - responded;
  const averageRating =
    totalFeedback === 0
      ? 0
      : Number((feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback).toFixed(2));

  return {
    totalFeedback,
    responded,
    pending,
    averageRating
  };
};

const getFeedbackTrendAnalytics = async (user) => {
  const query = buildFeedbackQueryByRole(user);
  const feedback = await Feedback.find(query).populate("departmentId", "name");

  const monthlyMap = new Map();
  const departmentMap = new Map();

  feedback.forEach((item) => {
    const monthKey = new Date(item.createdAt).toISOString().slice(0, 7);
    const existingMonth = monthlyMap.get(monthKey) || { month: monthKey, count: 0, ratingTotal: 0 };
    existingMonth.count += 1;
    existingMonth.ratingTotal += Number(item.rating || 0);
    monthlyMap.set(monthKey, existingMonth);

    const departmentName = item.departmentId?.name || "Unknown";
    const existingDept = departmentMap.get(departmentName) || { department: departmentName, count: 0 };
    existingDept.count += 1;
    departmentMap.set(departmentName, existingDept);
  });

  const monthlyTrend = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((entry) => ({
      month: entry.month,
      count: entry.count,
      avgRating: entry.count ? Number((entry.ratingTotal / entry.count).toFixed(2)) : 0
    }));

  const byDepartment = Array.from(departmentMap.values()).sort((a, b) => b.count - a.count);

  const statusBreakdown = [
    { status: "pending", count: feedback.filter((item) => item.status === "pending").length },
    { status: "responded", count: feedback.filter((item) => item.status === "responded").length }
  ];

  return {
    monthlyTrend,
    byDepartment,
    statusBreakdown
  };
};

module.exports = {
  createFeedback,
  listFeedback,
  listAllFeedback,
  listFeedbackByDepartment,
  respondToFeedback,
  getFeedbackAnalytics,
  getFeedbackTrendAnalytics
};
