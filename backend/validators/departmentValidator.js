const mongoose = require("mongoose");

const validateDepartmentCreateOrUpdate = (req) => {
  const {
    name,
    sector,
    building,
    floor,
    officeNumber,
    specialIdentifier,
    departmentEmail,
    departmentContactNo,
    services,
    departmentManager
  } = req.body;
  const errors = [];

  if (!name || typeof name !== "string") errors.push("name is required");
  if (!sector || typeof sector !== "string") errors.push("sector is required");
  if (!["A", "B"].includes(building)) errors.push("building must be A or B");
  if (!Number.isInteger(Number(floor)) || Number(floor) < 1 || Number(floor) > 7) errors.push("floor must be between 1 and 7");
  if (!officeNumber || typeof officeNumber !== "string") errors.push("officeNumber is required");
  if (specialIdentifier !== undefined && typeof specialIdentifier !== "string") {
    errors.push("specialIdentifier must be a string");
  }
  if (departmentEmail !== undefined && typeof departmentEmail !== "string") {
    errors.push("departmentEmail must be a string");
  }
  if (departmentContactNo !== undefined && typeof departmentContactNo !== "string") {
    errors.push("departmentContactNo must be a string");
  }
  if (services && !Array.isArray(services)) errors.push("services must be an array");

  if (!departmentManager || typeof departmentManager !== "object") {
    errors.push("departmentManager is required");
  } else {
    if (!departmentManager.name) errors.push("departmentManager.name is required");
    if (!departmentManager.image) errors.push("departmentManager.image is required");
    if (!departmentManager.contactNo) errors.push("departmentManager.contactNo is required");
    if (departmentManager.services && !Array.isArray(departmentManager.services)) {
      errors.push("departmentManager.services must be an array");
    }
  }

  return { isValid: errors.length === 0, errors };
};

const validateDepartmentIdParam = (req) => {
  const { departmentId } = req.params;
  const errors = [];

  if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
    errors.push("departmentId must be a valid id");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateDepartmentCreateOrUpdate,
  validateDepartmentIdParam
};
