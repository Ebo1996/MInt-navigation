const rateLimit = require("express-rate-limit");

// ─────────────────────────────────────────────
// 🔐 Admin Login Rate Limiter
// Strict: 5 attempts per 15 minutes per IP
// Protects against brute-force login attacks
// ─────────────────────────────────────────────
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    console.warn(
      `⚠️  [RATE LIMIT] Admin login blocked — IP: ${req.ip} | ${new Date().toISOString()}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

// ─────────────────────────────────────────────
// 👑 SuperAdmin Action Rate Limiter
// Moderate: 30 requests per 10 minutes per IP
// Protects destructive/sensitive superadmin ops
// ─────────────────────────────────────────────
const superAdminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many superadmin requests. Please slow down.",
  },
  handler: (req, res, next, options) => {
    console.warn(
      `⚠️  [RATE LIMIT] SuperAdmin route blocked — IP: ${req.ip} | Route: ${req.originalUrl} | ${new Date().toISOString()}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

// ─────────────────────────────────────────────
// 🛡️ General Admin API Rate Limiter
// Relaxed: 100 requests per 10 minutes per IP
// Covers profile reads, updates, etc.
// ─────────────────────────────────────────────
const adminApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
  handler: (req, res, next, options) => {
    console.warn(
      `⚠️  [RATE LIMIT] Admin API blocked — IP: ${req.ip} | Route: ${req.originalUrl} | ${new Date().toISOString()}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

// ─────────────────────────────────────────────
// 🏢 Sector Manager API Rate Limiter
// Moderate: 50 requests per 10 minutes per IP
// ─────────────────────────────────────────────
const sectorManagerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  handler: (req, res, next, options) => {
    console.warn(
      `⚠️  [RATE LIMIT] Sector Manager API blocked — IP: ${req.ip} | Route: ${req.originalUrl} | ${new Date().toISOString()}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  adminLoginLimiter,
  superAdminLimiter,
  adminApiLimiter,
  sectorManagerLimiter,
};
