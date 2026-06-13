const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["holiday", "event", "maintenance", "general", "alert"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnHomePage: {
      type: Boolean,
      default: true,
    },
    showOnAllPages: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Check if announcement is active and not expired
announcementSchema.virtual("isExpired").get(function () {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
});

announcementSchema.virtual("status").get(function () {
  if (!this.isActive) return "inactive";
  if (this.isExpired) return "expired";
  return "active";
});

module.exports = mongoose.model("Announcement", announcementSchema);
