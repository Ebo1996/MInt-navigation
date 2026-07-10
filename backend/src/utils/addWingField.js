/**
 * Adds the `wing` field to all departments in the database.
 * Run: node src/utils/addWingField.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Department = require("../models/Department");

// Maps department id → wing name (from official directory)
const WING_MAP = {
  // Sector 1 - Minister's Office
  1:  "Minister's Office",
  2:  "Minister's Office",
  3:  "Minister's Office",
  4:  "Minister's Office",
  5:  "Minister's Office",
  6:  "Minister's Office",
  7:  "Minister's Office",
  8:  "Minister's Office",
  9:  "Minister's Office",
  10: "Minister's Office",
  // Sector 1 - Innovation Fund Office
  11: "Innovation Fund Office",
  // Sector 1 - Strategic Operations Wing
  12: "Strategic Operations Wing",
  13: "Strategic Operations Wing",
  14: "Strategic Operations Wing",
  15: "Strategic Operations Wing",
  16: "Strategic Operations Wing",
  17: "Strategic Operations Wing",
  18: "Strategic Operations Wing",
  // Sector 1 - Cooperation & Partnership Wing
  19: "Cooperation & Partnership Wing",
  20: "Cooperation & Partnership Wing",
  21: "Cooperation & Partnership Wing",
  22: "Cooperation & Partnership Wing",
  // Sector 2 - R&D Infrastructure Lead Executive
  23: "Research & Development Infrastructure Lead Executive",
  24: "Research & Development Infrastructure Lead Executive",
  25: "Research & Development Infrastructure Lead Executive",
  // Sector 2 - Technology Transfer & Development Lead Executive
  26: "Technology Transfer & Development Lead Executive",
  27: "Technology Transfer & Development Lead Executive",
  28: "Technology Transfer & Development Lead Executive",
  // Sector 2 - Innovation Ecosystem Development Lead Executive
  29: "Innovation Ecosystem Development Lead Executive",
  30: "Innovation Ecosystem Development Lead Executive",
  31: "Innovation Ecosystem Development Lead Executive",
  // Sector 3 - E-Government Development Lead Executive
  32: "E-Government Development Lead Executive",
  33: "E-Government Development Lead Executive",
  34: "E-Government Development Lead Executive",
  // Sector 3 - Government ICT Infrastructure Construction & Management Lead Executive
  35: "Government ICT Infrastructure Construction & Management Lead Executive",
  36: "Government ICT Infrastructure Construction & Management Lead Executive",
  37: "Government ICT Infrastructure Construction & Management Lead Executive",
  // Sector 3 - Digital Economy Development Lead Executive
  38: "Digital Economy Development Lead Executive",
  39: "Digital Economy Development Lead Executive",
  40: "Digital Economy Development Lead Executive",
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  let updated = 0;
  for (const [id, wing] of Object.entries(WING_MAP)) {
    const result = await Department.findOneAndUpdate(
      { id: parseInt(id) },
      { $set: { wing } },
      { new: true }
    );
    if (result) {
      console.log(`  ✅ Dept ${id} (${result.name.en}) → wing: "${wing}"`);
      updated++;
    } else {
      console.log(`  ⚠️  Dept ${id} not found`);
    }
  }

  console.log(`\n✅ Updated ${updated} departments with wing field.`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
