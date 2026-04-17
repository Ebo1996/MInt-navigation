const asyncHandler = require("../utils/asyncHandler");
const settingsService = require("../services/settingsService");
const auditLogService = require("../services/auditLogService");

const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getOrCreateSettings();

  res.status(200).json({
    success: true,
    settings
  });
});

const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getPublicSettings();

  res.status(200).json({
    success: true,
    settings
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body);
  await auditLogService.logAction(req, {
    action: "update_settings",
    resourceType: "settings",
    resourceId: settings._id,
    metadata: { updatedFields: Object.keys(req.body || {}) }
  });

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    settings
  });
});

module.exports = {
  getPublicSettings,
  getSettings,
  updateSettings
};
