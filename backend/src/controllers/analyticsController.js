const Feedback = require("../models/Feedback");
const Department = require("../models/Department");
// @desc    Get overview statistics for dashboard
// @route   GET /api/analytics/overview
// @access  Private/FeedbackAnalyst
const getOverview = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    const totalFeedback = await Feedback.countDocuments();
    const totalDepartments = await Department.countDocuments();

    const allFeedback = await Feedback.find({ status: "published" });
    const avgRating =
      allFeedback.length > 0
        ? (
            allFeedback.reduce((acc, f) => acc + f.rating, 0) /
            allFeedback.length
          ).toFixed(1)
        : 0;

    const buildingA = await Department.find({ building: "A" });
    const buildingB = await Department.find({ building: "B" });

    const buildingAFeedback = await Feedback.countDocuments({ building: "A" });
    const buildingBFeedback = await Feedback.countDocuments({ building: "B" });

    const volumeByDay = await Feedback.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const respondedFeedback = await Feedback.countDocuments({
      response: { $exists: true, $ne: "" },
    });
    const responseRate =
      totalFeedback > 0
        ? Math.round((respondedFeedback / totalFeedback) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        totalFeedback,
        totalDepartments,
        avgRating: parseFloat(avgRating),
        buildingA: {
          count: buildingA.length,
          feedback: buildingAFeedback,
          avgRating:
            buildingA.length > 0
              ? (
                  buildingA.reduce((acc, d) => acc + (d.rating || 4.8), 0) /
                  buildingA.length
                ).toFixed(1)
              : 4.8,
        },
        buildingB: {
          count: buildingB.length,
          feedback: buildingBFeedback,
          avgRating:
            buildingB.length > 0
              ? (
                  buildingB.reduce((acc, d) => acc + (d.rating || 4.7), 0) /
                  buildingB.length
                ).toFixed(1)
              : 4.7,
        },
        volumeByDay,
        responseRate,
      },
    });
  } catch (error) {
    console.error("Error in getOverview:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department rankings with REAL trend data
// @route   GET /api/analytics/rankings
// @access  Private/FeedbackAnalyst
const getDepartmentRankings = async (req, res) => {
  try {
    const { sortBy = "rating", order = "desc", building = "all" } = req.query;

    let filter = {};
    if (building !== "all") filter.building = building;

    const departments = await Department.find(filter);

    const rankings = await Promise.all(
      departments.map(async (dept) => {
        const feedbacks = await Feedback.find({ department: dept.id });
        const totalFeedback = feedbacks.length;

        // REAL avg rating from actual feedback (not stored dept.rating)
        const realAvgRating =
          totalFeedback > 0
            ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
            : 0;

        const responded = feedbacks.filter(
          (f) => f.response && f.response.trim() !== "",
        ).length;
        const responseRate =
          totalFeedback > 0 ? Math.round((responded / totalFeedback) * 100) : 0;

        // ========== REAL TREND CALCULATION ==========
        // Last 30 days vs previous 30 days (based on actual feedback dates)
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);

        // Get feedback from last 30 days
        const recentFeedbacks = feedbacks.filter((f) => {
          const date = new Date(f.createdAt);
          return date >= thirtyDaysAgo && date <= now;
        });

        // Get feedback from previous 30 days (60-30 days ago)
        const previousFeedbacks = feedbacks.filter((f) => {
          const date = new Date(f.createdAt);
          return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });

        // Calculate average rating for recent period
        const recentAvg =
          recentFeedbacks.length > 0
            ? recentFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
              recentFeedbacks.length
            : realAvgRating;

        // Calculate average rating for previous period
        const previousAvg =
          previousFeedbacks.length > 0
            ? previousFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
              previousFeedbacks.length
            : realAvgRating;

        // Trend = change in rating
        const trend = recentAvg - previousAvg;
        // ========== END TREND CALCULATION ==========

        return {
          id: dept.id,
          name: dept.name,
          building: dept.building,
          floor: dept.floor,
          room: dept.room,
          sectorId: dept.sectorId,
          rating: parseFloat(realAvgRating.toFixed(1)), // REAL avg from feedback
          totalFeedback,
          responseRate,
          head: dept.head || "Not specified",
          trend: parseFloat(trend.toFixed(2)),
        };
      }),
    );

    // Sort rankings
    rankings.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "name") {
        aVal = aVal.en;
        bVal = bVal.en;
      }

      if (order === "desc") {
        return aVal < bVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    res.json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    console.error("Error in getDepartmentRankings:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed department analytics
// @route   GET /api/analytics/department/:id
// @access  Private/FeedbackAnalyst
const getDepartmentAnalytics = async (req, res) => {
  try {
    const deptId = parseInt(req.params.id);

    const department = await Department.findOne({ id: deptId });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const feedbacks = await Feedback.find({ department: deptId }).sort({
      createdAt: -1,
    });

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => {
      ratingDistribution[f.rating]++;
    });

    const responded = feedbacks.filter(
      (f) => f.response && f.response.trim() !== "",
    ).length;
    const responseRate =
      feedbacks.length > 0
        ? Math.round((responded / feedbacks.length) * 100)
        : 0;

    // REAL monthly trend from actual feedback dates
    const monthlyTrend = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(now.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthFeedbacks = feedbacks.filter((f) => {
        const date = new Date(f.createdAt);
        return date >= monthStart && date <= monthEnd;
      });

      const avgRating =
        monthFeedbacks.length > 0
          ? monthFeedbacks.reduce((acc, f) => acc + f.rating, 0) /
            monthFeedbacks.length
          : 0;

      monthlyTrend.push({
        month: month.toLocaleString("default", { month: "short" }),
        year: month.getFullYear(),
        count: monthFeedbacks.length,
        avgRating: parseFloat(avgRating.toFixed(1)),
      });
    }

    res.json({
      success: true,
      data: {
        department: {
          id: department.id,
          name: department.name,
          building: department.building,
          floor: department.floor,
          room: department.room,
          contact: department.contact,
          email: department.email,
          head: department.head,
          rating: department.rating,
        },
        analytics: {
          totalFeedback: feedbacks.length,
          ratingDistribution,
          responseRate,
          monthlyTrend,
          recentFeedback: feedbacks.slice(0, 10),
        },
      },
    });
  } catch (error) {
    console.error("Error in getDepartmentAnalytics:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate report
// @route   POST /api/analytics/report
// @access  Private/FeedbackAnalyst
const generateReport = async (req, res) => {
  try {
    const { reportType, dateRange, format } = req.body;

    // Get real data for the report
    const startDate = dateRange?.startDate
      ? new Date(dateRange.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate
      ? new Date(dateRange.endDate)
      : new Date();

    const feedbacksInRange = await Feedback.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalFeedback = feedbacksInRange.length;
    const avgRating =
      totalFeedback > 0
        ? (
            feedbacksInRange.reduce((sum, f) => sum + f.rating, 0) /
            totalFeedback
          ).toFixed(1)
        : 0;

    const buildingA = feedbacksInRange.filter((f) => f.building === "A").length;
    const buildingB = feedbacksInRange.filter((f) => f.building === "B").length;

    res.json({
      success: true,
      message: "Report generated successfully",
      data: {
        reportType,
        dateRange: { startDate, endDate },
        format,
        generatedAt: new Date().toISOString(),
        summary: {
          totalFeedback,
          avgRating: parseFloat(avgRating),
          buildingA,
          buildingB,
        },
      },
    });
  } catch (error) {
    console.error("Error in generateReport:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inbox feedback
// @route   GET /api/analytics/inbox
// @access  Private/FeedbackAnalyst
const getInbox = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (status === "pending") filter.response = { $exists: false };
    else if (status === "responded")
      filter.response = { $exists: true, $ne: "" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);

    const enrichedFeedbacks = await Promise.all(
      feedbacks.map(async (f) => {
        const dept = await Department.findOne({ id: f.department });
        return {
          ...f.toObject(),
          deptName: dept ? dept.name.en : "Unknown Department",
          deptBuilding: dept ? dept.building : null,
        };
      }),
    );

    res.json({
      success: true,
      data: enrichedFeedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getInbox:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign feedback to analyst
// @route   PUT /api/analytics/feedback/:id/assign
// @access  Private/FeedbackAnalyst
const assignFeedback = async (req, res) => {
  try {
    const { analystId } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    feedback.assignedTo = analystId;
    feedback.assignedAt = new Date();
    await feedback.save();

    res.json({
      success: true,
      message: "Feedback assigned successfully",
    });
  } catch (error) {
    console.error("Error in assignFeedback:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOverview,
  getDepartmentRankings,
  getDepartmentAnalytics,
  generateReport,
  getInbox,
  assignFeedback,
};
