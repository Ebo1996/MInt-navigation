const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

const validateRegister = (req) => {
  const { name, email, password, role, departmentId } = req.body;
  const errors = [];
  const allowedCreateRoles = [ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER];

  if (!name || typeof name !== "string") errors.push("name is required");
  if (!email || !isEmail(email)) errors.push("valid email is required");
  if (!password || String(password).length < 6) errors.push("password must be at least 6 characters");
  if (!allowedCreateRoles.includes(role)) {
    errors.push("role must be general_manager or department_manager");
  }

  if (role === ROLES.DEPARTMENT_MANAGER) {
    if (!departmentId) errors.push("departmentId is required for department_manager");
    if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
      errors.push("departmentId must be a valid id");
    }
  }

  return { isValid: errors.length === 0, errors };
};

const validateLogin = (req) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isEmail(email)) errors.push("valid email is required");
  if (!password) errors.push("password is required");

  return { isValid: errors.length === 0, errors };
};

const validateAdminUserUpdate = (req) => {
  const { password, isActive, departmentId } = req.body;
  const errors = [];

  if (password !== undefined && String(password).length < 6) {
    errors.push("password must be at least 6 characters");
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be boolean");
  }

  if (departmentId !== undefined && departmentId !== null && !mongoose.Types.ObjectId.isValid(departmentId)) {
    errors.push("departmentId must be a valid id");
  }

  if (password === undefined && isActive === undefined && departmentId === undefined) {
    errors.push("provide at least one field to update");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAdminUserUpdate
};
