const express = require("express");
const {
  createFeedback,
  getFeedback,
  getAllFeedback,
  getFeedbackByDepartment,
  respondToFeedback,
  respondToFeedbackAlias,
  getFeedbackAnalytics,
  getFeedbackTrendAnalytics
} = require("../controllers/feedbackController");
const { verifyToken, verifyTokenOptional, allowRoles } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const {
  validateCreateFeedback,
  validateRespondFeedback,
  validateFeedbackDepartmentParam
} = require("../validators/feedbackValidator");
const ROLES = require("../constants/roles");

const router = express.Router();

router.post("/", verifyTokenOptional, validateRequest(validateCreateFeedback), createFeedback);

router.get(
  "/",
  verifyToken,
  allowRoles([ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER]),
  getFeedback
);

router.get(
  "/all",
  verifyToken,
  allowRoles([ROLES.ADMIN, ROLES.GENERAL_MANAGER]),
  getAllFeedback
);

router.get(
  "/department/:departmentId",
  verifyToken,
  allowRoles([ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER]),
  validateRequest(validateFeedbackDepartmentParam),
  getFeedbackByDepartment
);

router.get(
  "/analytics/summary",
  verifyToken,
  allowRoles([ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER]),
  getFeedbackAnalytics
);

router.get(
  "/analytics/trends",
  verifyToken,
  allowRoles([ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER]),
  getFeedbackTrendAnalytics
);

router.patch(
  "/:feedbackId/respond",
  verifyToken,
  allowRoles([ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER]),
  validateRequest(validateRespondFeedback),
  respondToFeedback
);

router.put(
  "/respond/:id",
  verifyToken,
  allowRoles([ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER]),
  validateRequest(validateRespondFeedback),
  respondToFeedbackAlias
);

module.exports = router;
