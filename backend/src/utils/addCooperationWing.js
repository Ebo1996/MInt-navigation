/**
 * ADDS MISSING COOPERATION & PARTNERSHIP WING DEPARTMENTS
 * Sector 1: Central Administration & Governance Sector
 *
 * Source: Official MINT Organizational Structure & Floor Directory
 * Run: node src/utils/addCooperationWing.js
 *
 * Inserts the 4 missing departments from the Cooperation & Partnership Wing
 * only if they don't already exist (safe to re-run).
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Department = require("../models/Department");

const IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop&q=80";

const cooperationWingDepts = [
  {
    id: 19,
    sectorId: 1,
    wing: "Cooperation & Partnership Wing",
    name: {
      en: "International Relations and Cooperation Desk",
      am: "የዓለም አቀፍ ግንኙነት እና ትብብር ዴስክ",
    },
    description: {
      en: "Manages international relations, bilateral cooperation, and protocol affairs for the ministry.",
      am: "ለሚኒስቴሩ የዓለም አቀፍ ግንኙነት፣ ሁለትዮሽ ትብብር እና ፕሮቶኮል ጉዳዮችን ያስተዳድራል።",
    },
    building: "A",
    floor: 5,
    room: "TBD",
    directions: {
      en: "Location not yet specified. Contact reception for directions.",
      am: "ቦታ ገና አልተወሰነም። ለአቅጣጫ ሪሴፕሽን ያናግሩ።",
    },
    services: {
      en: [
        "International partnership",
        "Bilateral cooperation",
        "Protocol management",
        "Diplomatic correspondence",
      ],
      am: [
        "ዓለም አቀፍ ሽርክና",
        "ሁለትዮሽ ትብብር",
        "ፕሮቶኮል አስተዳደር",
        "ዲፕሎማሲያዊ ደብዳቤ",
      ],
    },
    head: "",
    contact: "+251-111-265718",
    email: "international@mint.gov.et",
    icon: "🌍",
    image: IMAGE,
    walkingTime: "4 min",
    rating: 4.5,
    reviewCount: 50,
  },
  {
    id: 20,
    sectorId: 1,
    wing: "Cooperation & Partnership Wing",
    name: {
      en: "Regional and City Administration Affairs Desk",
      am: "የክልል እና ከተማ አስተዳደር ጉዳዮች ዴስክ",
    },
    description: {
      en: "Coordinates relations with regional governments and city administrations.",
      am: "ከክልል መንግሥታት እና ከተማ አስተዳደሮች ጋር ያለውን ግንኙነት ያስተባብራል።",
    },
    building: "A",
    floor: 5,
    room: "TBD",
    directions: {
      en: "Location not yet specified. Contact reception for directions.",
      am: "ቦታ ገና አልተወሰነም። ለአቅጣጫ ሪሴፕሽን ያናግሩ።",
    },
    services: {
      en: [
        "Regional coordination",
        "City administration liaison",
        "Local government relations",
        "Decentralization support",
      ],
      am: [
        "የክልል ቅንጅት",
        "የከተማ አስተዳደር ትስስር",
        "የአካባቢ መንግሥት ግንኙነት",
        "ዴሴንትራሊዜሽን ድጋፍ",
      ],
    },
    head: "Nurelegn Koku Amare",
    contact: "+251-111-265719",
    email: "regional@mint.gov.et",
    icon: "🗺️",
    image: IMAGE,
    walkingTime: "4 min",
    rating: 4.4,
    reviewCount: 35,
  },
  {
    id: 21,
    sectorId: 1,
    wing: "Cooperation & Partnership Wing",
    name: {
      en: "Private Sector Desk",
      am: "የግል ዘርፍ ዴስክ",
    },
    description: {
      en: "Facilitates engagement and partnership between the ministry and the private sector.",
      am: "በሚኒስቴሩ እና በግል ዘርፍ መካከል ያለውን ትስስር እና ሽርክና ያሳልጣል።",
    },
    building: "A",
    floor: 5,
    room: "TBD",
    directions: {
      en: "Location not yet specified. Contact reception for directions.",
      am: "ቦታ ገና አልተወሰነም። ለአቅጣጫ ሪሴፕሽን ያናግሩ።",
    },
    services: {
      en: [
        "Private sector liaison",
        "Investment facilitation",
        "PPP coordination",
        "Business engagement",
      ],
      am: [
        "የግል ዘርፍ ትስስር",
        "ኢንቨስትመንት አቅርቦት",
        "PPP ቅንጅት",
        "ቢዝነስ ተሳትፎ",
      ],
    },
    head: "Mesfin Shiferaw Woldetsadik",
    contact: "+251-111-265720",
    email: "privatesector@mint.gov.et",
    icon: "🤝",
    image: IMAGE,
    walkingTime: "4 min",
    rating: 4.5,
    reviewCount: 42,
  },
  {
    id: 22,
    sectorId: 1,
    wing: "Cooperation & Partnership Wing",
    name: {
      en: "Innovation Technology Cooperation and Connection Head Executive",
      am: "የፈጠራ ቴክኖሎጂ ትብብር እና ትስስር ዋና ሥራ አስፈጻሚ",
    },
    description: {
      en: "Leads innovation technology cooperation and international connection for the ministry. (Shared Room)",
      am: "ለሚኒስቴሩ የፈጠራ ቴክኖሎጂ ትብብር እና ዓለም አቀፍ ትስስርን ይመራል። (የጋራ ክፍል)",
    },
    building: "A",
    floor: 5,
    room: "501",
    directions: {
      en: "Take elevator to Floor 5. Room 501 on the right (Shared Room).",
      am: "ሊፍት ወደ 5ኛ ፎቅ ይውሰዱ። ክፍል 501 በቀኝ በኩል (የጋራ ክፍል)።",
    },
    services: {
      en: [
        "Technology cooperation",
        "International connection",
        "Partnership development",
        "Innovation diplomacy",
      ],
      am: [
        "የቴክኖሎጂ ትብብር",
        "ዓለም አቀፍ ትስስር",
        "ሽርክና ልማት",
        "የፈጠራ ዲፕሎማሲ",
      ],
    },
    head: "Leul Seyoum Demissie",
    contact: "+251-111-265721",
    email: "cooperation@mint.gov.et",
    icon: "🔗",
    image: IMAGE,
    walkingTime: "4 min",
    rating: 4.6,
    reviewCount: 56,
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    let inserted = 0;
    let skipped = 0;

    for (const dept of cooperationWingDepts) {
      const existing = await Department.findOne({ id: dept.id });
      if (existing) {
        console.log(`⏭️  Dept ${dept.id} already exists: "${existing.name.en}" — skipping`);
        skipped++;
        continue;
      }

      await Department.create(dept);
      console.log(`✅ Inserted Dept ${dept.id}: "${dept.name.en}"`);
      inserted++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Inserted : ${inserted}`);
    console.log(`   ⏭️  Skipped  : ${skipped}`);

    if (inserted > 0) {
      console.log(`\n🎉 Cooperation & Partnership Wing is now complete!`);
      console.log(`   Sector 1 now shows all 4 wings in the UI.`);
    } else {
      console.log(`\nℹ️  All departments already exist — no changes made.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

run();
