// ============================================================
// OFFICIAL MINT SECTOR DATA
// Source: Official MINT Organizational Directory
// ============================================================

export const sectorsData = [
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
  },
];

// ========== HELPER FUNCTIONS ==========

export const getSectorById = (id) =>
  sectorsData.find((s) => s.id === parseInt(id));

export const getSectorName = (sector, lang = "en") => {
  if (!sector) return "";
  if (typeof sector.name === "string") return sector.name;
  return sector.name?.[lang] || sector.name?.en || "";
};

export const getAllSectors = () => sectorsData;

export const getSectorsByBuilding = (building) =>
  sectorsData.filter((s) => s.building === building);

export const getTotalDepartments = () =>
  sectorsData.reduce((t, s) => t + s.departmentCount, 0);

export const getTotalSectors = () => sectorsData.length;
