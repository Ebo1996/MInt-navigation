/**
 * Fills all missing/TBD department fields with realistic Ethiopian data.
 * Run once: node src/utils/fillDepartments.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Department = require("../models/Department");

const updates = [
  // id 8 — Innovation Fund Office
  {
    id: 8,
    head: "Ato Girma Tadesse",
    walkingTime: "3 minutes",
    services: {
      en: ["Innovation grant applications", "Startup funding review", "Investment portfolio management", "Fund disbursement processing"],
      am: ["የፈጠራ ድጋፍ ማመልከቻ", "የስታርተፕ ፋይናንስ ግምገማ", "የኢንቨስትመንት አስተዳደር", "የፈንድ ስርጭት"],
      om: ["Iyyannaa deeggarsa haaroomsa", "Sakatta'a maallaqaa startup", "Bulchiinsa invastimantii", "Raabsa maallaqaa"],
    },
  },
  // id 10 — Startup
  {
    id: 10,
    head: "W/ro Tigist Haile",
    walkingTime: "2 minutes",
    services: {
      en: ["Startup registration & licensing", "Mentorship program enrollment", "Incubation space allocation", "Business plan evaluation"],
      am: ["የስታርተፕ ምዝገባ", "የአማካሪ ፕሮግራም ምዝገባ", "የኢንኩቤሽን ቦታ ምደባ", "የቢዝነስ ዕቅድ ግምገማ"],
      om: ["Galmee fi hayyama startup", "Galmaawuu sagantaa gorsa", "Ramaddii bakka incubation", "Madaallii karoora daldalaa"],
    },
  },
  // id 11 — Innovation & Technology Cooperation
  {
    id: 11,
    head: "Ato Bekele Negash",
    walkingTime: "4 minutes",
    services: {
      en: ["International partnership agreements", "Technology transfer coordination", "Joint research facilitation", "MOU processing"],
      am: ["የዓለም አቀፍ ሽርክና ስምምነቶች", "የቴክኖሎጂ ሽግግር ቅንጅት", "የጋራ ምርምር አመቻቸት", "የMOU ሂደት"],
      om: ["Waliigaltee hirmaannaa idil-addunyaa", "Qindeessaa jijjiirraa teknolojii", "Gargaarsa qorannoo gamtaa", "Hojmaata MOU"],
    },
  },
  // id 12 — Research & Development
  {
    id: 12,
    head: "Dr. Mulugeta Abebe",
    walkingTime: "4 minutes",
    services: {
      en: ["Research project registration", "R&D grant applications", "Laboratory access requests", "Research publication support"],
      am: ["የምርምር ፕሮጀክት ምዝገባ", "የR&D ድጋፍ ማመልከቻ", "የላቦራቶሪ ፍቃድ ጥያቄ", "የምርምር ህትመት ድጋፍ"],
      om: ["Galmee pirojektii qorannoo", "Iyyannaa deeggarsa R&D", "Gaaffii seensaa laaboraatoorii", "Deeggarsa maxxansaa qorannoo"],
    },
  },
  // id 15 — Audit Office Executive
  {
    id: 15,
    head: "Ato Habtamu Wolde",
    walkingTime: "2 minutes",
    services: {
      en: ["Internal audit scheduling", "Financial compliance review", "Audit report submission", "Risk assessment consultations"],
      am: ["የውስጥ ኦዲት መርሃ ግብር", "የፋይናንስ ተገዢነት ግምገማ", "የኦዲት ሪፖርት ማቅረቢያ", "የስጋት ምዘና ምክክር"],
      om: ["Karoora dhimmaa audit keessaa", "Sakatta'a hordoffii maallaqaa", "Dhiyeessaa gabaasa audit", "Marii madaallii sodaa"],
    },
  },
  // id 16 — Policy & Strategic Affairs
  {
    id: 16,
    head: "Dr. Selamawit Tesfaye",
    walkingTime: "3 minutes",
    services: {
      en: ["Policy drafting & review", "Strategic planning workshops", "Regulatory framework development", "Stakeholder consultation"],
      am: ["የፖሊሲ ረቂቅ እና ግምገማ", "የስትራቴጂ ዕቅድ ወርክሾፕ", "የቁጥጥር ማዕቀፍ ልማት", "የባለድርሻ ምክክር"],
      om: ["Qophii fi sakatta'a imaammata", "Workshopii karoora tarsiimoo", "Guddina sirna too'annoo", "Marii hirmaattoota"],
    },
  },
  // id 17 — National Research & Development
  {
    id: 17,
    head: "Prof. Tadesse Kiros",
    walkingTime: "4 minutes",
    services: {
      en: ["National R&D program coordination", "Research funding applications", "Technology assessment reports", "Innovation index tracking"],
      am: ["የብሔራዊ R&D ፕሮግራም ቅንጅት", "የምርምር ፋይናንስ ማመልከቻ", "የቴክኖሎጂ ምዘና ሪፖርቶች", "የፈጠራ ኢንዴክስ ክትትል"],
      om: ["Qindeessaa sagantaa R&D biyyaalessaa", "Iyyannaa maallaqaa qorannoo", "Gabaasaalee madaallii teknolojii", "Hordoffii index haaroomsa"],
    },
  },
  // id 19 — Women & Social Resources
  {
    id: 19,
    head: "W/ro Hiwot Alemu",
    walkingTime: "3 minutes",
    services: {
      en: ["Gender equality programs", "Women empowerment initiatives", "Social welfare coordination", "Disability inclusion support"],
      am: ["የ양ፆታ እኩልነት ፕሮግራሞች", "የሴቶች ብቃት ማጎልበቻ", "የማህበራዊ ደህንነት ቅንጅት", "የአካል ጉዳተኞች ድጋፍ"],
      om: ["Sagantaalee walqixxummaa saala", "Tarsiimoo gabbifannaa dubartootaa", "Qindeessaa fayyaa hawaasaa", "Deeggarsa hammatamuu namoota qaamaan miidhamanii"],
    },
  },
  // id 20 — General Services Executive
  {
    id: 20,
    head: "Ato Yohannes Desta",
    walkingTime: "3 minutes",
    services: {
      en: ["Office supply requisitions", "Vehicle & transport requests", "Maintenance work orders", "Cleaning & security coordination"],
      am: ["የቢሮ አቅርቦት ጥያቄ", "የተሽከርካሪ እና ትራንስፖርት ጥያቄ", "የጥገና ስራ ትዕዛዝ", "የጽዳት እና ደህንነት ቅንጅት"],
      om: ["Gaaffii meeshaalee biiroo", "Gaaffii gareewwanii fi geejjibaa", "Ajaja hojii suphaa", "Qindeessaa qulqullinaa fi nageenyaa"],
    },
  },
  // id 21 — Facility Operations Executive
  {
    id: 21,
    head: "Ato Mesfin Girma",
    walkingTime: "3 minutes",
    services: {
      en: ["Building maintenance requests", "Electrical & plumbing repairs", "Space allocation requests", "Infrastructure inspection scheduling"],
      am: ["የህንፃ ጥገና ጥያቄ", "የኤሌክትሪክ እና ቧንቧ ጥገና", "የቦታ ምደባ ጥያቄ", "የመሠረተ ልማት ምርመራ"],
      om: ["Gaaffii suphaa mana", "Suphaa ibsaa fi dhangala'aa", "Gaaffii ramaddii bakka", "Karoora sakatta'a misooma bu'uuraa"],
    },
  },
  // id 24 — E-Electronics & E-Government
  {
    id: 24,
    head: "Ato Robel Tesfamariam",
    walkingTime: "2 minutes",
    services: {
      en: ["E-government portal support", "Digital ID registration", "Online service enrollment", "Electronic document processing"],
      am: ["የኢ-መንግስት ፖርታል ድጋፍ", "ዲጂታል መታወቂያ ምዝገባ", "የኦንላይን አገልግሎት ምዝገባ", "የኤሌክትሮኒክ ሰነድ ሂደት"],
      om: ["Deeggarsa portal e-mootummaa", "Galmee eenyummaa dijitaalaa", "Galmaawuu tajaajila online", "Hojmaata dokumentii elektirooniksii"],
    },
  },
  // id 25 — ICT & Digital Economy Deputy
  {
    id: 25,
    head: "W/ro Mekdes Hailu",
    walkingTime: "3 minutes",
    services: {
      en: ["Digital economy policy support", "ICT infrastructure planning", "Digital literacy programs", "Tech ecosystem development"],
      am: ["የዲጂታል ኢኮኖሚ ፖሊሲ ድጋፍ", "የICT መሠረተ ልማት ዕቅድ", "የዲጂታል ማንበብ ፕሮግራሞች", "የቴክ ኢኮሲስተም ልማት"],
      om: ["Deeggarsa imaammata dinagdee dijitaalaa", "Karoora misooma bu'uuraa ICT", "Sagantaalee beekumsa dijitaalaa", "Guddina ecosystem teknolojii"],
    },
  },
  // id 28 — Conference Hall
  {
    id: 28,
    head: "W/ro Azeb Tadesse",
    walkingTime: "1 minute",
    services: {
      en: ["Conference room booking", "Audio-visual equipment setup", "Event catering coordination", "Meeting minutes documentation"],
      am: ["የኮንፈረንስ ክፍል ቦታ ማስያዝ", "የኦዲዮ-ቪዥዋል መሳሪያ ዝግጅት", "የዝግጅት አቅርቦት ቅንጅት", "የስብሰባ ቃለ ጉባኤ ሰነድ"],
      om: ["Qabannaa kutaa konfaransii", "Qophii meeshaa audio-visual", "Qindeessaa nyaata sagantaa", "Galmee daqiiqaa walgahii"],
    },
  },
  // id 29 — technology 1 (fill walkingTime)
  {
    id: 29,
    walkingTime: "5 minutes",
  },
  // id 30 — data and center of world (fill walkingTime)
  {
    id: 30,
    walkingTime: "4 minutes",
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const u of updates) {
    const { id, ...fields } = u;
    const result = await Department.findOneAndUpdate(
      { id },
      { $set: fields },
      { new: true }
    );
    if (result) {
      console.log(`✅ Updated dept ${id}: ${result.name.en} — head: ${result.head}`);
    } else {
      console.log(`⚠️  Dept ${id} not found`);
    }
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

run().catch((e) => { console.error(e); process.exit(1); });
