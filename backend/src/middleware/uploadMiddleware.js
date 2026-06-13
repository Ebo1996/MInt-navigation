const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.join(__dirname, "../../uploads");
const departmentsDir = path.join(uploadsRoot, "departments");

if (!fs.existsSync(departmentsDir)) {
  fs.mkdirSync(departmentsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, departmentsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    const baseName = path
      .basename(file.originalname || "file", ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    cb(null, `${baseName}-${Date.now()}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const uploadDepartmentImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
}).fields([
  { name: "departmentImage", maxCount: 1 },
  { name: "headImage", maxCount: 1 },
]);

module.exports = {
  uploadDepartmentImages,
};
