const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");
const auditLogService = require("../services/auditLogService");

const registerUser = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  await auditLogService.logAction(req, {
    action: "create_user",
    resourceType: "user",
    resourceId: user.id,
    metadata: { role: user.role, departmentId: user.departmentId || null }
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { user }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: result.token,
    user: result.user
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    data: { user }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await authService.listUsers(req.query);

  res.status(200).json({
    success: true,
    users
  });
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await authService.updateUserByAdmin(req.params.userId, req.body);
  await auditLogService.logAction(req, {
    action: "update_user",
    resourceType: "user",
    resourceId: user.id,
    metadata: {
      updatedFields: Object.keys(req.body || {})
    }
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user
  });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getUsers,
  updateUserByAdmin
};
