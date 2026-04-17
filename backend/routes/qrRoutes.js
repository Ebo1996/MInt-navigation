const express = require("express");
const { getQrByDepartment } = require("../controllers/qrController");
const validateRequest = require("../middleware/validateMiddleware");
const { validateQrDepartmentIdParam } = require("../validators/qrValidator");

const router = express.Router();

router.get("/:departmentId", validateRequest(validateQrDepartmentIdParam), getQrByDepartment);

module.exports = router;
