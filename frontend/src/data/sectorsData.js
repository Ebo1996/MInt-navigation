export const sectorsData = [
  {
    id: 1,
    name: { en: "Executive Leadership", am: "ሥራ አስፈጻሚ አመራር" },
    description: {
      en: "Minister's Office, Deputy Minister, and executive leadership overseeing ministry operations and strategic direction.",
      am: "የሚኒስቴሩን ሥራ አስፈጻሚ አመራር እና ስትራቴጂካዊ አቅጣጫ የሚያስተዳድር ዘርፍ።",
    },
    building: "A",
    floors: [6, 7, 8],
    departmentCount: 6,
    color: "#1E3A5F",
    icon: "🏛️",
  },
  {
    id: 2,
    name: { en: "Innovation & Technology", am: "ፈጠራ እና ቴክኖሎጂ" },
    description: {
      en: "Technology center, innovation fund, startups, technology development, and R&D coordination.",
      am: "የቴክኖሎጂ ልማት፣ ፈጠራ እና ዲጂታል ኢኮኖሚን የሚያበረታታ ዘርፍ።",
    },
    building: "A",
    floors: [1, 2, 3, 5, 6],
    departmentCount: 6,
    color: "#078930",
    icon: "💡",
  },
  {
    id: 3,
    name: { en: "Finance & Administration", am: "ፋይናንስ እና አስተዳደር" },
    description: {
      en: "Treasury, procurement, audit, budget management, and financial administration.",
      am: "የሚኒስቴሩን የፋይናንስ አስተዳደር፣ ግዥ እና ኦዲት የሚያስተዳድር ዘርፍ።",
    },
    building: "A",
    floors: [2, 3, 4],
    departmentCount: 4,
    color: "#F59E0B",
    icon: "💰",
  },
  {
    id: 4,
    name: { en: "Policy & Strategy", am: "ፖሊሲ እና ስትራቴጂ" },
    description: {
      en: "Policy affairs, strategic planning, national research and development coordination.",
      am: "ብሔራዊ የቴክኖሎጂ ፖሊሲዎችን እና ስትራቴጂካዊ ዕቅዶችን የሚቀርጽ ዘርፍ።",
    },
    building: "A",
    floors: [3, 4, 5],
    departmentCount: 4,
    color: "#8B5CF6",
    icon: "📋",
  },
  {
    id: 5,
    name: { en: "HR & Competency", am: "ሰው ሃብት እና ብቃት" },
    description: {
      en: "Human resources, secretariat, women and social resources, competency management.",
      am: "የሰው ሃብት አስተዳደር፣ ሥልጠና እና የሠራተኞች ብቃት ማሳደጊያ ዘርፍ።",
    },
    building: "A",
    floors: [2, 3, 4],
    departmentCount: 4,
    color: "#EC4899",
    icon: "👥",
  },
  {
    id: 6,
    name: { en: "Operations & Services", am: "ሥራ አፈጻጸም እና አገልግሎቶች" },
    description: {
      en: "General services, facility operations, registry, and building management.",
      am: "የሚኒስቴሩን አጠቃላይ አገልግሎቶች፣ ጥገና እና ሥራ አፈጻጸም የሚያስተዳድር ዘርፍ።",
    },
    building: "A/B",
    floors: [3, 1],
    departmentCount: 4,
    color: "#14B8A6",
    icon: "⚙️",
  },
  {
    id: 7,
    name: { en: "Digital & ICT", am: "ዲጂታል እና ኢሲቲ" },
    description: {
      en: "ICT services, e-government, digital economy, and technology infrastructure.",
      am: "የኢሲቲ መሠረተ ልማት፣ ኢ-መንግሥት እና ዲጂታል ኢኮኖሚ አገልግሎቶችን የሚያቀርብ ዘርፍ።",
    },
    building: "A/B",
    floors: [1, 1, 2],
    departmentCount: 4,
    color: "#3B82F6",
    icon: "🌐",
  },
  {
    id: 8,
    name: { en: "Support Services", am: "ድጋፍ አገልግሎቶች" },
    description: {
      en: "Data center, conference hall, TV room, and general support facilities.",
      am: "የዳታ ማዕከል፣ ኮንፈረንስ አዳራሽ እና ሚዲያ አገልግሎቶችን የሚያቀርብ ዘርፍ።",
    },
    building: "A",
    floors: [0, 1, 8],
    departmentCount: 4,
    color: "#6B7280",
    icon: "🛠️",
  },
];

// ========== HELPER FUNCTIONS ==========

// Get sector by ID
export const getSectorById = (id) => {
  return sectorsData.find((sector) => sector.id === parseInt(id));
};

// Get sector display name with language support
export const getSectorName = (sector, lang = "en") => {
  if (!sector) return "";
  if (typeof sector.name === "string") return sector.name;
  return sector.name?.[lang] || sector.name?.en || "";
};

// Get all sectors
export const getAllSectors = () => {
  return sectorsData;
};

// Get sectors by building
export const getSectorsByBuilding = (building) => {
  return sectorsData.filter((sector) => sector.building === building);
};

// Get total departments across all sectors
export const getTotalDepartments = () => {
  return sectorsData.reduce(
    (total, sector) => total + sector.departmentCount,
    0,
  );
};
// Get total sectors
export const getTotalSectors = () => {
  return sectorsData.length;
};
