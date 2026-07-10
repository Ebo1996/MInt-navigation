require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected");

  // Remove sector managers for old sectors 4-8
  const deleted = await Admin.deleteMany({ role: "sector_manager", sectorId: { $in: [4,5,6,7,8] } });
  console.log(`🗑️  Deleted ${deleted.deletedCount} old sector managers (sectors 4-8)`);

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("sector123", salt);

  const managers = [
    { sectorId: 1, name: "Central Admin Manager",        username: "sector1.manager", email: "sector1@mint.gov.et" },
    { sectorId: 2, name: "Innovation Research Manager",  username: "sector2.manager", email: "sector2@mint.gov.et" },
    { sectorId: 3, name: "ICT Digital Economy Manager",  username: "sector3.manager", email: "sector3@mint.gov.et" },
  ];

  for (const m of managers) {
    const exists = await Admin.findOne({ username: m.username });
    if (!exists) {
      await Admin.create({ ...m, password, role: "sector_manager", avatar: "" });
      console.log(`✅ Created: ${m.username} (Sector ${m.sectorId})`);
    } else {
      await Admin.updateOne({ username: m.username }, { $set: { sectorId: m.sectorId, name: m.name, email: m.email } });
      console.log(`✅ Updated: ${m.username} (Sector ${m.sectorId})`);
    }
  }

  console.log("\n✅ Sector managers: only sectors 1, 2, 3 remain.");
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
