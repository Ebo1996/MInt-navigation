const Announcement = require("../models/Announcement");

const ALLOWED_TYPES = ["holiday", "event", "maintenance", "general", "alert"];
const ALLOWED_PRIORITIES = ["low", "medium", "high", "urgent"];

const cleanString = (value) => (typeof value === "string" ? value.trim() : value);

const parseOptionalDate = (value) => {
  if (value == null || value === "") {
    return { value: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid date value" };
  }

  return { value: parsed };
};

const parseRequiredDate = (value) => {
  if (value == null || value === "") {
    return { value: new Date() };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid date value" };
  }

  return { value: parsed };
};

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
  try {
    const { active } = req.query;
    let filter = {};

    if (active === "true") {
      filter = {
        isActive: true,
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: new Date() } },
        ],
      };
    }

    const announcements = await Announcement.find(filter)
      .sort({ priority: -1, startDate: -1 })
      .populate("createdBy", "name username");

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error in getAnnouncements:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Admin
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Admin
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      priority,
      startDate,
      endDate,
      isActive,
      showOnHomePage,
      showOnAllPages,
    } = req.body;

    const t = cleanString(title);
    const m = cleanString(message);
    if (!t || !m) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const normalizedType = cleanString(type) || "general";
    if (!ALLOWED_TYPES.includes(normalizedType)) {
      return res.status(400).json({ message: "Invalid announcement type" });
    }

    const normalizedPriority = cleanString(priority) || "medium";
    if (!ALLOWED_PRIORITIES.includes(normalizedPriority)) {
      return res.status(400).json({ message: "Invalid priority level" });
    }

    const startDateResult = parseRequiredDate(startDate);
    if (startDateResult.error) {
      return res.status(400).json({ message: "Invalid start date" });
    }

    const endDateResult = parseOptionalDate(endDate);
    if (endDateResult.error) {
      return res.status(400).json({ message: "Invalid end date" });
    }

    if (endDateResult.value && endDateResult.value < startDateResult.value) {
      return res
        .status(400)
        .json({ message: "End date cannot be earlier than start date" });
    }

    const announcement = await Announcement.create({
      title: t,
      message: m,
      type: normalizedType,
      priority: normalizedPriority,
      startDate: startDateResult.value,
      endDate: endDateResult.value,
      isActive: parseBoolean(isActive, true),
      showOnHomePage: parseBoolean(showOnHomePage, true),
      showOnAllPages: parseBoolean(showOnAllPages, false),
      createdBy: req.admin._id,
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    console.error("Error in createAnnouncement:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Admin
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const {
      title,
      message,
      type,
      priority,
      startDate,
      endDate,
      isActive,
      showOnHomePage,
      showOnAllPages,
    } = req.body;

    if (title !== undefined) {
      const normalizedTitle = cleanString(title);
      if (!normalizedTitle) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      announcement.title = normalizedTitle;
    }

    if (message !== undefined) {
      const normalizedMessage = cleanString(message);
      if (!normalizedMessage) {
        return res.status(400).json({ message: "Message cannot be empty" });
      }
      announcement.message = normalizedMessage;
    }

    if (type !== undefined) {
      const normalizedType = cleanString(type);
      if (!ALLOWED_TYPES.includes(normalizedType)) {
        return res.status(400).json({ message: "Invalid announcement type" });
      }
      announcement.type = normalizedType;
    }

    if (priority !== undefined) {
      const normalizedPriority = cleanString(priority);
      if (!ALLOWED_PRIORITIES.includes(normalizedPriority)) {
        return res.status(400).json({ message: "Invalid priority level" });
      }
      announcement.priority = normalizedPriority;
    }

    if (startDate !== undefined) {
      const parsedStart = parseRequiredDate(startDate);
      if (parsedStart.error) {
        return res.status(400).json({ message: "Invalid start date" });
      }
      announcement.startDate = parsedStart.value;
    }

    if (endDate !== undefined) {
      const parsedEnd = parseOptionalDate(endDate);
      if (parsedEnd.error) {
        return res.status(400).json({ message: "Invalid end date" });
      }
      announcement.endDate = parsedEnd.value;
    }

    if (announcement.endDate && announcement.endDate < announcement.startDate) {
      return res
        .status(400)
        .json({ message: "End date cannot be earlier than start date" });
    }

    if (isActive !== undefined) {
      announcement.isActive = parseBoolean(isActive, announcement.isActive);
    }
    if (showOnHomePage !== undefined)
      announcement.showOnHomePage = parseBoolean(
        showOnHomePage,
        announcement.showOnHomePage,
      );
    if (showOnAllPages !== undefined)
      announcement.showOnAllPages = parseBoolean(
        showOnAllPages,
        announcement.showOnAllPages,
      );

    await announcement.save();

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error("Error in updateAnnouncement:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await announcement.deleteOne();
    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle announcement status
// @route   PATCH /api/announcements/:id/toggle
// @access  Admin
const toggleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
};
