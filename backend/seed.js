const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Sector = require("./models/Sector");
const Department = require("./models/Department");

dotenv.config();

const sectors = [
  "Research and Innovation sector",
  "ICT and Digital Economy Sector",
  "Administration Sectors"
];

const departmentsBySector = {
  "Research and Innovation sector": [
    "Innovation Development",
    "Research Development",
    "Technology Development and Transfer"
  ],
  "ICT and Digital Economy Sector": [
    "ICT Infrastructure Development and Administration",
    "Electronic Government Development and Administration",
    "Digital Economy Development and Administration"
  ]
};

const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

const managerProfiles = {
  "Innovation Development": {
    name: "Dr. Hana Kebede",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    services: ["Innovation mentorship", "Startup incubation support", "Project advisory"],
    contactNo: "+251-911-120-001"
  },
  "Research Development": {
    name: "Dr. Daniel Bekele",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    services: ["Research proposal guidance", "Funding support", "Research coordination"],
    contactNo: "+251-911-120-002"
  },
  "Technology Development and Transfer": {
    name: "Ms. Ruth Tadesse",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    services: ["Technology transfer support", "Industry collaboration", "IP facilitation"],
    contactNo: "+251-911-120-003"
  },
  "ICT Infrastructure Development and Administration": {
    name: "Mr. Elias Worku",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
    services: ["Network services", "Infrastructure maintenance", "Systems administration"],
    contactNo: "+251-911-120-004"
  },
  "Electronic Government Development and Administration": {
    name: "Ms. Selam Alemu",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    services: ["eGovernment platform support", "Digital service onboarding", "Public system guidance"],
    contactNo: "+251-911-120-005"
  },
  "Digital Economy Development and Administration": {
    name: "Mr. Abel Tesfaye",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    services: ["Digital policy support", "SME digitization advisory", "Innovation ecosystem support"],
    contactNo: "+251-911-120-006"
  }
};

const generateLocation = () => {
  const building = randomFrom(["A", "B"]);
  const floor = building === "A" ? randomFrom([1, 2]) : Math.floor(Math.random() * 7) + 1;
  const unit = Math.floor(Math.random() * 40) + 1;
  const officeNumber = `${building}-${floor}${String(unit).padStart(2, "0")}`;

  return { building, floor, officeNumber };
};

const buildDepartmentDoc = (sector, name) => {
  const { building, floor, officeNumber } = generateLocation();
  const manager = managerProfiles[name];
  const compactName = name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();
  const specialIdentifier = `MINT-${building}${floor}-${compactName}`;
  const emailPrefix = compactName.toLowerCase() || "dept";

  return {
    name,
    sector,
    building,
    floor,
    officeNumber,
    specialIdentifier,
    departmentEmail: `${emailPrefix}@mint.gov.et`,
    departmentContactNo: manager.contactNo,
    services: [
      `Front desk support for ${name}`,
      `Guidance and visitor assistance for ${sector}`,
      "Information and document processing"
    ],
    departmentManager: {
      name: manager.name,
      image: manager.image,
      services: manager.services,
      contactNo: manager.contactNo
    }
  };
};

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all(
      sectors.map((name) =>
        Sector.findOneAndUpdate({ name }, { name }, { upsert: true, new: true, setDefaultsOnInsert: true })
      )
    );

    const departments = Object.entries(departmentsBySector).flatMap(([sector, names]) =>
      names.map((name) => buildDepartmentDoc(sector, name))
    );

    await Promise.all(
      departments.map((department) =>
        Department.findOneAndUpdate({ name: department.name }, department, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        })
      )
    );

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
