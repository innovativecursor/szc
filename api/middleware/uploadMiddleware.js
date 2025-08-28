const multer = require("multer");
const { validateFileType } = require("../services/s3Service");

// Configure multer for memory storage (files will be uploaded to S3)
const storage = multer.memoryStorage();

// File filter function - only check file type, let multer handle size limits
const fileFilter = (req, file, cb) => {
  console.log("🔍 File upload attempt:", {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    fieldname: file.fieldname,
  });

  // Check file type
  if (!validateFileType(file.mimetype)) {
    console.log("❌ File type rejected:", file.mimetype);
    return cb(
      new Error(
        "Invalid file type. Only PNG, JPG, JPEG, and SVG files are allowed."
      ),
      false
    );
  }

  console.log("✅ File type accepted:", file.mimetype);
  // File size validation is handled by multer limits
  cb(null, true);
};

// Configure multer with proper limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10485760, // 10MB for submissions
    files: 10, // Maximum 10 files
  },
});

// Middleware for handling file uploads
const handleFileUpload = (fieldName = "files", maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for handling single file upload
const handleSingleFileUpload = (fieldName = "file") => {
  return upload.single(fieldName);
};

// Error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        code: 413,
        message: "File too large. Maximum file size is 10MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(413).json({
        code: 413,
        message: "Too many files. Maximum 10 files allowed.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        code: 400,
        message: "Unexpected file field.",
      });
    }
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      code: 400,
      message: error.message,
    });
  }

  if (error.message.includes("File too large")) {
    return res.status(413).json({
      code: 413,
      message: error.message,
    });
  }

  // Default error
  return res.status(500).json({
    code: 500,
    message: "File upload error occurred.",
  });
};

module.exports = {
  handleFileUpload,
  handleSingleFileUpload,
  handleUploadError,
};
