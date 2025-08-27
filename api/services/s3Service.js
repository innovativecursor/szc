const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { getObjectStorageConfig } = require("../config/configLoader");
const crypto = require("crypto");

// Generate file hash for integrity checking
const generateFileHash = (buffer) => {
  return crypto.createHash("md5").update(buffer).digest("hex");
};

// Get object storage configuration
const getS3Config = () => {
  try {
    const config = getObjectStorageConfig();
    console.log("S3 Config loaded:", {
      region: config.region,
      accessKeyId: config.access_key_id
        ? "***" + config.access_key_id.slice(-4)
        : "undefined",
      bucket: config.bucket,
    });
    return {
      region: config.region || "eu-west-1",
      accessKeyId: config.access_key_id,
      secretAccessKey: config.secret_access_key,
      bucket: config.bucket || "skillz-collab",
    };
  } catch (error) {
    console.error("Error loading S3 configuration:", error);
    // Fallback to environment variables if config loading fails
    return {
      region: process.env.AWS_REGION || "eu-west-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_S3_BUCKET || "skillz-collab",
    };
  }
};

// Configure AWS SDK
const s3Config = getS3Config();
const s3 = new AWS.S3({
  region: s3Config.region,
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
});

// Upload file to S3
const uploadFileToS3 = async (file, folder = "uploads") => {
  try {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const uploadParams = {
      Bucket: s3Config.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await s3.upload(uploadParams).promise();

    return {
      id: uuidv4(),
      filename: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: result.Location,
      hash: generateFileHash(file.buffer),
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// Upload multiple files to S3
const uploadMultipleFilesToS3 = async (files, folder = "uploads") => {
  try {
    const uploadPromises = files.map((file) => uploadFileToS3(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading multiple files to S3:", error);
    throw new Error("Failed to upload files to S3");
  }
};

// Upload base64 encoded images to S3
const uploadBase64ImagesToS3 = async (base64Images, folder = "uploads") => {
  try {
    const uploadPromises = base64Images.map((base64String, index) => {
      return uploadBase64ImageToS3(base64String, folder, index);
    });
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading base64 images to S3:", error);
    throw new Error("Failed to upload base64 images to S3");
  }
};

// Upload a single base64 encoded image to S3
const uploadBase64ImageToS3 = async (
  base64String,
  folder = "uploads",
  index = 0
) => {
  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Validate file size (5MB limit)
    if (!validateFileSize(buffer.length, 5242880)) {
      throw new Error("Image size exceeds 5MB limit");
    }

    // Determine file type from base64 string or default to jpeg
    let contentType = "image/jpeg";
    if (base64String.startsWith("data:image/")) {
      const match = base64String.match(/^data:image\/([a-z]+);base64,/);
      if (match) {
        contentType = `image/${match[1]}`;
      }
    }

    // Generate filename
    const fileExtension = contentType.split("/")[1] || "jpg";
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const uploadParams = {
      Bucket: s3Config.bucket,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    };

    const result = await s3.upload(uploadParams).promise();

    return {
      id: uuidv4(),
      filename: `image_${index + 1}.${fileExtension}`,
      size: buffer.length,
      type: contentType,
      url: result.Location,
      hash: generateFileHash(buffer),
    };
  } catch (error) {
    console.error("Error uploading base64 image to S3:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      s3Config: {
        region: s3Config.region,
        bucket: s3Config.bucket,
        hasAccessKey: !!s3Config.accessKeyId,
        hasSecretKey: !!s3Config.secretAccessKey,
      },
    });
    throw new Error("Failed to upload base64 image to S3");
  }
};

// Delete file from S3
const deleteFileFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split("/").pop();
    const deleteParams = {
      Bucket: s3Config.bucket,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return false;
  }
};

// Validate file type
const validateFileType = (mimetype) => {
  const allowedTypes = [
    // Images
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/svg+xml",
    "image/webp",
    "image/tiff",
    "image/bmp",
    "image/gif",
    // Videos
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/webm",
    "video/mkv",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  return allowedTypes.includes(mimetype);
};

// Validate file size (default 10MB for submissions)
const validateFileSize = (size, maxSize = 10485760) => {
  return size <= maxSize;
};

module.exports = {
  uploadFileToS3,
  uploadMultipleFilesToS3,
  uploadBase64ImagesToS3,
  uploadBase64ImageToS3,
  deleteFileFromS3,
  validateFileType,
  validateFileSize,
};
