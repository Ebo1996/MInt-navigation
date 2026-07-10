/**
 * FIXES Cooperation & Partnership Wing departments (IDs 19-22)
 * that were incorrectly assigned to sectorId=2 instead of sectorId=1.
 *
 * Source: Official MINT Organizational Structure & Floor Directory
 *         Sector 1: Central Administration & Governance Sector
 *         → Cooperation & Partnership Wing
 *
 * Run: node src/utils/fixCooperationWingSector.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Department = require("../models/Department");

const FIXES = [
  { id: 19, name: "International Relations and Cooperation Desk" },
  { id: 20, name: "Regional and City Administration Affairs Desk" },
  { id: 21, name: "Private Sector Desk" },
  { id: 22, name: "Innovation Technology Cooperation and Connection Head Executive" },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    let fixed = 0;

    for (const item of FIXES) {
      const dept = await Department.findOne({ id: item.id });

      if (!dept) {
        console.log(`  ❌ Dept ${item.id} not found in database!`);
        continue;
      }

      if (dept.sectorId === 1) {
        console.log(`  ✅ Dept ${item.id} already has sectorId=1 — no change needed`);
        continue;
      }

      const oldSectorId = dept.sectorId;
      await Department.findOneAndUpdate(
        { id: item.id },
        { $set: { sectorId: 1 } }
      );

      console.log(`  🔧 Fixed Dept ${item.id}: sectorId ${oldSectorId} → 1  |  "${dept.name.en}"`);
      fixed++;
    }

    console.log(`\n📊 Summary: ${fixed} departments fixed`);

    if (fixed > 0) {
      console.log("\n🎉 Cooperation & Partnership Wing now belongs to Sector 1.");
      console.log("   The UI will now show all 4 wings for Central Administration & Governance Sector:");
      console.log("   • Minister's Office (10 desks)");
      console.log("   • Innovation Fund Office (1 desk)");
      console.log("   • Strategic Operations Wing (7 desks)");
      console.log("   • Cooperation & Partnership Wing (4 desks)  ← now fixed");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

run();
