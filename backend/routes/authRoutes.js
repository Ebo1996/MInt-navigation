const express = require("express");
const { registerUser, loginUser, getCurrentUser, getUsers, updateUserByAdmin } = require("../controllers/authController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const { validateRegister, validateLogin, validateAdminUserUpdate } = require("../validators/authValidator");
const ROLES = require("../constants/roles");

const router = express.Router();

router.post(
  "/register",
  verifyToken,
  allowRoles([ROLES.ADMIN]),
  validateRequest(validateRegister),
  registerUser
);
router.post("/login", validateRequest(validateLogin), loginUser);
router.get("/me", verifyToken, getCurrentUser);
router.get("/users", verifyToken, allowRoles([ROLES.ADMIN]), getUsers);
router.patch(
  "/users/:userId",
  verifyToken,
  allowRoles([ROLES.ADMIN]),
  validateRequest(validateAdminUserUpdate),
  updateUserByAdmin
);

module.exports = router;
