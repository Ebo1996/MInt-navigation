const asyncHandler = require("../utils/asyncHandler");
const departmentService = require("../services/departmentService");
const auditLogService = require("../services/auditLogService");

const getPublicDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getPublicDepartments(req.query);

  res.status(200).json({
    success: true,
    departments
  });
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getDepartmentsForUser(req.user, req.query);

  res.status(200).json({
    success: true,
    departments
  });
});

const filterDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getFilteredDepartments(req.query);

  res.status(200).json({
    success: true,
    departments
  });
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentByIdForUser(req.params.departmentId, req.user);

  res.status(200).json({
    success: true,
    department
  });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body);
  await auditLogService.logAction(req, {
    action: "create_department",
    resourceType: "department",
    resourceId: department._id,
    metadata: { name: department.name }
  });

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    department
  });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.departmentId, req.body);
  await auditLogService.logAction(req, {
    action: "update_department",
    resourceType: "department",
    resourceId: department._id,
    metadata: { updatedFields: Object.keys(req.body || {}) }
  });

  res.status(200).json({
    success: true,
    message: "Department updated successfully",
    department
  });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const deleted = await departmentService.deleteDepartment(req.params.departmentId);
  await auditLogService.logAction(req, {
    action: "delete_department",
    resourceType: "department",
    resourceId: deleted._id,
    metadata: { name: deleted.name }
  });

  res.status(200).json({
    success: true,
    message: "Department deleted successfully"
  });
});

module.exports = {
  getPublicDepartments,
  getDepartments,
  getDepartmentById,
  filterDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
