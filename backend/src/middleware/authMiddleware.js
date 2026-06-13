const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  // 🛡️ Check cookies for token (Advanced Security)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Fallback to Bearer token in headers
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === "superadmin") {
    return next();
  } else {
    return res.status(403).json({ message: "Not authorized as superadmin" });
  }
};

// NEW: Feedback Analyst middleware
const feedbackAnalystOnly = (req, res, next) => {
  if (
    req.admin &&
    (req.admin.role === "feedback_analyst" || req.admin.role === "superadmin")
  ) {
    return next();
  } else {
    return res
      .status(403)
      .json({ message: "Not authorized as feedback analyst" });
  }
};

// NEW: Sector Manager middleware
const sectorManagerOnly = (req, res, next) => {
  if (
    req.admin &&
    (req.admin.role === "sector_manager" || req.admin.role === "superadmin")
  ) {
    return next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied. Sector manager only." });
  }
};

// NEW: Check if user has access to specific sector
const hasSectorAccess = (req, res, next) => {
  const requestedSectorId = parseInt(req.params.sectorId);
  const userSectorId = req.admin.sectorId;
  const userRole = req.admin.role;

  if (userRole === "superadmin") {
    return next();
  }

  if (userRole === "sector_manager" && requestedSectorId === userSectorId) {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. You can only access your own sector.",
  });
};

module.exports = {
  protect,
  superAdminOnly,
  feedbackAnalystOnly,
  sectorManagerOnly,
  hasSectorAccess,
};
