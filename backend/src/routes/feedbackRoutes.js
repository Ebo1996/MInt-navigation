const express = require("express");
const router = express.Router();
const {
  // Public routes
  createFeedback,
  getFeedback,
  getFeedbackStats,

  // Admin routes
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  respondToFeedback,
  addReply,
  bulkDeleteFeedback,
  getFeedbackAnalytics,
} = require("../controllers/feedbackController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

// ============= PUBLIC ROUTES =============

// @route   POST /api/feedback
// @desc    Submit new feedback
// @access  Public
router.post("/", createFeedback);

// @route   GET /api/feedback
// @desc    Get all feedback with optional filters
// @access  Public
router.get("/", getFeedback);

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics
// @access  Public
router.get("/stats", getFeedbackStats);

// ============= ADMIN ROUTES =============

// @route   GET /api/feedback/analytics
// @desc    Get feedback trends and analytics for charts
// @access  Private/Admin
router.get("/analytics", protect, getFeedbackAnalytics);

// @route   GET /api/feedback/:id
// @desc    Get single feedback by ID
// @access  Private/Admin
router.get("/:id", protect, getFeedbackById);

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Private/Admin
router.put("/:id", protect, updateFeedback);

// @route   DELETE /api/feedback/:id
// @desc    Delete single feedback
// @access  Private/Admin
router.delete("/:id", protect, deleteFeedback);

// @route   PUT /api/feedback/:id/respond
// @desc    Add response to feedback
// @access  Private/Admin
router.put("/:id/respond", protect, respondToFeedback);

// @route   POST /api/feedback/:id/reply
// @desc    Add a threaded reply (analyst <-> sector manager)
// @access  Private/Admin
router.post("/:id/reply", protect, addReply);

// @route   DELETE /api/feedback/bulk
// @desc    Bulk delete multiple feedback entries
// @access  Private/Admin (SuperAdmin only)
router.delete("/bulk", protect, superAdminOnly, bulkDeleteFeedback);

module.exports = router;
