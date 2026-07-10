const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const createInitialAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const adminExists = await Admin.findOne({ username: "admin" });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await Admin.create({
        username: "admin",
        password: hashedPassword,
        email: "admin@mint.gov.et",
        role: "superadmin",
      });

      console.log("✅ Admin created successfully!");
      console.log("   Username: admin");
      console.log("   Password: admin123");
    } else {
      console.log("ℹ️ Admin already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createInitialAdmin();
