const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    department: {
      type: Number,
      ref: "Department",
      required: true,
    },
    sectorId: {
      type: Number,
      required: true,
    },
    building: {
      type: String,
      enum: ["A", "B"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    visitor: {
      type: String,
      default: "Anonymous",
    },
    visitorEmail: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "published", "resolved"],
      default: "pending",
    },
    response: {
      type: String,
      default: "",
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    replies: [
      {
        text:      { type: String, required: true },
        role:      { type: String, enum: ["feedback_analyst", "sector_manager", "superadmin"], required: true },
        name:      { type: String, default: "Admin" },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    date: {
      type: String,
      default: "",
    },
    time: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast queries
feedbackSchema.index({ department: 1 });
feedbackSchema.index({ sectorId: 1 });
feedbackSchema.index({ status: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
