const Department = require("../models/Department");
const AppError = require("../utils/appError");
const ROLES = require("../constants/roles");

const buildDepartmentFilter = ({ search, building, floor }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { sector: { $regex: search, $options: "i" } }
    ];
  }

  if (building) {
    query.building = building;
  }

  if (floor) {
    query.floor = Number(floor);
  }

  return query;
};

const getPublicDepartments = async (filters = {}) =>
  Department.find(buildDepartmentFilter(filters)).sort({ name: 1 });

const getDepartmentsForUser = async (user, filters = {}) => {
  if (!user) {
    return getPublicDepartments(filters);
  }

  if (user.role === ROLES.DEPARTMENT_MANAGER) {
    if (!user.departmentId) return [];

    const department = await Department.findById(user.departmentId);
    return department ? [department] : [];
  }

  return Department.find(buildDepartmentFilter(filters)).sort({ createdAt: -1 });
};

const getFilteredDepartments = async (filters = {}) =>
  Department.find(buildDepartmentFilter(filters)).sort({ name: 1 });

const getDepartmentByIdForUser = async (departmentId, user) => {
  const department = await Department.findById(departmentId);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  if (user && user.role === ROLES.DEPARTMENT_MANAGER && String(user.departmentId) !== String(department._id)) {
    throw new AppError("Forbidden: cannot access this department", 403);
  }

  return department;
};

const createDepartment = async (payload) => {
  const existing = await Department.findOne({ name: payload.name.trim() });
  if (existing) {
    throw new AppError("Department with this name already exists", 409);
  }

  return Department.create(payload);
};

const updateDepartment = async (departmentId, payload) => {
  const normalizedName = payload?.name?.trim();
  if (normalizedName) {
    const existing = await Department.findOne({
      name: normalizedName,
      _id: { $ne: departmentId }
    });

    if (existing) {
      throw new AppError("Department with this name already exists", 409);
    }
  }

  const department = await Department.findByIdAndUpdate(
    departmentId,
    {
      ...payload,
      ...(normalizedName ? { name: normalizedName } : {})
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!department) {
    throw new AppError("Department not found", 404);
  }

  return department;
};

const deleteDepartment = async (departmentId) => {
  const department = await Department.findByIdAndDelete(departmentId);
  if (!department) {
    throw new AppError("Department not found", 404);
  }

  return department;
};

module.exports = {
  getPublicDepartments,
  getDepartmentsForUser,
  getDepartmentByIdForUser,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getFilteredDepartments
};
