const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/appError");
const ROLES = require("../constants/roles");

const registerUser = async ({ name, email, password, role, departmentId }) => {
  const normalizedEmail = email.toLowerCase();
  const allowedCreateRoles = [ROLES.GENERAL_MANAGER, ROLES.DEPARTMENT_MANAGER];

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  if (!allowedCreateRoles.includes(role)) {
    throw new AppError("Only manager roles can be created from this endpoint", 403);
  }

  if (role === ROLES.DEPARTMENT_MANAGER) {
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError("Department not found for department manager", 404);
    }

    const existingDepartmentManager = await User.findOne({
      role: ROLES.DEPARTMENT_MANAGER,
      departmentId
    });

    if (existingDepartmentManager) {
      throw new AppError("This department already has a department manager", 409);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    departmentId: role === ROLES.DEPARTMENT_MANAGER ? departmentId : null
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is disabled. Contact admin.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user._id);
  user.lastLoginAt = new Date();
  await user.save();

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    }
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId
  };
};

const listUsers = async ({ q = "", role = "", isActive, departmentId = "" } = {}) => {
  const query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined && isActive !== "") {
    query.isActive = String(isActive) === "true";
  }

  if (departmentId) {
    query.departmentId = departmentId;
  }

  const users = await User.find(query).select("-password").populate("departmentId", "name").sort({ createdAt: -1 });
  return users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId?._id || null,
    departmentName: user.departmentId?.name || "",
    isActive: Boolean(user.isActive),
    lastLoginAt: user.lastLoginAt
  }));
};

const updateUserByAdmin = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (payload.password !== undefined) {
    user.password = await bcrypt.hash(payload.password, 10);
  }

  if (payload.isActive !== undefined) {
    user.isActive = Boolean(payload.isActive);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "departmentId")) {
    if (user.role !== ROLES.DEPARTMENT_MANAGER) {
      throw new AppError("Only department managers can be reassigned to departments", 400);
    }

    if (!payload.departmentId) {
      user.departmentId = null;
    } else {
      const department = await Department.findById(payload.departmentId);
      if (!department) {
        throw new AppError("Department not found", 404);
      }

      const existingManager = await User.findOne({
        _id: { $ne: userId },
        role: ROLES.DEPARTMENT_MANAGER,
        departmentId: payload.departmentId
      });

      if (existingManager) {
        throw new AppError("That department already has a department manager", 409);
      }

      user.departmentId = payload.departmentId;
    }
  }

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    isActive: Boolean(user.isActive),
    lastLoginAt: user.lastLoginAt
  };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  listUsers,
  updateUserByAdmin
};
