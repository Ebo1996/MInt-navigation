const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized: token missing", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new AppError("Unauthorized: user not found", 401);
  }
  if (user.isActive === false) {
    throw new AppError("Unauthorized: account disabled", 401);
  }

  req.user = user;
  next();
});

const verifyTokenOptional = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (user) {
    req.user = user;
  }

  next();
});

const allowRoles = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError("Forbidden: insufficient permissions", 403));
  }

  return next();
};

module.exports = {
  verifyToken,
  verifyTokenOptional,
  allowRoles
};
