const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const DEFAULT_ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin@12345";
const DEFAULT_ADMIN_NAME = process.env.BOOTSTRAP_ADMIN_NAME || "System Admin";

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      console.log(`Admin already exists: ${DEFAULT_ADMIN_EMAIL}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await User.create({
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      departmentId: null
    });

    console.log("Admin created successfully");
    console.log(`Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("Failed to bootstrap admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
