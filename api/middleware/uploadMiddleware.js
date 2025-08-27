const multer = require("multer");
const { validateFileType, validateFileSize } = require("../services/s3Service");

// Configure multer for memory storage (files will be uploaded to S3)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!validateFileType(file.mimetype)) {
    return cb(
      new Error(
        "Invalid file type. Only PNG, JPG, JPEG, and SVG files are allowed."
      ),
      false
    );
  }

  // Check file size (100MB limit)
  if (!validateFileSize(file.size)) {
    return cb(new Error("File too large. Maximum file size is 100MB."), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 104857600, // 100MB
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
        message: "File too large. Maximum file size is 100MB.",
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
