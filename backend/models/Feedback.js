const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true
    },
    userName: {
      type: String,
      trim: true,
      default: "Visitor"
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "responded"],
      default: "pending",
      index: true
    },
    response: {
      type: String,
      trim: true,
      default: ""
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    respondedAt: {
      type: Date,
      default: null
    },
    followUpCount: {
      type: Number,
      default: 0
    },
    lastFollowedUpAt: {
      type: Date,
      default: null
    },
    lastFollowUpNote: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
