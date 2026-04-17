const express = require("express");
const {
  getPublicDepartments,
  getDepartments,
  getDepartmentById,
  filterDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require("../controllers/departmentController");
const { verifyToken, verifyTokenOptional, allowRoles } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const {
  validateDepartmentCreateOrUpdate,
  validateDepartmentIdParam
} = require("../validators/departmentValidator");
const ROLES = require("../constants/roles");

const router = express.Router();

router.get("/public", getPublicDepartments);
router.get("/filter", filterDepartments);
router.get("/", verifyTokenOptional, getDepartments);
router.get("/:departmentId", verifyTokenOptional, validateRequest(validateDepartmentIdParam), getDepartmentById);

router.post(
  "/",
  verifyToken,
  allowRoles([ROLES.ADMIN]),
  validateRequest(validateDepartmentCreateOrUpdate),
  createDepartment
);

router.put(
  "/:departmentId",
  verifyToken,
  allowRoles([ROLES.ADMIN]),
  validateRequest(validateDepartmentIdParam),
  validateRequest(validateDepartmentCreateOrUpdate),
  updateDepartment
);

router.delete(
  "/:departmentId",
  verifyToken,
  allowRoles([ROLES.ADMIN]),
  validateRequest(validateDepartmentIdParam),
  deleteDepartment
);

module.exports = router;
