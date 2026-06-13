const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const createFeedbackAnalyst = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const analystExists = await Admin.findOne({ username: "analyst" });

    if (!analystExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("analyst123", salt);

      await Admin.create({
        username: "analyst",
        password: hashedPassword,
        email: "analyst@mint.gov.et",
        role: "feedback_analyst",
      });

      console.log("✅ Analyst created successfully!");
      console.log("   Username: analyst");
      console.log("   Password: analyst123");
      console.log("   Role: feedback_analyst");
    } else {
      console.log("ℹ️ Analyst already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createFeedbackAnalyst();
