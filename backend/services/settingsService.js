const SystemSetting = require("../models/SystemSetting");

const getOrCreateSettings = async () => {
  const existing = await SystemSetting.findOne({ key: "app" });
  if (existing) return existing;

  return SystemSetting.create({ key: "app" });
};

const serializePublicSettings = (settings) => {
  const now = new Date();
  const hasAnnouncement = Boolean(settings.announcement?.trim());
  const startsOk = !settings.announcementStartAt || now >= new Date(settings.announcementStartAt);
  const endsOk = !settings.announcementEndAt || now <= new Date(settings.announcementEndAt);
  const isAnnouncementActive = hasAnnouncement && startsOk && endsOk;

  return {
    appName: settings.appName,
    supportEmail: settings.supportEmail,
    allowPublicFeedback: settings.allowPublicFeedback,
    announcement: isAnnouncementActive ? settings.announcement : "",
    announcementPriority: settings.announcementPriority || "normal"
  };
};

const getPublicSettings = async () => {
  const settings = await getOrCreateSettings();
  return serializePublicSettings(settings);
};

const updateSettings = async (payload) => {
  const settings = await getOrCreateSettings();

  const updatableFields = [
    "appName",
    "supportEmail",
    "defaultTheme",
    "allowPublicFeedback",
    "announcement",
    "announcementStartAt",
    "announcementEndAt",
    "announcementPriority",
    "lastBackupAt"
  ];

  updatableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      settings[field] = payload[field];
    }
  });

  await settings.save();
  return settings;
};

module.exports = {
  getOrCreateSettings,
  getPublicSettings,
  updateSettings
};
