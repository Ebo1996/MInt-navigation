const Sector = require("../models/Sector");
const AppError = require("../utils/appError");

const listSectors = async () => Sector.find().sort({ name: 1 });

const createSector = async ({ name }) => {
  const normalizedName = String(name).trim();
  const existing = await Sector.findOne({ name: normalizedName });
  if (existing) {
    throw new AppError("Sector already exists", 409);
  }

  return Sector.create({ name: normalizedName });
};

module.exports = {
  listSectors,
  createSector
};
