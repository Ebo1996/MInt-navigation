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
      enum: ["admin", "superadmin", "feedback_analyst", "sector_manager", "department_head"],
      default: "admin",
    },
    sectorId: {
      type: Number,
      required: function () {
        return this.role === "sector_manager" || this.role === "department_head";
      },
      default: null,
    },
    // departmentId: single desk id (optional, used when head manages one desk)
    departmentId: {
      type: Number,
      default: null,
    },
    // wing: department/wing name this head manages (all desks with this wing in their sector)
    wing: {
      type: String,
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
