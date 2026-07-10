const express = require("express");
const router = express.Router();
const {
  getOverview,
  getDepartmentRankings,
  getDepartmentAnalytics,
  generateReport,
  getInbox,
  assignFeedback,
} = require("../controllers/analyticsController");
const {
  protect,
  feedbackAnalystOnly,
} = require("../middleware/authMiddleware");
// All routes require authentication and feedback_analyst role
router.use(protect);
// @route   GET /api/analytics/overview
// @desc    Get dashboard overview
// @access  Private/FeedbackAnalyst
router.get("/overview", feedbackAnalystOnly, getOverview);
// @route   GET /api/analytics/rankings
// @desc    Get department rankings
// @access  Private/FeedbackAnalyst
router.get("/rankings", feedbackAnalystOnly, getDepartmentRankings);
// @route   GET /api/analytics/department/:id
// @desc    Get detailed department analytics
// @access  Private/FeedbackAnalyst
router.get("/department/:id", feedbackAnalystOnly, getDepartmentAnalytics);
// @route   POST /api/analytics/report
// @desc    Generate and send report
// @access  Private/FeedbackAnalyst
router.post("/report", feedbackAnalystOnly, generateReport);
// @route   GET /api/analytics/inbox
// @desc    Get feedback inbox with filters
// @access  Private/FeedbackAnalyst
router.get("/inbox", feedbackAnalystOnly, getInbox);
// @route   PUT /api/analytics/feedback/:id/assign
// @desc    Assign feedback to analyst
// @access  Private/FeedbackAnalyst
router.put("/feedback/:id/assign", feedbackAnalystOnly, assignFeedback);
module.exports = router;
