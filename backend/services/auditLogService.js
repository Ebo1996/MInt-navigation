const AuditLog = require("../models/AuditLog");

const logAction = async (req, { action, resourceType, resourceId = "", metadata = {} }) => {
  try {
    await AuditLog.create({
      actorId: req?.user?._id || null,
      actorRole: req?.user?.role || "system",
      action,
      resourceType,
      resourceId: String(resourceId || ""),
      method: req?.method || "",
      path: req?.originalUrl || "",
      metadata
    });
  } catch (error) {
    // Audit logging should not break primary business operations.
  }
};

const listLogs = async ({ page = 1, limit = 20, action = "", resourceType = "" } = {}) => {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const query = {};
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;

  const [items, total] = await Promise.all([
    AuditLog.find(query)
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .skip((normalizedPage - 1) * normalizedLimit)
      .limit(normalizedLimit),
    AuditLog.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total
    }
  };
};

module.exports = {
  logAction,
  listLogs
};
