const express = require("express");
const { getPublicSettings, getSettings, updateSettings } = require("../controllers/settingsController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const { validateSettingsUpdate } = require("../validators/settingsValidator");
const ROLES = require("../constants/roles");

const router = express.Router();

router.get("/public", getPublicSettings);
router.get("/", verifyToken, allowRoles([ROLES.ADMIN]), getSettings);
router.put("/", verifyToken, allowRoles([ROLES.ADMIN]), validateRequest(validateSettingsUpdate), updateSettings);

module.exports = router;
