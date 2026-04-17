const Department = require("../models/Department");
const AppError = require("../utils/appError");

const getDepartmentQr = async (departmentId) => {
  const department = await Department.findById(departmentId).select("name building floor officeNumber");

  if (!department) {
    throw new AppError("Department not found", 404);
  }

  const qrPayload = JSON.stringify({
    departmentId: department._id,
    name: department.name,
    building: department.building,
    floor: department.floor,
    officeNumber: department.officeNumber
  });

  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

  return {
    qrImage,
    department
  };
};

module.exports = {
  getDepartmentQr
};
