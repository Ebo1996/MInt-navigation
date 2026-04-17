const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Department = require("./models/Department");

dotenv.config();

const usersToSeed = [
  {
    name: process.env.SEED_ADMIN_NAME || "System Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    role: "admin"
  },
  {
    name: process.env.SEED_GM_NAME || "General Manager",
    email: process.env.SEED_GM_EMAIL || "gm@example.com",
    password: process.env.SEED_GM_PASSWORD || "Gm@12345",
    role: "general_manager"
  },
  {
    name: process.env.SEED_DM_NAME || "Department Manager",
    email: process.env.SEED_DM_EMAIL || "dm@example.com",
    password: process.env.SEED_DM_PASSWORD || "Dm@12345",
    role: "department_manager"
  }
];

const upsertUser = async ({ name, email, password, role, departmentId = null }) => {
  const normalizedEmail = email.toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      departmentId: role === "department_manager" ? departmentId : null
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
      runValidators: true
    }
  );

  console.log(`Seeded user: ${normalizedEmail} (${role})`);
};

const seedUsers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const department = await Department.findOne().sort({ createdAt: 1 });
    if (!department) {
      throw new Error("No departments found. Run 'npm run seed' first.");
    }

    for (const user of usersToSeed) {
      await upsertUser({
        ...user,
        departmentId: user.role === "department_manager" ? department._id : null
      });
    }

    console.log("Users seeded successfully");
    console.log("Admin:", usersToSeed[0].email, usersToSeed[0].password);
    console.log("General Manager:", usersToSeed[1].email, usersToSeed[1].password);
    console.log("Department Manager:", usersToSeed[2].email, usersToSeed[2].password);
  } catch (error) {
    console.error("Failed to seed users:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedUsers();
