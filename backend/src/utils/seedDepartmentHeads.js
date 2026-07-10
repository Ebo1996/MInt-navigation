/**
 * seedDepartmentHeads.js
 *
 * Creates ONE department_head account per DEPARTMENT (wing) per sector.
 * Based on the official PDF structure:
 *
 * Sector 1 – 4 departments:
 *   sector1dept1 → Minister's Office             (10 desks: ids 1-10)
 *   sector1dept2 → Innovation Fund Office         (1 desk:  id 11)
 *   sector1dept3 → Strategic Operations Wing      (7 desks: ids 12-18)
 *   sector1dept4 → Cooperation & Partnership Wing (4 desks: ids 19-22)
 *
 * Sector 2 – 3 departments:
 *   sector2dept1 → Research & Development Infrastructure Lead Executive (3 desks: ids 23-25)
 *   sector2dept2 → Technology Transfer & Development Lead Executive     (3 desks: ids 26-28)
 *   sector2dept3 → Innovation Ecosystem Development Lead Executive      (3 desks: ids 29-31)
 *
 * Sector 3 – 3 departments:
 *   sector3dept1 → E-Government Development Lead Executive                          (3 desks: ids 32-34)
 *   sector3dept2 → Government ICT Infrastructure Construction & Management Lead Exec (3 desks: ids 35-37)
 *   sector3dept3 → Digital Economy Development Lead Executive                        (3 desks: ids 38-40)
 *
 * Password for ALL: department123
 *
 * Run: node src/utils/seedDepartmentHeads.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const Admin    = require("../models/Admin");

// ── Exact department (wing) definitions from the official PDF ──────────────
const DEPARTMENTS = [
  // ── SECTOR 1 ──────────────────────────────────────────────────────────────
  {
    username:   "sector1dept1",
    sectorId:   1,
    wing:       "Minister's Office",
    name:       "Minister's Office Department Head",
    email:      "s1d1@mint.gov.et",
  },
  {
    username:   "sector1dept2",
    sectorId:   1,
    wing:       "Innovation Fund Office",
    name:       "Innovation Fund Office Department Head",
    email:      "s1d2@mint.gov.et",
  },
  {
    username:   "sector1dept3",
    sectorId:   1,
    wing:       "Strategic Operations Wing",
    name:       "Strategic Operations Wing Department Head",
    email:      "s1d3@mint.gov.et",
  },
  {
    username:   "sector1dept4",
    sectorId:   1,
    wing:       "Cooperation & Partnership Wing",
    name:       "Cooperation & Partnership Wing Department Head",
    email:      "s1d4@mint.gov.et",
  },

  // ── SECTOR 2 ──────────────────────────────────────────────────────────────
  {
    username:   "sector2dept1",
    sectorId:   2,
    wing:       "Research & Development Infrastructure Lead Executive",
    name:       "R&D Infrastructure Department Head",
    email:      "s2d1@mint.gov.et",
  },
  {
    username:   "sector2dept2",
    sectorId:   2,
    wing:       "Technology Transfer & Development Lead Executive",
    name:       "Technology Transfer Department Head",
    email:      "s2d2@mint.gov.et",
  },
  {
    username:   "sector2dept3",
    sectorId:   2,
    wing:       "Innovation Ecosystem Development Lead Executive",
    name:       "Innovation Ecosystem Department Head",
    email:      "s2d3@mint.gov.et",
  },

  // ── SECTOR 3 ──────────────────────────────────────────────────────────────
  {
    username:   "sector3dept1",
    sectorId:   3,
    wing:       "E-Government Development Lead Executive",
    name:       "E-Government Department Head",
    email:      "s3d1@mint.gov.et",
  },
  {
    username:   "sector3dept2",
    sectorId:   3,
    wing:       "Government ICT Infrastructure Construction & Management Lead Executive",
    name:       "ICT Infrastructure Department Head",
    email:      "s3d2@mint.gov.et",
  },
  {
    username:   "sector3dept3",
    sectorId:   3,
    wing:       "Digital Economy Development Lead Executive",
    name:       "Digital Economy Department Head",
    email:      "s3d3@mint.gov.et",
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Remove ALL existing department_head accounts (clean re-seed)
  const deleted = await Admin.deleteMany({ role: "department_head" });
  console.log(`🗑️  Removed ${deleted.deletedCount} old department_head accounts\n`);

  const salt     = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("department123", salt);

  let created = 0;
  for (const dept of DEPARTMENTS) {
    await Admin.create({
      username:   dept.username,
      password,
      email:      dept.email,
      role:       "department_head",
      sectorId:   dept.sectorId,
      wing:       dept.wing,
      name:       dept.name,
      avatar:     `https://ui-avatars.com/api/?background=086976&color=fff&name=${encodeURIComponent(dept.name)}`,
    });
    console.log(`✅ Created: ${dept.username}  →  Sector ${dept.sectorId}  |  ${dept.wing}`);
    created++;
  }

  console.log(`\n✅ Done — ${created} department head accounts created.`);
  console.log(`🔑 Password for all: department123\n`);
  console.log("Accounts summary:");
  console.log("  sector1dept1 / department123  →  Minister's Office");
  console.log("  sector1dept2 / department123  →  Innovation Fund Office");
  console.log("  sector1dept3 / department123  →  Strategic Operations Wing");
  console.log("  sector1dept4 / department123  →  Cooperation & Partnership Wing");
  console.log("  sector2dept1 / department123  →  R&D Infrastructure Lead Executive");
  console.log("  sector2dept2 / department123  →  Technology Transfer Lead Executive");
  console.log("  sector2dept3 / department123  →  Innovation Ecosystem Lead Executive");
  console.log("  sector3dept1 / department123  →  E-Government Development Lead Executive");
  console.log("  sector3dept2 / department123  →  ICT Infrastructure Lead Executive");
  console.log("  sector3dept3 / department123  →  Digital Economy Development Lead Executive");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
