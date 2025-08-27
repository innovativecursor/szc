# Brief Creation with File Uploads

This document explains how to use the new multipart/form-data functionality for creating briefs with file uploads.

## Overview

The brief creation endpoint now supports two content types:

1. **`application/json`** - For creating briefs without file attachments
2. **`multipart/form-data`** - For creating briefs with file uploads

## API Endpoint

```
POST /api/briefs
```

## Content Types

### 1. JSON Only (No Files)

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "title": "Creative Design Brief",
  "description": "We need a creative design for our brand campaign",
  "is_paid": true,
  "prize_amount": 5000,
  "submission_deadline": "2025-02-15T23:59:59Z",
  "voting_start": "2025-02-16T00:00:00Z",
  "voting_end": "2025-02-20T23:59:59Z",
  "status": "draft",
  "crm_user_id": "00000000-0000-0000-0000-000000000000",
  "tags": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "design",
      "description": "Creative design work"
    }
  ]
}
```

### 2. Multipart/Form-Data (With Files)

**Content-Type:** `multipart/form-data`

**Form Fields:**

- **`brief`** (required): JSON string containing brief data
- **`files`** (optional): Array of files to upload

**Example using cURL:**

```bash
curl -X POST http://localhost:8080/api/briefs \
  -F "brief={\"title\":\"Design Brief\",\"description\":\"Creative design needed\",\"status\":\"draft\"}" \
  -F "files=@image1.png" \
  -F "files=@image2.jpg" \
  -F "files=@logo.svg"
```

**Example using JavaScript/Node.js:**

```javascript
const FormData = require("form-data");
const fs = require("fs");

const form = new FormData();

// Add brief data as JSON string
const briefData = {
  title: "Creative Design Brief",
  description: "We need a creative design for our brand campaign",
  is_paid: true,
  prize_amount: 5000,
  status: "draft",
};

form.append("brief", JSON.stringify(briefData));

// Add files
form.append("files", fs.createReadStream("image1.png"));
form.append("files", fs.createReadStream("image2.jpg"));

// Make request
const response = await axios.post("http://localhost:8080/api/briefs", form, {
  headers: {
    ...form.getHeaders(),
  },
});
```

## File Requirements

### Supported File Types

- **Images:** PNG, JPG, JPEG, SVG
- **Maximum file size:** 100MB per file
- **Maximum files:** 10 files per request

### File Validation

The API automatically validates:

- File type (MIME type)
- File size
- Number of files

## File Storage

Files are automatically uploaded to AWS S3 and the following information is stored in the brief:

- File ID (UUID)
- Original filename
- File size
- MIME type
- S3 URL
- MD5 hash for integrity

## Response Format

**Success Response (201 Created):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "brand_id": null,
  "title": "Creative Design Brief",
  "description": "We need a creative design for our brand campaign",
  "is_paid": true,
  "prize_amount": 5000,
  "submission_deadline": "2025-02-15T23:59:59Z",
  "voting_start": "2025-02-16T00:00:00Z",
  "voting_end": "2025-02-20T23:59:59Z",
  "winner_user_id": null,
  "status": "draft",
  "crm_user_id": "00000000-0000-0000-0000-000000000000",
  "created_at": "2025-01-27T10:30:00.000Z",
  "files": [
    {
      "id": "file-uuid-1",
      "filename": "image1.png",
      "size": 1024000,
      "type": "image/png",
      "url": "https://s3.amazonaws.com/bucket/briefs/file-uuid-1.png",
      "hash": "md5-hash-here"
    }
  ],
  "tags": []
}
```

## Error Handling

### File Validation Errors

- **400 Bad Request:** Invalid file type
- **413 Payload Too Large:** File too large or too many files
- **500 Internal Server Error:** File upload to S3 failed

### Brief Validation Errors

- **400 Bad Request:** Missing required fields or invalid data
- **500 Internal Server Error:** Database or server error

## Environment Variables

Make sure these environment variables are set for S3 uploads:

```bash
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=skillz-collab
```

## Testing

Use the provided test script to test the functionality:

```bash
node test-brief-upload.js
```

This script tests:

1. Brief creation with files
2. Brief creation without files
3. File validation

## Notes

- Files are stored in the `briefs/` folder in S3
- File URLs are public and accessible
- File hashes are generated using MD5 for integrity checking
- The API supports both single and multiple file uploads
- Files are processed asynchronously and uploaded to S3 before creating the brief
