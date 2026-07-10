const mongoose = require("mongoose");
const Admin = require("../src/models/Admin");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const createInitialAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin exists
    const adminExists = await Admin.findOne({ username: "admin" });

    if (!adminExists) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await Admin.create({
        username: "admin",
        password: hashedPassword,
        email: "admin@mint.gov.et",
        role: "superadmin",
      });

      console.log("✅ Initial admin created successfully!");
      console.log("   Username: admin");
      console.log("   Password: admin123");
      console.log("   Role: superadmin");
    } else {
      console.log("ℹ️ Admin already exists");
      console.log("   Username: admin");
      console.log("   Password: admin123");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createInitialAdmin();
