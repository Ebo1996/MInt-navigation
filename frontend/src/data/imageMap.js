/**
 * Exact image assignments for every sector and department.
 * Keyed by numeric ID so they never rely on name matching.
 * All images are from Unsplash (free to use).
 */

/* ── SECTOR IMAGES (id → url) ── */
export const SECTOR_IMAGE_MAP = {
  // 1 — Executive Leadership
  1: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=420&fit=crop&q=85",
  // 2 — Innovation & Technology
  2: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=420&fit=crop&q=85",
  // 3 — Finance & Administration
  3: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=420&fit=crop&q=85",
  // 4 — Policy & Strategy
  4: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=420&fit=crop&q=85",
  // 5 — HR & Competency
  5: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=420&fit=crop&q=85",
  // 6 — Operations & Services
  6: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=420&fit=crop&q=85",
  // 7 — Digital & ICT
  7: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=420&fit=crop&q=85",
  // 8 — Support Services
  8: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=420&fit=crop&q=85",
};

/* ── DEPARTMENT IMAGES (id → url) ── */
export const DEPT_IMAGE_MAP = {
  // Sector 1 — Executive Leadership
  1:  "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&h=340&fit=crop&q=85",  // Minister's Office — government building
  2:  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop&q=85",  // Deputy Minister Office — executive portrait
  3:  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=340&fit=crop&q=85",  // Leadership Chief Executive — boardroom
  4:  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=340&fit=crop&q=85",  // Strategic Affairs Executive — strategy planning
  5:  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=340&fit=crop&q=85",  // Basic Service Executive — public service
  6:  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=340&fit=crop&q=85",  // Minister's Secretariat — office desk

  // Sector 2 — Innovation & Technology
  7:  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=340&fit=crop&q=85",  // Technology Center — circuit board
  8:  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop&q=85",  // Innovation Fund Office — finance/investment
  9:  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=340&fit=crop&q=85",  // Technology Development & Transfer — tech lab
  10: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=340&fit=crop&q=85",  // Startup — startup workspace
  11: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=340&fit=crop&q=85",  // Innovation & Technology Cooperation — collaboration
  12: "https://images.unsplash.com/photo-1532094349884-543559059e2d?w=600&h=340&fit=crop&q=85",  // Research & Development — laboratory

  // Sector 3 — Finance & Administration
  13: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=340&fit=crop&q=85",  // Treasury & Finance Office — financial charts
  14: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=340&fit=crop&q=85",  // Procurement & Finance Executive — procurement
  15: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=340&fit=crop&q=85",  // Audit Office Executive — audit/accounting

  // Sector 4 — Policy & Strategy
  16: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop&q=85",  // Policy & Strategic Affairs — policy meeting
  17: "https://images.unsplash.com/photo-1532094349884-543559059e2d?w=600&h=340&fit=crop&q=85",  // National Research & Development — research

  // Sector 5 — HR & Competency
  18: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=340&fit=crop&q=85",  // Competency & HR Management — team/HR
  19: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=340&fit=crop&q=85",  // Women & Social Resources — diversity/inclusion

  // Sector 6 — Operations & Services
  20: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=340&fit=crop&q=85",  // General Services Executive — facility management
  21: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=340&fit=crop&q=85",  // Facility Operations Executive — building operations
  22: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=340&fit=crop&q=85",  // Registry Office — filing/records

  // Sector 7 — Digital & ICT
  23: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&q=85",  // ICT Director — digital network
  24: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=340&fit=crop&q=85",  // E-Electronics & E-Government — e-government
  25: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=340&fit=crop&q=85",  // ICT & Digital Economy Deputy — digital economy

  // Sector 8 — Support Services
  26: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=340&fit=crop&q=85",  // Data Center — server room
  27: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=340&fit=crop&q=85",  // TV Room — broadcast/media
  28: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=340&fit=crop&q=85",  // Conference Hall — conference room

  // Extra departments (id 29, 30 — sectorId 1)
  29: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=340&fit=crop&q=85",  // technology 1
  30: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=340&fit=crop&q=85",  // data and center of world
};

const FALLBACK = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=340&fit=crop&q=85";

/** Returns the correct image for a department object */
export const getDeptImage = (dept) => {
  // Prefer uploaded image from DB
  if (dept.departmentImage && !dept.departmentImage.includes("unsplash.com/photo-1497366216548")) return dept.departmentImage;
  if (dept.image && !dept.image.includes("unsplash.com/photo-1497366216548")) return dept.image;
  // Use exact ID map
  return DEPT_IMAGE_MAP[dept.id] || FALLBACK;
};

/** Returns the correct image for a sector object */
export const getSectorImage = (sector) => {
  if (sector.image && !sector.image.includes("unsplash.com/photo-1497366216548")) return sector.image;
  return SECTOR_IMAGE_MAP[sector.id] || FALLBACK;
};
