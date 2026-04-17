const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

const validateSettingsUpdate = (req) => {
  const {
    appName,
    supportEmail,
    defaultTheme,
    allowPublicFeedback,
    announcement,
    announcementStartAt,
    announcementEndAt,
    announcementPriority,
    lastBackupAt
  } = req.body;
  const errors = [];

  if (appName !== undefined && (!appName || typeof appName !== "string")) {
    errors.push("appName must be a non-empty string");
  }

  if (supportEmail !== undefined && !isEmail(supportEmail)) {
    errors.push("supportEmail must be a valid email");
  }

  if (defaultTheme !== undefined && !["light", "dark", "system"].includes(defaultTheme)) {
    errors.push("defaultTheme must be light, dark, or system");
  }

  if (allowPublicFeedback !== undefined && typeof allowPublicFeedback !== "boolean") {
    errors.push("allowPublicFeedback must be boolean");
  }

  if (announcement !== undefined && typeof announcement !== "string") {
    errors.push("announcement must be a string");
  }

  if (announcementStartAt !== undefined && announcementStartAt !== null && Number.isNaN(Date.parse(announcementStartAt))) {
    errors.push("announcementStartAt must be a valid date");
  }

  if (announcementEndAt !== undefined && announcementEndAt !== null && Number.isNaN(Date.parse(announcementEndAt))) {
    errors.push("announcementEndAt must be a valid date");
  }

  if (announcementPriority !== undefined && !["low", "normal", "high"].includes(announcementPriority)) {
    errors.push("announcementPriority must be low, normal, or high");
  }

  if (lastBackupAt !== undefined && lastBackupAt !== null && Number.isNaN(Date.parse(lastBackupAt))) {
    errors.push("lastBackupAt must be a valid date");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateSettingsUpdate
};
