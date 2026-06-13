// backend/controllers/sectorFeedbackController.js
// ================================================
// COMPLETE UPDATED VERSION WITH:
// - Email notifications
// - CSV export
// - Profile update
// - Password change
// - Rating distribution
// - Advanced filtering & sorting
// ================================================

const Feedback = require("../models/Feedback");
const Department = require("../models/Department");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const { sendResponseEmail, isEmailConfigured } = require("../utils/emailService");

// ==============================================
// 1. GET SECTOR FEEDBACK (WITH FILTERING & SORTING)
// ==============================================
const getSectorFeedback = async (req, res) => {
  try {
    const { sectorId } = req.params;
    const {
      status,
      department,
      search,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Security: Check sector access
    const userSectorId = req.admin.sectorId;
    if (
      parseInt(sectorId) !== userSectorId &&
      req.admin.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all departments in this sector
    const departments = await Department.find({ sectorId: parseInt(sectorId) });
    const departmentIds = departments.map((d) => d.id);
    const departmentMap = new Map();
    departments.forEach((d) => {
      departmentMap.set(d.id, { name: d.name.en, building: d.building });
    });

    // ========== CALCULATE DEPARTMENT PERFORMANCE ==========
    const departmentPerformance = await Promise.all(
      departments.map(async (dept) => {
        const deptFeedbacks = await Feedback.find({ department: dept.id });
        const deptTotal = deptFeedbacks.length;
        const deptAvgRating =
          deptTotal > 0
            ? (
                deptFeedbacks.reduce((sum, f) => sum + f.rating, 0) / deptTotal
              ).toFixed(1)
            : dept.rating || 0;
        const deptResponded = deptFeedbacks.filter(
          (f) => f.response && f.response.trim() !== "",
        ).length;
        const deptResponseRate =
          deptTotal > 0 ? Math.round((deptResponded / deptTotal) * 100) : 0;

        return {
          id: dept.id,
          name: dept.name.en || dept.name,
          rating: parseFloat(deptAvgRating),
          feedbackCount: deptTotal,
          responseRate: deptResponseRate,
        };
      }),
    );
    departmentPerformance.sort((a, b) => b.rating - a.rating);
    // ========== END OF DEPARTMENT PERFORMANCE ==========

    // Build filter
    let filter = { department: { $in: departmentIds } };

    if (status === "pending") {
      // Keep "pending" logic consistent with dashboard stats:
      // pending = no response (missing OR empty) and not resolved.
      filter.$and = [
        {
          $or: [{ response: { $exists: false } }, { response: "" }],
        },
        { resolved: false },
      ];
    } else if (status === "responded") {
      filter.response = { $exists: true, $ne: "" };
      filter.resolved = false;
    } else if (status === "resolved") {
      filter.resolved = true;
    }

    if (department && department !== "all") {
      filter.department = parseInt(department);
    }

    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: "i" } },
        { visitor: { $regex: search, $options: "i" } },
        { visitorEmail: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Feedback.countDocuments(filter);

    // Get feedback with sorting
    let sortOptions = {};
    if (sortBy === "date") {
      sortOptions.createdAt = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "rating") {
      sortOptions.rating = sortOrder === "desc" ? -1 : 1;
    } else if (sortBy === "department") {
      sortOptions.department = sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const feedbacks = await Feedback.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Enrich with department names
    const enrichedFeedbacks = feedbacks.map((f) => ({
      ...f.toObject(),
      departmentName: departmentMap.get(f.department)?.name || "Unknown",
      departmentBuilding: departmentMap.get(f.department)?.building || null,
    }));

    // Get department list for filter dropdown
    const departmentList = departments.map((d) => ({
      id: d.id,
      name: d.name.en,
    }));

    res.json({
      success: true,
      data: enrichedFeedbacks,
      departmentPerformance: departmentPerformance, // ← ADDED THIS
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      filters: {
        departments: departmentList,
        statuses: ["all", "pending", "responded", "resolved"],
      },
    });
  } catch (error) {
    console.error("Error in getSectorFeedback:", error);
    res.status(500).json({ message: error.message });
  }
};
// ==============================================
// 2. GET SECTOR STATS (WITH RATING DISTRIBUTION)
// ==============================================
const getSectorStats = async (req, res) => {
  try {
    const { sectorId } = req.params;

    // Get all departments in this sector
    const departments = await Department.find({ sectorId: parseInt(sectorId) });
    const departmentIds = departments.map((d) => d.id);

    const feedbacks = await Feedback.find({
      department: { $in: departmentIds },
    });

    const totalFeedback = feedbacks.length;
    const avgRating =
      totalFeedback > 0
        ? (
            feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
          ).toFixed(1)
        : 0;

    const respondedCount = feedbacks.filter(
      (f) => f.response && f.response.trim() !== "",
    ).length;
    const responseRate =
      totalFeedback > 0
        ? Math.round((respondedCount / totalFeedback) * 100)
        : 0;
    const pendingCount = feedbacks.filter(
      (f) => !f.response && !f.resolved,
    ).length;
    const resolvedCount = feedbacks.filter((f) => f.resolved).length;

    // ========== RATING DISTRIBUTION ==========
    const ratingDistribution = {
      1: feedbacks.filter((f) => f.rating === 1).length,
      2: feedbacks.filter((f) => f.rating === 2).length,
      3: feedbacks.filter((f) => f.rating === 3).length,
      4: feedbacks.filter((f) => f.rating === 4).length,
      5: feedbacks.filter((f) => f.rating === 5).length,
    };

    // ========== WEEKLY ACTIVITY (Last 7 days) ==========
    const weeklyActivity = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayFeedbacks = feedbacks.filter((f) => {
        const fDate = new Date(f.createdAt).toISOString().split("T")[0];
        return fDate === dateStr;
      });

      const dayAvg =
        dayFeedbacks.length > 0
          ? dayFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
            dayFeedbacks.length
          : 0;

      weeklyActivity.push({
        date: dateStr,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        count: dayFeedbacks.length,
        avgRating: parseFloat(dayAvg.toFixed(1)),
      });
    }

    // ========== MONTHLY ACTIVITY (Last 6 months) ==========
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(today.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthFeedbacks = feedbacks.filter((f) => {
        const fDate = new Date(f.createdAt);
        return fDate >= monthStart && fDate <= monthEnd;
      });

      const monthAvg =
        monthFeedbacks.length > 0
          ? monthFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
            monthFeedbacks.length
          : 0;

      monthlyActivity.push({
        month: month.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        count: monthFeedbacks.length,
        avgRating: parseFloat(monthAvg.toFixed(1)),
      });
    }

    res.json({
      success: true,
      data: {
        totalFeedback,
        avgRating: parseFloat(avgRating),
        responseRate,
        pendingCount,
        resolvedCount,
        departmentCount: departments.length,
        ratingDistribution,
        weeklyActivity,
        monthlyActivity,
      },
    });
  } catch (error) {
    console.error("Error in getSectorStats:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 3. RESPOND TO FEEDBACK (WITH EMAIL NOTIFICATION)
// ==============================================
const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.trim() === "") {
      return res.status(400).json({ message: "Response cannot be empty" });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Verify sector access
    const department = await Department.findOne({ id: feedback.department });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (
      department.sectorId !== req.admin.sectorId &&
      req.admin.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update feedback
    feedback.response = response;
    feedback.status = "published";
    feedback.respondedBy = req.admin._id;
    feedback.respondedAt = new Date();

    // Push into unified replies array
    feedback.replies.push({
      text:      response,
      role:      req.admin.role || "sector_manager",
      name:      req.admin.name || req.admin.username || "Sector Manager",
      createdAt: new Date(),
    });

    await feedback.save();

    // ========== SEND EMAIL NOTIFICATION (NON-BLOCKING FOR RESPONSE SAVE) ==========
    let emailResult = { sent: false, reason: "missing_visitor_email" };
    if (feedback.visitorEmail && feedback.visitorEmail.trim() !== "") {
      const senderName =
        req.admin.name || req.admin.username || "Sector Manager";
      emailResult = await sendResponseEmail(feedback, response, senderName);
      if (!emailResult.sent) {
        console.warn("Email was not sent:", emailResult);
      }
    }

    res.json({
      success: true,
      message: "Response sent successfully",
      feedback,
      emailSent: emailResult.sent,
      emailStatus: emailResult,
      emailConfigured: isEmailConfigured(),
    });
  } catch (error) {
    console.error("Error in respondToFeedback:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 4. RESOLVE FEEDBACK
// ==============================================
const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Verify sector access
    const department = await Department.findOne({ id: feedback.department });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (
      department.sectorId !== req.admin.sectorId &&
      req.admin.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    feedback.resolved = true;
    feedback.resolvedAt = new Date();
    feedback.status = "resolved";
    await feedback.save();

    res.json({
      success: true,
      message: "Feedback marked as resolved",
      feedback,
    });
  } catch (error) {
    console.error("Error in resolveFeedback:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 5. EXPORT FEEDBACK AS CSV
// ==============================================
const exportCSV = async (req, res) => {
  try {
    const { sectorId } = req.params;

    // Get all departments in this sector
    const departments = await Department.find({ sectorId: parseInt(sectorId) });
    const departmentIds = departments.map((d) => d.id);
    const departmentMap = new Map();
    departments.forEach((d) => {
      departmentMap.set(d.id, d.name.en);
    });

    const feedbacks = await Feedback.find({
      department: { $in: departmentIds },
    }).sort({
      createdAt: -1,
    });

    const headers = [
      "Date",
      "Rating",
      "Department",
      "Visitor Name",
      "Visitor Email",
      "Comment",
      "Response",
      "Status",
      "Resolved At",
    ];

    const rows = feedbacks.map((f) => [
      new Date(f.createdAt).toLocaleString(),
      f.rating,
      departmentMap.get(f.department) || "Unknown",
      f.visitor || "Anonymous",
      f.visitorEmail || "N/A",
      `"${(f.comment || "").replace(/"/g, '""')}"`,
      `"${(f.response || "Pending").replace(/"/g, '""')}"`,
      f.resolved ? "Resolved" : f.response ? "Responded" : "Pending",
      f.resolvedAt ? new Date(f.resolvedAt).toLocaleString() : "N/A",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sector-${sectorId}-feedback-${Date.now()}.csv`,
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error in exportCSV:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 6. UPDATE PROFILE
// ==============================================
const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const adminId = req.admin._id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (avatar) admin.avatar = avatar;

    await admin.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role,
        sectorId: admin.sectorId,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 7. CHANGE PASSWORD
// ==============================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin._id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 8. GET PENDING COUNT (FOR NOTIFICATIONS)
// ==============================================
const getPendingCount = async (req, res) => {
  try {
    const { sectorId } = req.params;

    const departments = await Department.find({ sectorId: parseInt(sectorId) });
    const departmentIds = departments.map((d) => d.id);

    const pendingCount = await Feedback.countDocuments({
      department: { $in: departmentIds },
      $or: [{ response: { $exists: false } }, { response: "" }],
      resolved: false,
    });

    res.json({ success: true, pendingCount });
  } catch (error) {
    console.error("Error in getPendingCount:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// EXPORTS
// ==============================================
module.exports = {
  getSectorFeedback,
  getSectorStats,
  respondToFeedback,
  resolveFeedback,
  exportCSV,
  updateProfile,
  changePassword,
  getPendingCount,
};
