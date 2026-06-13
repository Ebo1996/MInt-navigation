const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "superadmin", "feedback_analyst", "sector_manager"],
      default: "admin",
    },
    sectorId: {
      type: Number,
      required: function () {
        return this.role === "sector_manager";
      },
      default: null,
    },
    name: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    lastLogin: Date,
    alerts: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
