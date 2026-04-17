const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "app"
    },
    appName: {
      type: String,
      default: "MInT Smart Visitor Guidance"
    },
    supportEmail: {
      type: String,
      default: "support@mint.local"
    },
    defaultTheme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light"
    },
    allowPublicFeedback: {
      type: Boolean,
      default: true
    },
    announcement: {
      type: String,
      default: ""
    },
    announcementStartAt: {
      type: Date,
      default: null
    },
    announcementEndAt: {
      type: Date,
      default: null
    },
    announcementPriority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal"
    },
    lastBackupAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
