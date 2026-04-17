const AppError = require("../utils/appError");

const validateRequest = (validator) => (req, res, next) => {
  const result = validator(req);

  if (!result.isValid) {
    return next(new AppError("Validation error", 400, result.errors));
  }

  return next();
};

module.exports = validateRequest;
