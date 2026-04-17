const AppError = require("../utils/appError");
const runtimeErrorService = require("../services/runtimeErrorService");

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  runtimeErrorService.captureError(err, req);

  res.status(statusCode).json({
    success: false,
    message,
    details: err.details || null,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
