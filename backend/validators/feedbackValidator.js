const mongoose = require("mongoose");

const validateCreateFeedback = (req) => {
  const { departmentId, rating, comment, userName } = req.body;
  const errors = [];

  if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
    errors.push("departmentId must be a valid id");
  }

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    errors.push("rating must be between 1 and 5");
  }

  if (!comment || String(comment).trim().length < 3) {
    errors.push("comment must be at least 3 characters");
  }

  if (userName && typeof userName !== "string") {
    errors.push("userName must be a string");
  }

  return { isValid: errors.length === 0, errors };
};

const validateRespondFeedback = (req) => {
  const feedbackId = req.params.feedbackId || req.params.id;
  const { response } = req.body;
  const errors = [];

  if (!feedbackId || !mongoose.Types.ObjectId.isValid(feedbackId)) {
    errors.push("feedbackId must be a valid id");
  }

  if (!response || String(response).trim().length < 2) {
    errors.push("response is required");
  }

  return { isValid: errors.length === 0, errors };
};

const validateFeedbackDepartmentParam = (req) => {
  const { departmentId } = req.params;
  const errors = [];

  if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
    errors.push("departmentId must be a valid id");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateCreateFeedback,
  validateRespondFeedback,
  validateFeedbackDepartmentParam
};
