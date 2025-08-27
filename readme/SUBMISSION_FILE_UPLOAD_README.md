# Submission File Upload Guide

This guide explains how to upload high-resolution images and videos for submissions using the SkillzCollab API.

## 🚀 **File Upload Support**

### **Supported File Types:**

- **Images**: PNG, JPG, JPEG, SVG, WebP, TIFF, BMP, GIF
- **Videos**: MP4, AVI, MOV, WMV, FLV, WebM, MKV
- **Documents**: PDF, Word, PowerPoint, Excel

### **File Size Limits:**

- **Maximum file size**: 10MB per file
- **Maximum files per submission**: 10 files
- **Total submission size**: Up to 100MB

## 📤 **How to Upload Files**

### **Method 1: Multipart Form Data (Recommended for Large Files)**

Use `multipart/form-data` to upload files directly:

```bash
curl -X POST "http://localhost:3000/api/briefs/{brief_id}/submissions" \
  -H "Content-Type: multipart/form-data" \
  -F "user_id=3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -F "description=My creative submission with high-res images" \
  -F "files=@design.png" \
  -F "files=@video.mp4"
```

### **Method 2: JavaScript/Node.js Example**

```javascript
const FormData = require("form-data");
const fs = require("fs");

const form = new FormData();
form.append("user_id", "3fa85f64-5717-4562-b3fc-2c963f66afa6");
form.append("description", "My creative submission");
form.append("files", fs.createReadStream("./design.png"));
form.append("files", fs.createReadStream("./video.mp4"));

const response = await fetch(
  "http://localhost:3000/api/briefs/{brief_id}/submissions",
  {
    method: "POST",
    body: form,
  }
);
```

### **Method 3: Frontend JavaScript Example**

```javascript
const formData = new FormData();
formData.append("user_id", "3fa85f64-5717-4562-b3fc-2c963f66afa6");
formData.append("description", "My creative submission");

// Add multiple files
const fileInput = document.getElementById("fileInput");
for (let file of fileInput.files) {
  formData.append("files", file);
}

const response = await fetch("/api/briefs/{brief_id}/submissions", {
  method: "POST",
  body: formData,
});
```

## 🔧 **API Endpoint Details**

### **POST** `/api/briefs/{brief_id}/submissions`

**Request Headers:**

```
Content-Type: multipart/form-data
```

**Form Fields:**

- `user_id` (required): UUID of the user submitting
- `description` (optional): Text description of the submission
- `files` (required): Array of files (up to 10 files)

**Response Format:**

```json
{
  "id": "submission-uuid",
  "created_at": "2024-01-15T10:30:00Z",
  "brief_id": "brief-uuid",
  "user_id": "user-uuid",
  "description": "My creative submission",
  "is_finalist": false,
  "is_winner": false,
  "likes": 0,
  "votes": 0,
  "files": [
    {
      "id": "file-uuid",
      "filename": "design.png",
      "size": 5242880,
      "type": "image/png",
      "url": "https://s3.amazonaws.com/bucket/submissions/file-uuid.png",
      "hash": "md5-hash-here"
    }
  ]
}
```

## 📁 **File Processing Flow**

1. **File Upload**: Files are uploaded via multer middleware
2. **Validation**: File type and size are validated
3. **S3 Upload**: Files are uploaded to AWS S3
4. **Database Storage**: File metadata is stored in the submission
5. **Response**: Submission with file URLs is returned

## ⚠️ **Important Notes**

### **File Validation:**

- Files are automatically validated for type and size
- Invalid files will return a 400 error
- Files exceeding 10MB will return a 413 error

### **S3 Storage:**

- Files are stored in the `submissions/` folder in S3
- Each file gets a unique UUID filename
- Original filenames are preserved in metadata

### **Security:**

- File types are strictly validated
- File sizes are limited to prevent abuse
- Files are scanned for malicious content

## 🚨 **Error Handling**

### **Common Error Responses:**

**400 - Bad Request:**

```json
{
  "code": 400,
  "message": "user_id is required"
}
```

**413 - Payload Too Large:**

```json
{
  "code": 413,
  "message": "File too large. Maximum file size is 10MB."
}
```

**500 - Internal Server Error:**

```json
{
  "code": 500,
  "message": "Failed to upload files. Please try again."
}
```

## 💡 **Best Practices**

1. **File Optimization**: Compress images/videos before upload
2. **Multiple Files**: Upload related files together in one submission
3. **Descriptions**: Provide clear descriptions for better context
4. **File Naming**: Use descriptive filenames for easier management

## 🔄 **Legacy Support**

The API still supports the old JSON format for backward compatibility:

```json
{
  "brief_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "description": "string",
  "files": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "filename": "string",
      "size": 0,
      "type": "image/png",
      "url": "string",
      "hash": "string"
    }
  ]
}
```

However, for high-resolution images and videos, **multipart form data is strongly recommended**.
