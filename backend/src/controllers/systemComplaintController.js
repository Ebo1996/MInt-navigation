const SystemComplaint = require("../models/SystemComplaint");

// @desc    Submit a system comment or complaint
// @route   POST /api/system-complaints
// @access  Public
const createComplaint = async (req, res) => {
  try {
    const { type, subject, message, visitor, visitorEmail } = req.body;

    if (!type || !subject || !message) {
      return res.status(400).json({ message: "Type, subject, and message are required" });
    }

    if (!["comment", "complaint"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'comment' or 'complaint'" });
    }

    const complaint = await SystemComplaint.create({
      type,
      subject: subject.trim(),
      message: message.trim(),
      visitor: visitor || "Anonymous",
      visitorEmail: visitorEmail || "",
    });

    res.status(201).json({
      success: true,
      message: "Submitted successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Error creating system complaint:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all system complaints (admin)
// @route   GET /api/system-complaints
// @access  Private/Admin
const getComplaints = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type && type !== "all") filter.type = type;
    if (status && status !== "all") filter.status = status;

    const total = await SystemComplaint.countDocuments(filter);
    const complaints = await SystemComplaint.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/system-complaints/:id
// @access  Private/Admin
const getComplaintById = async (req, res) => {
  try {
    const complaint = await SystemComplaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status / add admin note
// @route   PUT /api/system-complaints/:id
// @access  Private/Admin
const updateComplaint = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const complaint = await SystemComplaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Not found" });

    if (status) complaint.status = status;
    if (adminNote !== undefined) complaint.adminNote = adminNote;

    if (status && status !== "pending") {
      complaint.reviewedBy = req.admin._id;
      complaint.reviewedAt = new Date();
    }

    await complaint.save();
    res.json({ success: true, message: "Updated successfully", data: complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/system-complaints/:id
// @access  Private/Admin
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await SystemComplaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Not found" });
    await complaint.deleteOne();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stats summary
// @route   GET /api/system-complaints/stats
// @access  Private/Admin
const getComplaintStats = async (req, res) => {
  try {
    const total = await SystemComplaint.countDocuments();
    const pending = await SystemComplaint.countDocuments({ status: "pending" });
    const reviewed = await SystemComplaint.countDocuments({ status: "reviewed" });
    const resolved = await SystemComplaint.countDocuments({ status: "resolved" });
    const comments = await SystemComplaint.countDocuments({ type: "comment" });
    const complaints = await SystemComplaint.countDocuments({ type: "complaint" });

    res.json({ success: true, data: { total, pending, reviewed, resolved, comments, complaints } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
};
