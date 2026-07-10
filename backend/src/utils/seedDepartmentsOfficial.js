/**
 * OFFICIAL MINT DEPARTMENT SEED
 * Source: Official MINT Organizational Structure & Floor Directory
 * Run: node src/utils/seedDepartmentsOfficial.js
 *
 * Clears all existing departments and inserts official data
 * matching the 3 sectors in the database.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Department = require("../models/Department");

const IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop&q=80";

const departments = [

  // =========================================================
  // SECTOR 1: CENTRAL ADMINISTRATION & GOVERNANCE SECTOR
  // =========================================================

  // ── Minister's Office ──────────────────────────────────────
  {
    id: 1, sectorId: 1,
    name: { en: "Minister's Secretariat Office", am: "የሚኒስትሩ ሴክሬታሪያት ቢሮ" },
    description: { en: "Minister's office administration, scheduling, and correspondence.", am: "የሚኒስትሩ ቢሮ አስተዳደር፣ ቀን መቁጠሪያ እና ደብዳቤ።" },
    building: "A", floor: 2, room: "203",
    directions: { en: "Take elevator to Floor 2. Room 203 at the end of the corridor.", am: "ሊፍት ወደ 2ኛ ፎቅ ይውሰዱ። ክፍል 203 በኮሪደሩ መጨረሻ።" },
    services: { en: ["Meeting coordination", "Document management", "Schedule management", "Ministerial correspondence"], am: ["የስብሰባ ቅንጅት", "የሰነድ አስተዳደር", "የቀን ቆጠሩ አስተዳደር"] },
    head: "", contact: "+251-111-265700", email: "secretariat@mint.gov.et",
    icon: "🏛️", image: IMAGE, walkingTime: "2 min", rating: 4.8, reviewCount: 120,
  },
  {
    id: 2, sectorId: 1,
    name: { en: "Legal Affairs Executive", am: "የሕግ ጉዳዮች ሥራ አስፈጻሚ" },
    description: { en: "Legal counsel and legal matters for the ministry.", am: "ለሚኒስቴሩ የሕግ ምክር እና የሕግ ጉዳዮች።" },
    building: "A", floor: 2, room: "203.3",
    directions: { en: "Take elevator to Floor 2. Room 203.3 inside the Minister's wing.", am: "ሊፍት ወደ 2ኛ ፎቅ ይውሰዱ። ክፍል 203.3 በሚኒስትሩ ክፍለ ዘርፍ ውስጥ።" },
    services: { en: ["Legal counsel", "Contract review", "Regulatory compliance", "Policy review"], am: ["የሕግ ምክር", "የኮንትራት ግምገማ", "ደንብ ተገዢነት"] },
    head: "", contact: "+251-111-265701", email: "legal@mint.gov.et",
    icon: "⚖️", image: IMAGE, walkingTime: "2 min", rating: 4.6, reviewCount: 67,
  },
  {
    id: 3, sectorId: 1,
    name: { en: "Public Relations & Communication Executive", am: "የሕዝብ ግንኙነት እና ኮሙኒኬሽን ሥራ አስፈጻሚ" },
    description: { en: "Public relations, media, and information dissemination.", am: "ሕዝብ ግንኙነት፣ ሚዲያ እና መረጃ ማሰራጨት።" },
    building: "A", floor: 2, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ለአቅጣጫ ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Public inquiries", "Media relations", "Press releases", "Information services"], am: ["ሕዝብ ጥያቄ", "የሚዲያ ግንኙነት", "ጋዜጣዊ መግለጫ"] },
    head: "", contact: "+251-111-265702", email: "pr@mint.gov.et",
    icon: "📢", image: IMAGE, walkingTime: "2 min", rating: 4.5, reviewCount: 55,
  },
  {
    id: 4, sectorId: 1,
    name: { en: "Internal Audit Executive", am: "የውስጥ ኦዲት ሥራ አስፈጻሚ" },
    description: { en: "Internal audit and compliance monitoring.", am: "የውስጥ ኦዲት እና ተገዢነት ክትትል።" },
    building: "A", floor: 2, room: "201",
    directions: { en: "Take elevator to Floor 2. Room 201 is first door on the left.", am: "ሊፍት ወደ 2ኛ ፎቅ ይውሰዱ። ክፍል 201 በግራ በኩል የመጀመሪያው ደ ነው።" },
    services: { en: ["Internal audit", "Compliance review", "Risk assessment", "Financial audit"], am: ["የውስጥ ኦዲት", "ተገዢነት ግምገማ", "ስጋት ምዘና"] },
    head: "Mekonnen Moges Ashenafi / Ashagre Alemu Worku",
    contact: "+251-111-265703", email: "audit@mint.gov.et",
    icon: "🔍", image: IMAGE, walkingTime: "2 min", rating: 4.5, reviewCount: 67,
  },
  {
    id: 5, sectorId: 1,
    name: { en: "Ethics & Anti-Corruption Executive", am: "የሥነ-ምግባር እና ፀረ-ሙስና ሥራ አስፈጻሚ" },
    description: { en: "Ethics oversight and anti-corruption affairs.", am: "የሥነ-ምግባር ክትትል እና ፀረ-ሙስና ጉዳዮች።" },
    building: "A", floor: 2, room: "203.1",
    directions: { en: "Take elevator to Floor 2. Room 203.1 inside the Minister's wing.", am: "ሊፍት ወደ 2ኛ ፎቅ ይውሰዱ። ክፍል 203.1 በሚኒስትሩ ክፍለ ዘርፍ ውስጥ።" },
    services: { en: ["Ethics guidance", "Anti-corruption compliance", "Reporting channels"], am: ["የሥነ-ምግባር መመሪያ", "ፀረ-ሙስና ተገዢነት", "የሪፖርቲንግ ቻናሎች"] },
    head: "Mekonnen Moges Ashenafi",
    contact: "+251-111-265704", email: "ethics@mint.gov.et",
    icon: "🛡️", image: IMAGE, walkingTime: "2 min", rating: 4.6, reviewCount: 45,
  },
  {
    id: 6, sectorId: 1,
    name: { en: "Social Inclusion & Gender Affairs Executive", am: "የማህበራዊ ተካትነት እና ሥርዓተ-ጾታ ጉዳዮች ሥራ አስፈጻሚ" },
    description: { en: "Women's empowerment, social inclusion, and gender equality.", am: "የሴቶች ብቃት ማጎልበቻ፣ ማህበራዊ ተካትነት እና ሥርዓተ-ጾታ እኩልነት።" },
    building: "A", floor: 4, room: "403",
    directions: { en: "Take elevator to Floor 4. Room 403 on the right side.", am: "ሊፍት ወደ 4ኛ ፎቅ ይውሰዱ። ክፍል 403 በቀኝ በኩል።" },
    services: { en: ["Women's programs", "Social support", "Gender equality", "Capacity building"], am: ["የሴቶች ፕሮግራሞች", "ማህበራዊ ድጋፍ", "ሥርዓተ-ጾታ እኩልነት"] },
    head: "Elsabeth G/silassie Melka",
    contact: "+251-111-265705", email: "gender@mint.gov.et",
    icon: "👩", image: IMAGE, walkingTime: "3 min", rating: 4.4, reviewCount: 52,
  },
  {
    id: 7, sectorId: 1,
    name: { en: "Institutional Reform Executive", am: "የተቋም ማሻሻያ ሥራ አስፈጻሚ" },
    description: { en: "Institutional reform and organizational development.", am: "የተቋም ማሻሻያ እና ድርጅታዊ ልማት።" },
    building: "A", floor: 2, room: "203.4",
    directions: { en: "Take elevator to Floor 2. Room 203.4 inside the Minister's wing.", am: "ሊፍት ወደ 2ኛ ፎቅ ይውሰዱ። ክፍል 203.4 በሚኒስትሩ ክፍለ ዘርፍ ውስጥ።" },
    services: { en: ["Reform planning", "Organizational development", "Change management"], am: ["የማሻሻያ ዕቅድ", "ድርጅታዊ ልማት", "የለውጥ አስተዳደር"] },
    head: "Siber Andualem Kebede",
    contact: "+251-111-265706", email: "reform@mint.gov.et",
    icon: "🔄", image: IMAGE, walkingTime: "2 min", rating: 4.5, reviewCount: 38,
  },
  {
    id: 8, sectorId: 1,
    name: { en: "Records & Archives Management (Registry Office)", am: "የሰነድ እና መዝገብ አስተዳደር (ሬጂስትሪ ቢሮ)" },
    description: { en: "Document registry, records management, and archives.", am: "የሰነድ ምዝገባ፣ የሰነድ አስተዳደር እና መዝገብ ቤት።" },
    building: "B", floor: 1, room: "B1",
    directions: { en: "Enter Building B. Registry Office is on the 1st Floor.", am: "ወደ ህንፃ B ይግቡ። ሬጂስትሪ ቢሮ በ1ኛ ፎቅ ላይ ነው።" },
    services: { en: ["Document registration", "Record keeping", "File management", "Document retrieval"], am: ["የሰነድ ምዝገባ", "የሰነድ አያያዝ", "የፋይል አስተዳደር"] },
    head: "Yenenesh Alemayhu Desta",
    contact: "+251-111-265707", email: "registry@mint.gov.et",
    icon: "📁", image: IMAGE, walkingTime: "5 min", rating: 4.5, reviewCount: 78,
  },
  {
    id: 9, sectorId: 1,
    name: { en: "Chief Executive Officer", am: "ዋና ሥራ አስፈጻሚ ሥራ አስኪያጅ" },
    description: { en: "Chief executive overseeing daily ministry operations.", am: "የዕለት ተዕለት የሚኒስቴር ሥራ የሚቆጣጠር ዋና ሥራ አስፈጻሚ።" },
    building: "A", floor: 4, room: "401",
    directions: { en: "Take elevator to Floor 4. Room 401 at the end of the corridor.", am: "ሊፍት ወደ 4ኛ ፎቅ ይውሰዱ። ክፍል 401 በኮሪደሩ መጨረሻ።" },
    services: { en: ["Operational management", "Executive coordination", "Strategic execution"], am: ["ሥራ አስፈጻሚ አስተዳደር", "ሥራ አስፈጻሚ ቅንጅት", "ስትራቴጂካዊ ትግበራ"] },
    head: "Solomon Aynimar Kahsay",
    contact: "+251-111-265708", email: "ceo@mint.gov.et",
    icon: "👔", image: IMAGE, walkingTime: "3 min", rating: 4.7, reviewCount: 67,
  },
  {
    id: 10, sectorId: 1,
    name: { en: "Advisor", am: "አማካሪ" },
    description: { en: "Senior ministerial advisor.", am: "ከፍተኛ የሚኒስቴር አማካሪ።" },
    building: "A", floor: 2, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Advisory services", "Policy guidance", "Strategic advice"], am: ["የምክር አገልግሎት", "የፖሊሲ መምሪያ", "ስትራቴጂካዊ ምክር"] },
    head: "Beker Seid Ula",
    contact: "+251-111-265709", email: "advisor@mint.gov.et",
    icon: "💼", image: IMAGE, walkingTime: "2 min", rating: 4.5, reviewCount: 30,
  },

  // ── Innovation Fund Office ─────────────────────────────────
  {
    id: 11, sectorId: 1,
    name: { en: "Innovation Fund Office Head", am: "የፈጠራ ፈንድ ቢሮ ሃላፊ" },
    description: { en: "Funding and grants for innovation projects and startups.", am: "ለፈጠራ ፕሮጀክቶች እና ስታርተፖች ፈንድ እና ድጋፍ።" },
    building: "A", floor: 2, room: "202",
    directions: { en: "Take elevator to Floor 2, turn left. Room 202 is second door.", am: "ሊፍት ወደ 2ኛ ፎቅ ይውሰዱ፣ ወደ ግራ ይታጠፉ። ክፍል 202 ሁለተኛው ደ ነው።" },
    services: { en: ["Grant applications", "Innovation funding", "Startup investment", "Project evaluation"], am: ["የድጋፍ ማመልከቻ", "የፈጠራ ፈንዲንግ", "የስታርተፕ ኢንቨስትመንት"] },
    head: "Adanech Tujo Urigo",
    contact: "+251-111-265710", email: "innovationfund@mint.gov.et",
    icon: "💡", image: IMAGE, walkingTime: "2 min", rating: 4.6, reviewCount: 98,
  },

  // ── Strategic Operations Wing ──────────────────────────────
  {
    id: 12, sectorId: 1,
    name: { en: "Strategic Affairs Executive", am: "የስትራቴጂ ጉዳዮች ሥራ አስፈጻሚ" },
    description: { en: "Strategic planning and coordination of ministry initiatives. (Shared Room)", am: "ስትራቴጂካዊ ዕቅድ እና የሚኒስቴር ተነሳሽነት ቅንጅት። (የጋራ ክፍል)" },
    building: "A", floor: 3, room: "302",
    directions: { en: "Take elevator to Floor 3. Room 302 on the right.", am: "ሊፍት ወደ 3ኛ ፎቅ ይውሰዱ። ክፍል 302 በቀኝ በኩል።" },
    services: { en: ["Strategic planning", "Policy coordination", "Performance monitoring"], am: ["ስትራቴጂካዊ ዕቅድ", "የፖሊሲ ቅንጅት", "የአፈጻጸም ክትትል"] },
    head: "Azmach Desalegn Weldeyohannise",
    contact: "+251-111-265711", email: "strategic@mint.gov.et",
    icon: "📊", image: IMAGE, walkingTime: "3 min", rating: 4.6, reviewCount: 45,
  },
  {
    id: 13, sectorId: 1,
    name: { en: "Finance & Procurement Executive", am: "የፋይናንስ እና ግዥ ሥራ አስፈጻሚ" },
    description: { en: "Budget management, financial operations, and procurement.", am: "በጀት አስተዳደር፣ ፋይናንሺያል ሥራዎች እና ግዥ።" },
    building: "A", floor: 3, room: "301",
    directions: { en: "Take elevator to Floor 3, turn left. Room 301 is first door.", am: "ሊፍት ወደ 3ኛ ፎቅ ይውሰዱ፣ ወደ ግራ ይታጠፉ። ክፍል 301 የመጀመሪያው ደ ነው።" },
    services: { en: ["Budget planning", "Financial reporting", "Payment processing", "Tender management"], am: ["በጀት ዕቅድ", "የፋይናንስ ሪፖርት", "ክፍያ ሂደት"] },
    head: "Etalemahu Gezahegn",
    contact: "+251-111-265712", email: "finance@mint.gov.et",
    icon: "💰", image: IMAGE, walkingTime: "3 min", rating: 4.4, reviewCount: 156,
  },
  {
    id: 14, sectorId: 1,
    name: { en: "Human Resource Administration Executive", am: "የሰው ሃብት አስተዳደር ሥራ አስፈጻሚ" },
    description: { en: "Human resource management and administration. (Shared Room)", am: "የሰው ሃብት አስተዳደር። (የጋራ ክፍል)" },
    building: "A", floor: 3, room: "302",
    directions: { en: "Take elevator to Floor 3. Room 302 shared with Strategic Affairs.", am: "ሊፍት ወደ 3ኛ ፎቅ ይውሰዱ። ክፍል 302 ከስትራቴጂ ጉዳዮች ጋር የጋራ ነው።" },
    services: { en: ["Recruitment", "Training programs", "Performance evaluation", "Employee relations"], am: ["ምልመላ", "ሥልጠና ፕሮግራሞች", "አፈጻጸም ግምገማ"] },
    head: "Dagne Assefa Lemma",
    contact: "+251-111-265713", email: "hr@mint.gov.et",
    icon: "👥", image: IMAGE, walkingTime: "3 min", rating: 4.5, reviewCount: 123,
  },
  {
    id: 15, sectorId: 1,
    name: { en: "General Services Executive", am: "የጠቅላላ አገልግሎቶች ሥራ አስፈጻሚ" },
    description: { en: "General services and facility management.", am: "ጠቅላላ አገልግሎቶች እና የህንፃ አስተዳደር።" },
    building: "A", floor: 3, room: "303",
    directions: { en: "Take elevator to Floor 3. Room 303 at the end.", am: "ሊፍት ወደ 3ኛ ፎቅ ይውሰዱ። ክፍል 303 በመጨረሻ።" },
    services: { en: ["Facility management", "Maintenance", "Cleaning services", "Security coordination"], am: ["የህንፃ አስተዳደር", "ጥገና", "ጽዳት አገልግሎት"] },
    head: "Getachew Seid Abegaz",
    contact: "+251-111-265714", email: "services@mint.gov.et",
    icon: "⚙️", image: IMAGE, walkingTime: "3 min", rating: 4.4, reviewCount: 89,
  },
  {
    id: 16, sectorId: 1,
    name: { en: "ICT Executive", am: "የICT ሥራ አስፈጻሚ" },
    description: { en: "ICT services and digital infrastructure management.", am: "የICT አገልግሎቶች እና ዲጂታል መሠረተ ልማት አስተዳደር።" },
    building: "A", floor: 1, room: "102/103",
    directions: { en: "Take elevator to Floor 1. Room 102/103 on the right.", am: "ሊፍት ወደ 1ኛ ፎቅ ይውሰዱ። ክፍል 102/103 በቀኝ በኩል።" },
    services: { en: ["Network services", "IT support", "System development", "Digital infrastructure"], am: ["የኔትወርክ አገልግሎቶች", "የIT ድጋፍ", "ሥርዓት ልማት"] },
    head: "Denber Getahun Fatul",
    contact: "+251-111-265715", email: "ict@mint.gov.et",
    icon: "💻", image: IMAGE, walkingTime: "1 min", rating: 4.7, reviewCount: 134,
  },
  {
    id: 17, sectorId: 1,
    name: { en: "Procurement Team Leader", am: "የግዥ ቡድን መሪ" },
    description: { en: "Government procurement and contract management.", am: "የመንግሥት ግዥ እና ኮንትራት አስተዳደር።" },
    building: "A", floor: 4, room: "402",
    directions: { en: "Take elevator to Floor 4, turn right. Room 402 is second door.", am: "ሊፍት ወደ 4ኛ ፎቅ ይውሰዱ፣ ወደ ቀኝ ይታጠፉ። ክፍል 402 ሁለተኛው ደ ነው።" },
    services: { en: ["Tender management", "Vendor registration", "Contract awards", "Supplier evaluation"], am: ["የጨረታ አስተዳደር", "የአቅራቢ ምዝገባ", "የኮንትራት ሽልማት"] },
    head: "Mitiku Girma Darge",
    contact: "+251-111-265716", email: "procurement@mint.gov.et",
    icon: "📋", image: IMAGE, walkingTime: "3 min", rating: 4.3, reviewCount: 98,
  },
  {
    id: 18, sectorId: 1,
    name: { en: "Property Management Team Leader", am: "የንብረት አስተዳደር ቡድን መሪ" },
    description: { en: "Property and asset management.", am: "የንብረት አስተዳደር።" },
    building: "A", floor: 3, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Asset management", "Property records", "Space allocation"], am: ["የሃብት አስተዳደር", "የንብረት መዝገብ", "የቦታ ምደባ"] },
    head: "Amelework Gizachew Zerihun",
    contact: "+251-111-265717", email: "property@mint.gov.et",
    icon: "🏢", image: IMAGE, walkingTime: "3 min", rating: 4.3, reviewCount: 40,
  },

  // ── Cooperation & Partnership Wing ────────────────────────
  {
    id: 19, sectorId: 1,
    name: { en: "International Relations & Cooperation Desk", am: "የዓለም አቀፍ ግንኙነት እና ትብብር ዴስክ" },
    description: { en: "International relations and cooperation management.", am: "የዓለም አቀፍ ግንኙነት እና ትብብር አስተዳደር።" },
    building: "A", floor: 5, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["International partnership", "Bilateral cooperation", "Protocol management"], am: ["ዓለም አቀፍ ሽርክና", "ሁለት ወገን ትብብር", "ፕሮቶኮል አስተዳደር"] },
    head: "",
    contact: "+251-111-265718", email: "international@mint.gov.et",
    icon: "🌍", image: IMAGE, walkingTime: "4 min", rating: 4.5, reviewCount: 50,
  },
  {
    id: 20, sectorId: 1,
    name: { en: "Regional & City Administration Affairs Desk", am: "የክልል እና ከተማ አስተዳደር ጉዳዮች ዴስክ" },
    description: { en: "Regional and city administration coordination.", am: "የክልል እና ከተማ አስተዳደር ቅንጅት።" },
    building: "A", floor: 5, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Regional coordination", "City administration liaison", "Local government relations"], am: ["የክልል ቅንጅት", "የከተማ አስተዳደር ትስስር", "የአካባቢ መንግሥት ግንኙነት"] },
    head: "Nurelegn Koku Amare",
    contact: "+251-111-265719", email: "regional@mint.gov.et",
    icon: "🗺️", image: IMAGE, walkingTime: "4 min", rating: 4.4, reviewCount: 35,
  },
  {
    id: 21, sectorId: 1,
    name: { en: "Private Sector Desk", am: "የግል ዘርፍ ዴስክ" },
    description: { en: "Private sector engagement and partnership.", am: "የግል ዘርፍ ተሳትፎ እና ሽርክና።" },
    building: "A", floor: 5, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Private sector liaison", "Investment facilitation", "PPP coordination"], am: ["የግል ዘርፍ ትስስር", "ኢንቨስትመንት አቅርቦት", "PPP ቅንጅት"] },
    head: "Mesfin Shiferaw Woldetsadik",
    contact: "+251-111-265720", email: "privatesector@mint.gov.et",
    icon: "🤝", image: IMAGE, walkingTime: "4 min", rating: 4.5, reviewCount: 42,
  },
  {
    id: 22, sectorId: 1,
    name: { en: "Innovation Technology Cooperation & Connection Head Executive", am: "የፈጠራ ቴክኖሎጂ ትብብር እና ትስስር ዋና ሥራ አስፈጻሚ" },
    description: { en: "Innovation technology cooperation and connection. (Shared Room)", am: "የፈጠራ ቴክኖሎጂ ትብብር እና ትስስር። (የጋራ ክፍል)" },
    building: "A", floor: 5, room: "501",
    directions: { en: "Take elevator to Floor 5. Room 501 on the right.", am: "ሊፍት ወደ 5ኛ ፎቅ ይውሰዱ። ክፍል 501 በቀኝ በኩል።" },
    services: { en: ["Technology cooperation", "International connection", "Partnership development"], am: ["የቴክኖሎጂ ትብብር", "ዓለም አቀፍ ትስስር", "ሽርክና ልማት"] },
    head: "Leul Seyoum Demissie",
    contact: "+251-111-265721", email: "cooperation@mint.gov.et",
    icon: "🔗", image: IMAGE, walkingTime: "4 min", rating: 4.6, reviewCount: 56,
  },

  // =========================================================
  // SECTOR 2: INNOVATION & RESEARCH SECTOR
  // =========================================================

  // ── R&D Infrastructure Lead Executive ─────────────────────
  {
    id: 23, sectorId: 2,
    name: { en: "Research & Development Desk", am: "የምርምር እና ልማት ዴስክ" },
    description: { en: "National research and development coordination.", am: "ብሔራዊ የምርምር እና ልማት ቅንጅት።" },
    building: "A", floor: 5, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Research coordination", "Grant management", "Research evaluation"], am: ["የምርምር ቅንጅት", "ድጋፍ አስተዳደር", "የምርምር ግምገማ"] },
    head: "",
    contact: "+251-111-265730", email: "rd@mint.gov.et",
    icon: "🔬", image: IMAGE, walkingTime: "4 min", rating: 4.5, reviewCount: 55,
  },
  {
    id: 24, sectorId: 2,
    name: { en: "R&D Infrastructure Building Desk", am: "የምርምር እና ልማት መሠረተ ልማት ዴስክ" },
    description: { en: "Research and development infrastructure building.", am: "የምርምር እና ልማት መሠረተ ልማት ግንባታ።" },
    building: "A", floor: 5, room: "502",
    directions: { en: "Take elevator to Floor 5. Room 502 on the right.", am: "ሊፍት ወደ 5ኛ ፎቅ ይውሰዱ። ክፍል 502 በቀኝ በኩል።" },
    services: { en: ["Infrastructure development", "R&D facility management", "Lab coordination"], am: ["መሠረተ ልማት ልማት", "የR&D ህንፃ አስተዳደር", "የላቦ ቅንጅት"] },
    head: "Wasihun Tamirat Alemu",
    contact: "+251-111-265731", email: "rdinfra@mint.gov.et",
    icon: "🏗️", image: IMAGE, walkingTime: "4 min", rating: 4.5, reviewCount: 48,
  },
  {
    id: 25, sectorId: 2,
    name: { en: "R&D Culture Building Desk", am: "የምርምር እና ልማት ባህል ግንባታ ዴስክ" },
    description: { en: "Building research and development culture across the ministry.", am: "በሚኒስቴሩ ውስጥ የምርምር እና ልማት ባህል ግንባታ።" },
    building: "A", floor: 5, room: "502",
    directions: { en: "Take elevator to Floor 5. Room 502 (shared with R&D Infrastructure).", am: "ሊፍት ወደ 5ኛ ፎቅ ይውሰዱ። ክፍል 502 (ከR&D መሠረተ ልማት ጋር የጋራ)።" },
    services: { en: ["Culture development", "R&D awareness", "Knowledge sharing"], am: ["ባህል ልማት", "የR&D ግንዛቤ", "እውቀት ማካፈያ"] },
    head: "Kassahun Elias Dergaso",
    contact: "+251-111-265732", email: "rdculture@mint.gov.et",
    icon: "📚", image: IMAGE, walkingTime: "4 min", rating: 4.5, reviewCount: 40,
  },

  // ── Technology Transfer & Development Lead Executive ────────
  {
    id: 26, sectorId: 2,
    name: { en: "Innovation & Technology Administration Desk", am: "የፈጠራ እና ቴክኖሎጂ አስተዳደር ዴስክ" },
    description: { en: "Innovation and technology administration.", am: "የፈጠራ እና ቴክኖሎጂ አስተዳደር።" },
    building: "A", floor: 5, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Technology administration", "Innovation management", "Program coordination"], am: ["የቴክኖሎጂ አስተዳደር", "የፈጠራ አስተዳደር", "ፕሮግራም ቅንጅት"] },
    head: "",
    contact: "+251-111-265733", email: "innotechadmin@mint.gov.et",
    icon: "⚙️", image: IMAGE, walkingTime: "4 min", rating: 4.5, reviewCount: 45,
  },
  {
    id: 27, sectorId: 2,
    name: { en: "Technology Transfer Desk", am: "የቴክኖሎጂ ሽግግር ዴስክ" },
    description: { en: "Technology transfer to industry and commercialization.", am: "ቴክኖሎጂ ወደ ኢንዱስትሪ ማስተላለፍ እና ንግዳዊ ሥራ።" },
    building: "A", floor: 5, room: "501",
    directions: { en: "Take elevator to Floor 5. Room 501.", am: "ሊፍት ወደ 5ኛ ፎቅ ይውሰዱ። ክፍል 501።" },
    services: { en: ["Tech transfer", "Industry partnership", "Technology commercialization"], am: ["ቴክ ሽግግር", "የኢንዱስትሪ ሽርክና", "የቴክኖሎጂ ንግዳዊ ሥራ"] },
    head: "",
    contact: "+251-111-265734", email: "techtransfer@mint.gov.et",
    icon: "🔄", image: IMAGE, walkingTime: "4 min", rating: 4.6, reviewCount: 60,
  },
  {
    id: 28, sectorId: 2,
    name: { en: "Indigenous Technology Development Desk", am: "የአገር ቤት ቴክኖሎጂ ልማት ዴስክ" },
    description: { en: "Development of indigenous technology.", am: "የአገር ቤት ቴክኖሎጂ ልማት።" },
    building: "A", floor: 5, room: "501",
    directions: { en: "Take elevator to Floor 5. Room 501 (shared with Technology Transfer).", am: "ሊፍት ወደ 5ኛ ፎቅ ይውሰዱ። ክፍል 501 (ከቴክኖሎጂ ሽግግር ጋር የጋራ)።" },
    services: { en: ["Indigenous tech development", "Local innovation", "Research support"], am: ["የአገር ቤት ቴክ ልማት", "አካባቢያዊ ፈጠራ", "የምርምር ድጋፍ"] },
    head: "Teklemariam Tessema Tohe (PhD)",
    contact: "+251-111-265735", email: "indigenous@mint.gov.et",
    icon: "🌱", image: IMAGE, walkingTime: "4 min", rating: 4.6, reviewCount: 50,
  },

  // ── Innovation Ecosystem Development Lead Executive ─────────
  {
    id: 29, sectorId: 2,
    name: { en: "Innovation Development Desk", am: "የፈጠራ ልማት ዴስክ" },
    description: { en: "Innovation ecosystem development and support.", am: "የፈጠራ ሥነ-ምህዳር ልማት እና ድጋፍ።" },
    building: "A", floor: 5, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Innovation support", "Ecosystem development", "Startup mentorship"], am: ["የፈጠራ ድጋፍ", "ሥነ-ምህዳር ልማት", "ስታርተፕ አማካሪ"] },
    head: "Selamyhun Adefris Haile",
    contact: "+251-111-265736", email: "innovdev@mint.gov.et",
    icon: "💡", image: IMAGE, walkingTime: "4 min", rating: 4.6, reviewCount: 55,
  },
  {
    id: 30, sectorId: 2,
    name: { en: "Innovation Infrastructure Development Desk", am: "የፈጠራ መሠረተ ልማት ልማት ዴስክ" },
    description: { en: "Innovation infrastructure development and management.", am: "የፈጠራ መሠረተ ልማት ልማት እና አስተዳደር።" },
    building: "A", floor: 5, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Infrastructure planning", "Hub development", "Facility coordination"], am: ["የመሠረተ ልማት ዕቅድ", "Hub ልማት", "የህንፃ ቅንጅት"] },
    head: "",
    contact: "+251-111-265737", email: "innovinfra@mint.gov.et",
    icon: "🏗️", image: IMAGE, walkingTime: "4 min", rating: 4.5, reviewCount: 38,
  },
  {
    id: 31, sectorId: 2,
    name: { en: "Cluster & Innovation Enterprise Development Desk", am: "የክሉስተር እና የፈጠራ ኢንተርፕራይዝ ልማት ዴስክ" },
    description: { en: "Cluster and innovation enterprise development.", am: "ክሉስተር እና የፈጠራ ኢንተርፕራይዝ ልማት።" },
    building: "A", floor: 6, room: "Left side",
    directions: { en: "Take elevator to Floor 6. Office on the left side.", am: "ሊፍት ወደ 6ኛ ፎቅ ይውሰዱ። ቢሮ በግራ ጎን ነው።" },
    services: { en: ["Cluster development", "Enterprise support", "Innovation hubs"], am: ["ክሉስተር ልማት", "ኢንተርፕራይዝ ድጋፍ", "የፈጠራ Hub"] },
    head: "Mulugeta Wube Ayele",
    contact: "+251-111-265738", email: "cluster@mint.gov.et",
    icon: "🏢", image: IMAGE, walkingTime: "5 min", rating: 4.6, reviewCount: 45,
  },

  // =========================================================
  // SECTOR 3: ICT & DIGITAL ECONOMY SECTOR
  // =========================================================

  // ── E-Government Development Lead Executive ────────────────
  {
    id: 32, sectorId: 3,
    name: { en: "National E-Government Plan & Coordination Desk", am: "ብሔራዊ ኢ-መንግሥት ዕቅድ እና ቅንጅት ዴስክ" },
    description: { en: "National e-government planning and coordination.", am: "ብሔራዊ ኢ-መንግሥት ዕቅድ እና ቅንጅት።" },
    building: "B", floor: 1, room: "B1",
    directions: { en: "Enter Building B. Office is on the 1st Floor.", am: "ወደ ህንፃ B ይግቡ። ቢሮ 1ኛ ፎቅ ላይ ነው።" },
    services: { en: ["E-government planning", "Digital services coordination", "Policy implementation"], am: ["የኢ-መንግሥት ዕቅድ", "ዲጂታል አገልግሎቶች ቅንጅት", "ፖሊሲ ትግበራ"] },
    head: "Biruhtesfa Taye Alamneh",
    contact: "+251-111-265740", email: "egov@mint.gov.et",
    icon: "🏛️", image: IMAGE, walkingTime: "5 min", rating: 4.6, reviewCount: 78,
  },
  {
    id: 33, sectorId: 3,
    name: { en: "Central Digital Services Development & Administration Desk", am: "ማዕከላዊ ዲጂታል አገልግሎቶች ልማት እና አስተዳደር ዴስክ" },
    description: { en: "Central digital services development and administration.", am: "ማዕከላዊ ዲጂታል አገልግሎቶች ልማት እና አስተዳደር።" },
    building: "B", floor: 1, room: "B1",
    directions: { en: "Enter Building B. Office is on the 1st Floor.", am: "ወደ ህንፃ B ይግቡ። ቢሮ 1ኛ ፎቅ ላይ ነው።" },
    services: { en: ["Digital platform management", "Online services", "Digital transformation"], am: ["ዲጂታል ፕሌትፎርም አስተዳደር", "ኦንላይን አገልግሎቶች", "ዲጂታል ለውጥ"] },
    head: "Miraj Zekiy",
    contact: "+251-111-265741", email: "digitalservices@mint.gov.et",
    icon: "💻", image: IMAGE, walkingTime: "5 min", rating: 4.6, reviewCount: 65,
  },
  {
    id: 34, sectorId: 3,
    name: { en: "National Data Center Development & Management Desk", am: "ብሔራዊ ዳታ ሴንተር ልማት እና አስተዳደር ዴስክ" },
    description: { en: "National data center development and management.", am: "ብሔራዊ ዳታ ሴንተር ልማት እና አስተዳደር።" },
    building: "A", floor: 0, room: "Ground Floor",
    directions: { en: "Take elevator to Ground Floor (Building A). Data Center at the end of corridor.", am: "ሊፍት ወደ መሬት ፎቅ ይውሰዱ (ህንፃ A)። ዳታ ሴንተር በኮሪደሩ መጨረሻ ነው።" },
    services: { en: ["Server management", "Data storage", "Backup services", "Disaster recovery"], am: ["የሰርቨር አስተዳደር", "ዳታ ማከማቻ", "የምትኬ አገልግሎቶች"] },
    head: "Telila Tilaye Robi / Admaswork Mamo Dima",
    contact: "+251-111-265742", email: "datacenter@mint.gov.et",
    icon: "🖥️", image: IMAGE, walkingTime: "1 min", rating: 4.5, reviewCount: 45,
  },

  // ── Government ICT Infrastructure Construction & Management ─
  {
    id: 35, sectorId: 3,
    name: { en: "Digital Infrastructure Construction Desk", am: "ዲጂታል መሠረተ ልማት ግንባታ ዴስክ" },
    description: { en: "Digital infrastructure construction and management.", am: "ዲጂታል መሠረተ ልማት ግንባታ እና አስተዳደር።" },
    building: "A", floor: 1, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Infrastructure construction", "Network deployment", "ICT project management"], am: ["መሠረተ ልማት ግንባታ", "ኔትወርክ ማሰማራት", "የICT ፕሮጀክት አስተዳደር"] },
    head: "",
    contact: "+251-111-265743", email: "digitalinfra@mint.gov.et",
    icon: "🔧", image: IMAGE, walkingTime: "1 min", rating: 4.5, reviewCount: 40,
  },
  {
    id: 36, sectorId: 3,
    name: { en: "Data Center Administration Desk", am: "ዳታ ሴንተር አስተዳደር ዴስክ" },
    description: { en: "Data center administration and operations.", am: "ዳታ ሴንተር አስተዳደር እና ሥራዎች።" },
    building: "A", floor: 0, room: "Ground Floor",
    directions: { en: "Take elevator to Ground Floor (Building A). Data Center.", am: "ሊፍት ወደ መሬት ፎቅ ይውሰዱ (ህንፃ A)። ዳታ ሴንተር።" },
    services: { en: ["Data center operations", "Server administration", "System monitoring"], am: ["ዳታ ሴንተር ሥራዎች", "ሰርቨር አስተዳደር", "ሥርዓት ክትትል"] },
    head: "",
    contact: "+251-111-265744", email: "datacenteradmin@mint.gov.et",
    icon: "🖥️", image: IMAGE, walkingTime: "1 min", rating: 4.5, reviewCount: 38,
  },
  {
    id: 37, sectorId: 3,
    name: { en: "Quality & Security Administration / Cyber Security Desk", am: "ጥራት እና ደህንነት አስተዳደር / ሳይበር ደህንነት ዴስክ" },
    description: { en: "Quality assurance, security administration, and cyber security.", am: "ጥራት ማረጋገጫ፣ ደህንነት አስተዳደር እና ሳይበር ደህንነት።" },
    building: "A", floor: 1, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Cyber security", "Quality assurance", "Security audits", "Risk management"], am: ["ሳይበር ደህንነት", "ጥራት ማረጋገጫ", "የደህንነት ኦዲት"] },
    head: "Yared Garedew Zelelke",
    contact: "+251-111-265745", email: "cybersecurity@mint.gov.et",
    icon: "🔒", image: IMAGE, walkingTime: "1 min", rating: 4.7, reviewCount: 55,
  },

  // ── Digital Economy Development Lead Executive ─────────────
  {
    id: 38, sectorId: 3,
    name: { en: "Digital Standard & Regulation Desk", am: "ዲጂታል ስታንዳርድ እና ደንብ ዴስክ" },
    description: { en: "Digital standards development and regulation.", am: "ዲጂታል ስታንዳርዶች ልማት እና ደንብ።" },
    building: "A", floor: 1, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Standard setting", "Regulatory compliance", "Digital policy"], am: ["ስታንዳርድ ማዘጋጀት", "ደንብ ተገዢነት", "ዲጂታል ፖሊሲ"] },
    head: "Babesha Kenaw Abono",
    contact: "+251-111-265746", email: "digitalstandards@mint.gov.et",
    icon: "📏", image: IMAGE, walkingTime: "1 min", rating: 4.5, reviewCount: 42,
  },
  {
    id: 39, sectorId: 3,
    name: { en: "Digital Society Development Desk", am: "ዲጂታል ማህበረሰብ ልማት ዴስክ" },
    description: { en: "Digital society development and inclusion.", am: "ዲጂታል ማህበረሰብ ልማት እና ተካትነት።" },
    building: "A", floor: 1, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Digital inclusion", "Society development", "Digital literacy"], am: ["ዲጂታል ተካትነት", "ማህበረሰብ ልማት", "ዲጂታል ማንበብ"] },
    head: "Soud Ousman Mhamed",
    contact: "+251-111-265747", email: "digitalsociety@mint.gov.et",
    icon: "👨‍👩‍👧", image: IMAGE, walkingTime: "1 min", rating: 4.5, reviewCount: 38,
  },
  {
    id: 40, sectorId: 3,
    name: { en: "Digital Industry Development Desk", am: "ዲጂታል ኢንዱስትሪ ልማት ዴስክ" },
    description: { en: "Digital industry development and growth.", am: "ዲጂታል ኢንዱስትሪ ልማት እና ዕድገት።" },
    building: "A", floor: 1, room: "TBD",
    directions: { en: "Location not yet specified. Contact reception for directions.", am: "ቦታ ገና አልተወሰነም። ሪሴፕሽን ያናግሩ።" },
    services: { en: ["Industry development", "Digital economy", "Business digitization"], am: ["ኢንዱስትሪ ልማት", "ዲጂታል ኢኮኖሚ", "ቢዝነስ ዲጅታላይዜሽን"] },
    head: "Minda Feleke W/Mariam",
    contact: "+251-111-265748", email: "digitalindustry@mint.gov.et",
    icon: "🏭", image: IMAGE, walkingTime: "1 min", rating: 4.5, reviewCount: 40,
  },
];

async function seedDepartments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Department.deleteMany({});
    console.log("🗑️  Cleared all existing departments");

    await Department.insertMany(departments);
    console.log(`✅ Seeded ${departments.length} departments`);

    console.log("\n📊 Departments by sector:");
    [1, 2, 3].forEach((sId) => {
      const list = departments.filter((d) => d.sectorId === sId);
      console.log(`   Sector ${sId}: ${list.length} departments`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    process.exit(1);
  }
}

seedDepartments();
