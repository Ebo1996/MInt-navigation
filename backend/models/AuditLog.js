const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    actorRole: {
      type: String,
      default: "system"
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    resourceType: {
      type: String,
      required: true,
      trim: true
    },
    resourceId: {
      type: String,
      default: ""
    },
    method: {
      type: String,
      default: ""
    },
    path: {
      type: String,
      default: ""
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
