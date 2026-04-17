const express = require("express");
const { getSectors, createSector } = require("../controllers/sectorController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const { validateSectorPayload } = require("../validators/sectorValidator");
const ROLES = require("../constants/roles");

const router = express.Router();

router.get("/", getSectors);
router.post("/", verifyToken, allowRoles([ROLES.ADMIN]), validateRequest(validateSectorPayload), createSector);

module.exports = router;
