const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// ── Department images storage ──
const departmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "mint/departments",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto" }],
    public_id: `dept-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  }),
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const uploadDepartmentImages = multer({
  storage: departmentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: "departmentImage", maxCount: 1 },
  { name: "headImage",       maxCount: 1 },
]);

module.exports = { uploadDepartmentImages };
