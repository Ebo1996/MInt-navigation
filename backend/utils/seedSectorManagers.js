const mongoose = require("mongoose");
const Admin = require("../src/models/Admin");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const sectorManagers = [
  {
    sectorId: 1,
    name: "Ato Solomon Aynimar",
    username: "sector1.manager",
    email: "sector1@mint.gov.et",
  },
  {
    sectorId: 2,
    name: "Dr. Alemitu Bekele",
    username: "sector2.manager",
    email: "sector2@mint.gov.et",
  },
  {
    sectorId: 3,
    name: "W/o Etalemew Gezahegn",
    username: "sector3.manager",
    email: "sector3@mint.gov.et",
  },
  {
    sectorId: 4,
    name: "Dr. Worku Mekonnen",
    username: "sector4.manager",
    email: "sector4@mint.gov.et",
  },
  {
    sectorId: 5,
    name: "Ato Dagne Assefa",
    username: "sector5.manager",
    email: "sector5@mint.gov.et",
  },
  {
    sectorId: 6,
    name: "TBD",
    username: "sector6.manager",
    email: "sector6@mint.gov.et",
  },
  {
    sectorId: 7,
    name: "Ato Denber Getahun",
    username: "sector7.manager",
    email: "sector7@mint.gov.et",
  },
  {
    sectorId: 8,
    name: "TBD",
    username: "sector8.manager",
    email: "sector8@mint.gov.et",
  },
];

const seedSectorManagers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (const manager of sectorManagers) {
      const existing = await Admin.findOne({ username: manager.username });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("sector123", salt);

        await Admin.create({
          username: manager.username,
          password: hashedPassword,
          email: manager.email,
          role: "sector_manager",
          sectorId: manager.sectorId,
          name: manager.name,
          avatar: `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${encodeURIComponent(manager.name)}`,
        });
        console.log(
          `✅ Created: ${manager.username} (Sector ${manager.sectorId})`,
        );
      } else {
        console.log(`ℹ️ Already exists: ${manager.username}`);
      }
    }

    console.log("✅ Sector managers seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedSectorManagers();
