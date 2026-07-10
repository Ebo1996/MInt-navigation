const mongoose = require("mongoose");
const Sector = require("../models/Sector");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const sectorsData = [
  {
    id: 1,
    name: { en: "Central Administration & Governance Sector", am: "ማዕከላዊ አስተዳደር እና አስተዳደር ዘርፍ" },
    description: {
      en: "Covers the Minister's Office, Innovation Fund Office, Strategic Operations Wing, and Cooperation & Partnership Wing.",
      am: "የሚኒስትሩ ቢሮ፣ የፈጠራ ፈንድ ቢሮ፣ ስትራቴጂካዊ ሥራ ክፍል እና ትብብር ዘርፍ ይሸፍናል።",
    },
    building: "A",
    floors: [1, 2, 3, 4, 5],
    departmentCount: 22,
    color: "#1E3A5F",
    icon: "🏛️",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop",
    order: 1,
    isActive: true,
  },
  {
    id: 2,
    name: { en: "Innovation & Research Sector", am: "ፈጠራ እና ምርምር ዘርፍ" },
    description: {
      en: "Covers Research & Development Infrastructure, Technology Transfer & Development, and Innovation Ecosystem Development.",
      am: "የምርምር እና ልማት መሠረተ ልማት፣ የቴክኖሎጂ ሽግግር እና ልማት፣ እና የፈጠራ ሥነ-ምህዳር ልማት ይሸፍናል።",
    },
    building: "A",
    floors: [5, 6],
    departmentCount: 9,
    color: "#078930",
    icon: "💡",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=420&fit=crop",
    order: 2,
    isActive: true,
  },
  {
    id: 3,
    name: { en: "ICT & Digital Economy Sector", am: "ኢሲቲ እና ዲጂታል ኢኮኖሚ ዘርፍ" },
    description: {
      en: "Covers E-Government Development, Government ICT Infrastructure Construction & Management, and Digital Economy Development.",
      am: "ኢ-መንግሥት ልማት፣ የመንግሥት ኢሲቲ መሠረተ ልማት ግንባታ እና አስተዳደር፣ እና ዲጂታል ኢኮኖሚ ልማት ይሸፍናል።",
    },
    building: "A/B",
    floors: [0, 1],
    departmentCount: 9,
    color: "#3B82F6",
    icon: "🌐",
    image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&h=420&fit=crop",
    order: 3,
    isActive: true,
  },
];

async function seedSectors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Sector.deleteMany({});
    console.log("🗑️ Cleared all existing sectors");

    await Sector.insertMany(sectorsData);
    console.log(`✅ Seeded ${sectorsData.length} sectors`);

    console.log("\n📊 Sectors seeded:");
    sectorsData.forEach((s) => {
      const name = typeof s.name === "object" ? s.name.en : s.name;
      console.log(`   • ${name} (ID: ${s.id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding sectors:", error);
    process.exit(1);
  }
}

seedSectors();
