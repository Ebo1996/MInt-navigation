const asyncHandler = require("../utils/asyncHandler");
const feedbackService = require("../services/feedbackService");
const auditLogService = require("../services/auditLogService");

const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.createFeedback(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Feedback submitted successfully",
    feedback
  });
});

const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.listFeedback(req.user);

  res.status(200).json({
    success: true,
    feedback
  });
});

const getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.listAllFeedback();

  res.status(200).json({
    success: true,
    feedback
  });
});

const getFeedbackByDepartment = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.listFeedbackByDepartment(req.params.departmentId, req.user);

  res.status(200).json({
    success: true,
    feedback
  });
});

const respondToFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.respondToFeedback({
    feedbackId: req.params.feedbackId,
    response: req.body.response,
    user: req.user
  });
  await auditLogService.logAction(req, {
    action: "respond_feedback",
    resourceType: "feedback",
    resourceId: feedback._id,
    metadata: { status: feedback.status }
  });

  res.status(200).json({
    success: true,
    message: "Feedback response saved",
    feedback
  });
});

const respondToFeedbackAlias = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.respondToFeedback({
    feedbackId: req.params.id,
    response: req.body.response,
    user: req.user
  });
  await auditLogService.logAction(req, {
    action: "respond_feedback",
    resourceType: "feedback",
    resourceId: feedback._id,
    metadata: { status: feedback.status }
  });

  res.status(200).json({
    success: true,
    message: "Feedback response saved",
    feedback
  });
});

const getFeedbackAnalytics = asyncHandler(async (req, res) => {
  const analytics = await feedbackService.getFeedbackAnalytics(req.user);

  res.status(200).json({
    success: true,
    analytics
  });
});

const getFeedbackTrendAnalytics = asyncHandler(async (req, res) => {
  const analytics = await feedbackService.getFeedbackTrendAnalytics(req.user);

  res.status(200).json({
    success: true,
    analytics
  });
});

module.exports = {
  createFeedback,
  getFeedback,
  getAllFeedback,
  getFeedbackByDepartment,
  respondToFeedback,
  respondToFeedbackAlias,
  getFeedbackAnalytics,
  getFeedbackTrendAnalytics
};
