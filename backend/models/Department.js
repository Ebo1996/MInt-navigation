const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    sector: {
      type: String,
      required: true,
      trim: true
    },
    building: {
      type: String,
      enum: ["A", "B"],
      required: true
    },
    floor: {
      type: Number,
      required: true,
      min: 1
    },
    officeNumber: {
      type: String,
      required: true,
      trim: true
    },
    specialIdentifier: {
      type: String,
      trim: true,
      default: ""
    },
    departmentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    departmentContactNo: {
      type: String,
      trim: true,
      default: ""
    },
    services: {
      type: [String],
      default: []
    },
    departmentManager: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      image: {
        type: String,
        required: true,
        trim: true
      },
      services: {
        type: [String],
        default: []
      },
      contactNo: {
        type: String,
        required: true,
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Department", departmentSchema);
