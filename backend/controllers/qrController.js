const asyncHandler = require("../utils/asyncHandler");
const qrService = require("../services/qrService");

const getQrByDepartment = asyncHandler(async (req, res) => {
  const data = await qrService.getDepartmentQr(req.params.departmentId);

  res.status(200).json({
    success: true,
    qrImage: data.qrImage,
    department: data.department
  });
});

module.exports = {
  getQrByDepartment
};
