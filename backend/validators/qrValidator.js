const mongoose = require("mongoose");

const validateQrDepartmentIdParam = (req) => {
  const { departmentId } = req.params;
  const errors = [];

  if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
    errors.push("departmentId must be a valid id");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateQrDepartmentIdParam
};
