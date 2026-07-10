const mongoose = require("mongoose");
const Sector = require("../models/Sector");
require("dotenv").config();

// Copy this from your frontend src/data/sectorsData.js
const sectorsData = [
  {
    id: 1,
    name: "Executive Leadership",
    description:
      "Minister's Office, Deputy Minister, and executive leadership overseeing ministry operations and strategic direction.",
    building: "A",
    floors: [6, 7, 8],
    color: "#1E3A5F",
    icon: "🏛️",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop",
    order: 1,
    isActive: true,
  },
  {
    id: 2,
    name: "Innovation & Technology",
    description:
      "Technology center, innovation fund, startups, technology development, and R&D coordination.",
    building: "A",
    floors: [1, 2, 3, 5, 6],
    color: "#078930",
    icon: "💡",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=420&fit=crop",
    order: 2,
    isActive: true,
  },
  {
    id: 3,
    name: "Finance & Administration",
    description:
      "Treasury, procurement, audit, budget management, and financial administration.",
    building: "A",
    floors: [2, 3, 4],
    color: "#F59E0B",
    icon: "💰",
    image:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=420&fit=crop",
    order: 3,
    isActive: true,
  },
  {
    id: 4,
    name: "Policy & Strategy",
    description:
      "Policy affairs, strategic planning, national research and development coordination.",
    building: "A",
    floors: [3, 4, 5],
    color: "#8B5CF6",
    icon: "📋",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=420&fit=crop",
    order: 4,
    isActive: true,
  },
  {
    id: 5,
    name: "HR & Competency",
    description:
      "Human resources, secretariat, women and social resources, competency management.",
    building: "A",
    floors: [2, 3, 4],
    color: "#EC4899",
    icon: "👥",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=420&fit=crop",
    order: 5,
    isActive: true,
  },
  {
    id: 6,
    name: "Operations & Services",
    description:
      "General services, facility operations, registry, and building management.",
    building: "A/B",
    floors: [3, 1],
    color: "#14B8A6",
    icon: "⚙️",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=420&fit=crop",
    order: 6,
    isActive: true,
  },
  {
    id: 7,
    name: "Digital & ICT",
    description:
      "ICT services, e-government, digital economy, and technology infrastructure.",
    building: "A/B",
    floors: [1, 1, 2],
    color: "#3B82F6",
    icon: "🌐",
    image:
      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&h=420&fit=crop",
    order: 7,
    isActive: true,
  },
  {
    id: 8,
    name: "Support Services",
    description:
      "Data center, conference hall, TV room, and general support facilities.",
    building: "A",
    floors: [0, 1, 8],
    color: "#6B7280",
    icon: "🛠️",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=420&fit=crop",
    order: 8,
    isActive: true,
  },
];

async function migrateSectors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if sectors already exist
    const existingSectors = await Sector.countDocuments();
    if (existingSectors > 0) {
      console.log(
        `⚠️ ${existingSectors} sectors already exist. Skipping migration.`,
      );
      console.log("   To re-run, delete sectors collection first.");
      process.exit(0);
    }

    // Insert sectors
    await Sector.insertMany(sectorsData);
    console.log(`✅ Migrated ${sectorsData.length} sectors to database`);

    console.log("\n📊 SECTORS ADDED:");
    sectorsData.forEach((s) => console.log(`   • ${s.name} (ID: ${s.id})`));

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrateSectors();
