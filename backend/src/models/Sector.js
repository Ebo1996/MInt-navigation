const mongoose = require("mongoose");

const sectorSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: mongoose.Schema.Types.Mixed, // supports both String and {en, am} object
      required: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed, // supports both String and {en, am} object
      required: true,
    },
    building: {
      type: String,
      enum: ["A", "B", "A/B"],
      required: true,
    },
    floors: {
      type: [Number],
      required: true,
    },
    room: {
      type: String,
      default: "",
    },
    departmentCount: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#086976",
    },
    icon: {
      type: String,
      default: "🏛️",
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=420&fit=crop",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate id if not provided
sectorSchema.pre("save", async function (next) {
  if (!this.id) {
    const lastSector = await this.constructor.findOne().sort({ id: -1 });
    this.id = lastSector ? lastSector.id + 1 : 1;
  }
  next();
});

// Index for fast public queries
sectorSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("Sector", sectorSchema);
