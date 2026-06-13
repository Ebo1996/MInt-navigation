const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    sectorId: { type: Number, required: true, default: 1 },
    name: {
      en: { type: String, required: true },
      am: { type: String },
      om: { type: String },
    },
    description: {
      en: { type: String, required: true },
      am: { type: String },
      om: { type: String },
    },
    building: {
      type: String,
      enum: ["A", "B"],
      required: true,
    },
    floor: { type: Number, required: true, min: 0, max: 8 },
    room: { type: String, required: true },
    directions: {
      en: { type: String, required: true },
      am: { type: String },
      om: { type: String },
    },
    services: {
      en: [String],
      am: [String],
      om: [String],
    },
    contact: { type: String, default: "" },
    email: { type: String, default: "" },
    walkingTime: { type: String, default: "" },
    icon: { type: String, default: "🏢" },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    },
    departmentImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    },
    head: { type: String, default: "" },
    headImage: { type: String, default: "" },
    corridorSide: {
      type: String,
      enum: ["left", "right", ""],
      default: "",
    },
    corridorOrder: { type: Number, default: 0 },
    landmark: { type: String, default: "" },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Indexes for fast public queries
departmentSchema.index({ sectorId: 1 });
departmentSchema.index({ building: 1 });
departmentSchema.index({ floor: 1, id: 1 });

module.exports = mongoose.model("Department", departmentSchema);
