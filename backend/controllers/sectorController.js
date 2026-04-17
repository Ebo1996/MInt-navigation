const asyncHandler = require("../utils/asyncHandler");
const sectorService = require("../services/sectorService");

const getSectors = asyncHandler(async (req, res) => {
  const sectors = await sectorService.listSectors();

  res.status(200).json({
    success: true,
    sectors
  });
});

const createSector = asyncHandler(async (req, res) => {
  const sector = await sectorService.createSector(req.body);

  res.status(201).json({
    success: true,
    message: "Sector created successfully",
    sector
  });
});

module.exports = {
  getSectors,
  createSector
};
