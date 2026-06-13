const Feedback = require("../models/Feedback");
const Department = require("../models/Department");

// ============= PUBLIC ROUTES =============

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
  try {
    const {
      department,
      sectorId,
      building,
      rating,
      comment,
      visitor,
      visitorEmail,
    } = req.body;

    // Validate required fields
    if (!department || !sectorId || !building || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feedback = new Feedback({
      department,
      sectorId,
      building,
      rating,
      comment: comment || "",
      visitor: visitor || "Anonymous",
      visitorEmail: visitorEmail || "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
    });

    const savedFeedback = await feedback.save();

    // Update department rating
    const departmentFeedbacks = await Feedback.find({
      department: department,
    });

    const avgRating =
      departmentFeedbacks.length > 0
        ? departmentFeedbacks.reduce((acc, f) => acc + f.rating, 0) /
          departmentFeedbacks.length
        : rating;

    await Department.findOneAndUpdate(
      { id: department },
      {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: departmentFeedbacks.length,
      },
    );

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: savedFeedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Public
const getFeedback = async (req, res) => {
  try {
    const { department, building, rating } = req.query;
    const filter = {};

    if (department) filter.department = parseInt(department);
    if (building) filter.building = building;
    if (rating) filter.rating = parseInt(rating);

    const feedback = await Feedback.find(filter).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Public
const getFeedbackStats = async (req, res) => {
  try {
    const allFeedback = await Feedback.find();

    res.json({
      total: allFeedback.length,
      average:
        allFeedback.length > 0
          ? (
              allFeedback.reduce((acc, f) => acc + f.rating, 0) /
              allFeedback.length
            ).toFixed(1)
          : 0,
      fiveStar: allFeedback.filter((f) => f.rating === 5).length,
      fourStar: allFeedback.filter((f) => f.rating === 4).length,
      threeStar: allFeedback.filter((f) => f.rating === 3).length,
      twoStar: allFeedback.filter((f) => f.rating === 2).length,
      oneStar: allFeedback.filter((f) => f.rating === 1).length,
      pending: allFeedback.filter((f) => f.status === "pending").length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= ADMIN ROUTES =============

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Private/Admin
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Get department info
    const dept = await Department.findOne({ id: feedback.department });

    res.json({
      ...feedback.toObject(),
      deptName: dept ? dept.name.en : "Unknown Department",
      deptBuilding: dept ? dept.building : "Unknown",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private/Admin
const updateFeedback = async (req, res) => {
  try {
    const { rating, comment, visitor, status, response } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      feedback.rating = rating;
    }

    if (comment !== undefined) feedback.comment = comment;
    if (visitor !== undefined) feedback.visitor = visitor;
    if (status) feedback.status = status;
    if (response !== undefined) feedback.response = response;

    const updatedFeedback = await feedback.save();

    // If rating changed, update department average
    if (rating) {
      const departmentFeedbacks = await Feedback.find({
        department: feedback.department,
        status: "published",
      });

      const avgRating =
        departmentFeedbacks.reduce((acc, f) => acc + f.rating, 0) /
        departmentFeedbacks.length;

      await Department.findOneAndUpdate(
        { id: feedback.department },
        { rating: parseFloat(avgRating.toFixed(1)) },
      );
    }

    res.json({
      success: true,
      message: "Feedback updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const departmentId = feedback.department;

    await Feedback.findByIdAndDelete(req.params.id);

    // Update department rating after deletion
    const departmentFeedbacks = await Feedback.find({
      department: departmentId,
      status: "published",
    });

    if (departmentFeedbacks.length > 0) {
      const avgRating =
        departmentFeedbacks.reduce((acc, f) => acc + f.rating, 0) /
        departmentFeedbacks.length;
      await Department.findOneAndUpdate(
        { id: departmentId },
        {
          rating: parseFloat(avgRating.toFixed(1)),
          reviewCount: departmentFeedbacks.length,
        },
      );
    } else {
      // No feedback left, reset to default
      await Department.findOneAndUpdate(
        { id: departmentId },
        {
          rating: 4.8,
          reviewCount: 0,
        },
      );
    }

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to feedback (sets main response field)
// @route   PUT /api/feedback/:id/respond
// @access  Private/Admin
const respondToFeedback = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || response.trim() === "") {
      return res.status(400).json({ message: "Response cannot be empty" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.response = response;
    feedback.status = "published";
    feedback.respondedBy  = req.admin?._id  || null;
    feedback.respondedAt  = new Date();

    // Also push into the unified replies array so both dashboards see it
    feedback.replies.push({
      text:      response,
      role:      req.admin?.role || "feedback_analyst",
      name:      req.admin?.name || req.admin?.username || "Analyst",
      createdAt: new Date(),
    });

    await feedback.save();

    res.json({ success: true, message: "Response added successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a threaded reply (analyst ↔ sector manager conversation)
// @route   POST /api/feedback/:id/reply
// @access  Private/Admin
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text cannot be empty" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const reply = {
      text:      text.trim(),
      role:      req.admin?.role || "feedback_analyst",
      name:      req.admin?.name || req.admin?.username || "Admin",
      createdAt: new Date(),
    };

    feedback.replies.push(reply);

    // If it's the first reply, also set the top-level response field
    if (!feedback.response) {
      feedback.response    = text.trim();
      feedback.status      = "published";
      feedback.respondedBy = req.admin?._id || null;
      feedback.respondedAt = new Date();
    }

    await feedback.save();

    res.json({ success: true, message: "Reply added", reply, feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk delete feedback
// @route   DELETE /api/feedback/bulk
// @access  Private/Admin
const bulkDeleteFeedback = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No feedback IDs provided" });
    }

    // Get all departments affected
    const feedbacks = await Feedback.find({ _id: { $in: ids } });
    const departmentIds = [...new Set(feedbacks.map((f) => f.department))];

    // Delete feedbacks
    await Feedback.deleteMany({ _id: { $in: ids } });

    // Update each department's rating
    for (const deptId of departmentIds) {
      const departmentFeedbacks = await Feedback.find({
        department: deptId,
        status: "published",
      });

      if (departmentFeedbacks.length > 0) {
        const avgRating =
          departmentFeedbacks.reduce((acc, f) => acc + f.rating, 0) /
          departmentFeedbacks.length;
        await Department.findOneAndUpdate(
          { id: deptId },
          {
            rating: parseFloat(avgRating.toFixed(1)),
            reviewCount: departmentFeedbacks.length,
          },
        );
      } else {
        await Department.findOneAndUpdate(
          { id: deptId },
          {
            rating: 4.8,
            reviewCount: 0,
          },
        );
      }
    }

    res.json({
      success: true,
      message: `Successfully deleted ${ids.length} feedback entries`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback analytics
// @route   GET /api/feedback/analytics
// @access  Private/Admin
const getFeedbackAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Get feedback by day for charting
    const dailyStats = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: dateLimit },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get feedback by building
    const buildingStats = await Feedback.aggregate([
      {
        $group: {
          _id: "$building",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    // Get top departments by feedback count
    const topDepartments = await Feedback.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get department names for top departments
    const topWithNames = await Promise.all(
      topDepartments.map(async (item) => {
        const dept = await Department.findOne({ id: item._id });
        return {
          departmentId: item._id,
          departmentName: dept ? dept.name.en : "Unknown",
          count: item.count,
          avgRating: item.avgRating.toFixed(1),
        };
      }),
    );

    res.json({
      daily: dailyStats,
      byBuilding: buildingStats,
      topDepartments: topWithNames,
      totalPeriod: await Feedback.countDocuments({
        createdAt: { $gte: dateLimit },
      }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= EXPORTS =============

module.exports = {
  // Public
  createFeedback,
  getFeedback,
  getFeedbackStats,

  // Admin
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  respondToFeedback,
  addReply,
  bulkDeleteFeedback,
  getFeedbackAnalytics,
};
