# Portfolio & Creative API Documentation

## Overview

The Portfolio & Creative API provides comprehensive CRUD operations for managing user portfolios and creative works. This API follows a nested route structure where portfolios belong to users and creatives belong to portfolios.

## Base URL

```
http://localhost:3000/api
```

## Portfolio API Endpoints

### 1. Get All Portfolios

**GET** `/portfolios`

Retrieve all portfolios with optional filtering.

**Query Parameters:**

- `user_id` (optional): Filter portfolios by user ID

**Response:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "My Creative Portfolio",
    "description": "A collection of my best creative work",
    "like_count": 0,
    "files": [],
    "created_at": "2025-01-27T10:00:00.000Z",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "creatives_count": 0,
    "creatives": []
  }
]
```

### 2. Get Portfolios by User

**GET** `/portfolios/users/{user_id}`

Retrieve all portfolios for a specific user.

**Path Parameters:**

- `user_id`: User ID (UUID)

**Response:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "My Creative Portfolio",
    "description": "A collection of my best creative work",
    "like_count": 0,
    "files": [],
    "created_at": "2025-01-27T10:00:00.000Z",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "creatives_count": 2,
    "creatives": [
      {
        "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
        "title": "Amazing Creative Work",
        "created_at": "2025-01-27T10:30:00.000Z"
      }
    ]
  }
]
```

### 3. Create Portfolio for User

**POST** `/portfolios/users/{user_id}`

Create a new portfolio for a specific user.

**Path Parameters:**

- `user_id`: User ID (UUID)

**Request Body (multipart/form-data):**

- `title` (required): Portfolio title
- `description` (optional): Portfolio description
- `files` (optional): Portfolio files (images, videos, documents)

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/portfolios/users/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -F "title=My Creative Portfolio" \
  -F "description=A collection of my best creative work" \
  -F "files=@portfolio-image.jpg"
```

**Response (201 Created):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "My Creative Portfolio",
  "description": "A collection of my best creative work",
  "files": [
    {
      "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      "filename": "portfolio-image.jpg",
      "size": 1024000,
      "type": "image/jpeg",
      "url": "https://s3.amazonaws.com/bucket/portfolios/portfolio-image.jpg",
      "hash": "abc123def456"
    }
  ],
  "created_at": "2025-01-27T10:00:00.000Z",
  "portfolio_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 4. Get Portfolio by User and ID

**GET** `/portfolios/users/{user_id}/{portfolio_id}`

Retrieve a specific portfolio for a user.

**Path Parameters:**

- `user_id`: User ID (UUID)
- `portfolio_id`: Portfolio ID (UUID)

**Response:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "My Creative Portfolio",
  "description": "A collection of my best creative work",
  "like_count": 0,
  "files": [],
  "created_at": "2025-01-27T10:00:00.000Z",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "creatives_count": 2,
  "creatives": [
    {
      "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "title": "Amazing Creative Work",
      "description": "This is my best creative piece",
      "created_at": "2025-01-27T10:30:00.000Z"
    }
  ]
}
```

### 5. Update Portfolio for User

**PATCH** `/portfolios/users/{user_id}/{portfolio_id}`

Update a portfolio for a specific user.

**Path Parameters:**

- `user_id`: User ID (UUID)
- `portfolio_id`: Portfolio ID (UUID)

**Request Body (multipart/form-data):**

- `title` (optional): New portfolio title
- `description` (optional): New portfolio description
- `files` (optional): New portfolio files

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/api/portfolios/users/3fa85f64-5717-4562-b3fc-2c963f66afa6/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -F "title=Updated Portfolio Title" \
  -F "description=Updated portfolio description" \
  -F "files=@new-portfolio-image.jpg"
```

**Response:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Updated Portfolio Title",
  "description": "Updated portfolio description",
  "files": [
    {
      "id": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
      "filename": "new-portfolio-image.jpg",
      "size": 2048000,
      "type": "image/jpeg",
      "url": "https://s3.amazonaws.com/bucket/portfolios/new-portfolio-image.jpg",
      "hash": "def456ghi789"
    }
  ],
  "created_at": "2025-01-27T10:00:00.000Z",
  "portfolio_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 6. Delete Portfolio for User

**DELETE** `/portfolios/users/{user_id}/{portfolio_id}`

Delete a portfolio for a specific user. This will cascade delete all associated creatives.

**Path Parameters:**

- `user_id`: User ID (UUID)
- `portfolio_id`: Portfolio ID (UUID)

**Response:**

- `204 No Content` on successful deletion

## Creative API Endpoints

### 1. Get All Creatives

**GET** `/creatives`

Retrieve all creatives with optional filtering.

**Query Parameters:**

- `portfolio_id` (optional): Filter creatives by portfolio ID
- `user_id` (optional): Filter creatives by user ID (through portfolios)

**Response:**

```json
[
  {
    "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    "title": "Amazing Creative Work",
    "description": "This is my best creative piece",
    "files": [],
    "created_at": "2025-01-27T10:30:00.000Z",
    "portfolio_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "portfolio": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "My Creative Portfolio",
      "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
  }
]
```

### 2. Get Creatives by Portfolio

**GET** `/creatives/portfolios/{portfolio_id}`

Retrieve all creatives for a specific portfolio.

**Path Parameters:**

- `portfolio_id`: Portfolio ID (UUID)

**Response:**

```json
[
  {
    "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    "title": "Amazing Creative Work",
    "description": "This is my best creative piece",
    "files": [],
    "created_at": "2025-01-27T10:30:00.000Z",
    "portfolio_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
]
```

### 3. Create Creative in Portfolio

**POST** `/creatives/portfolios/{portfolio_id}`

Create a new creative in a specific portfolio.

**Path Parameters:**

- `portfolio_id`: Portfolio ID (UUID)

**Request Body (multipart/form-data):**

- `title` (required): Creative title
- `description` (optional): Creative description
- `files` (optional): Creative files (images, videos, documents)

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/creatives/portfolios/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -F "title=Amazing Creative Work" \
  -F "description=This is my best creative piece" \
  -F "files=@creative-image.jpg"
```

**Response (201 Created):**

```json
{
  "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
  "title": "Amazing Creative Work",
  "description": "This is my best creative piece",
  "files": [
    {
      "id": "7fa85f64-5717-4562-b3fc-2c963f66afa0",
      "filename": "creative-image.jpg",
      "size": 1536000,
      "type": "image/jpeg",
      "url": "https://s3.amazonaws.com/bucket/creatives/creative-image.jpg",
      "hash": "ghi789jkl012"
    }
  ],
  "created_at": "2025-01-27T10:30:00.000Z",
  "portfolio_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 4. Get Creative by Portfolio and ID

**GET** `/creatives/portfolios/{portfolio_id}/{creative_id}`

Retrieve a specific creative from a portfolio.

**Path Parameters:**

- `portfolio_id`: Portfolio ID (UUID)
- `creative_id`: Creative ID (UUID)

**Response:**

```json
{
  "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
  "title": "Amazing Creative Work",
  "description": "This is my best creative piece",
  "files": [],
  "created_at": "2025-01-27T10:30:00.000Z",
  "portfolio_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 5. Update Creative in Portfolio

**PATCH** `/creatives/portfolios/{portfolio_id}/{creative_id}`

Update a creative in a specific portfolio.

**Path Parameters:**

- `portfolio_id`: Portfolio ID (UUID)
- `creative_id`: Creative ID (UUID)

**Request Body (multipart/form-data):**

- `title` (optional): New creative title
- `description` (optional): New creative description
- `files` (optional): New creative files

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/api/creatives/portfolios/3fa85f64-5717-4562-b3fc-2c963f66afa6/4fa85f64-5717-4562-b3fc-2c963f66afa7" \
  -F "title=Updated Creative Title" \
  -F "description=Updated creative description" \
  -F "files=@new-creative-image.jpg"
```

**Response:**

```json
{
  "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
  "title": "Updated Creative Title",
  "description": "Updated creative description",
  "files": [
    {
      "id": "8fa85f64-5717-4562-b3fc-2c963f66afa1",
      "filename": "new-creative-image.jpg",
      "size": 2560000,
      "type": "image/jpeg",
      "url": "https://s3.amazonaws.com/bucket/creatives/new-creative-image.jpg",
      "hash": "jkl012mno345"
    }
  ],
  "created_at": "2025-01-27T10:30:00.000Z",
  "portfolio_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 6. Delete Creative from Portfolio

**DELETE** `/creatives/portfolios/{portfolio_id}/{creative_id}`

Delete a creative from a specific portfolio.

**Path Parameters:**

- `portfolio_id`: Portfolio ID (UUID)
- `creative_id`: Creative ID (UUID)

**Response:**

- `204 No Content` on successful deletion

## Data Models

### Portfolio Object

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string",
  "like_count": "number",
  "files": "array of file objects",
  "created_at": "string (ISO date)",
  "user_id": "string (UUID)",
  "creatives_count": "number",
  "creatives": "array of creative objects"
}
```

### Creative Object

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string",
  "files": "array of file objects",
  "created_at": "string (ISO date)",
  "portfolio_id": "string (UUID)"
}
```

### File Object

```json
{
  "id": "string (UUID)",
  "filename": "string",
  "size": "number",
  "type": "string (MIME type)",
  "url": "string (S3 URL)",
  "hash": "string (file hash)"
}
```

## File Upload Support

Both Portfolio and Creative APIs support `multipart/form-data` for file uploads:

- **File Types**: Images (PNG, JPG, JPEG, WebP, TIFF, BMP, GIF), Videos (MP4, AVI, MOV, WMV, FLV, WebM, MKV), Documents (PDF, DOC, PPT, XLS)
- **File Size Limit**: 10MB per file
- **Max Files**: Up to 10 files per request
- **Storage**: Files are uploaded to AWS S3 and URLs are returned

## Business Rules

1. **Portfolios**: Each user can have multiple portfolios
2. **Creatives**: Each portfolio can contain multiple creatives
3. **File Management**: Files are replaced when updating (not appended)
4. **Cascade Deletion**: Deleting a portfolio removes all associated creatives
5. **User Ownership**: Users can only manage their own portfolios and creatives

## Error Handling

All endpoints return consistent error responses:

```json
{
  "code": 400,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Testing

Use the provided test script to verify API functionality:

```bash
node test-portfolio-creative-api.js
```

## Examples

### Frontend JavaScript (Portfolio Creation)

```javascript
const createPortfolio = async (userId, title, description, files) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`/api/portfolios/users/${userId}`, {
    method: "POST",
    body: formData,
  });

  return response.json();
};
```

### Frontend JavaScript (Creative Creation)

```javascript
const createCreative = async (portfolioId, title, description, files) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`/api/creatives/portfolios/${portfolioId}`, {
    method: "POST",
    body: formData,
  });

  return response.json();
};
```

## Notes

- All IDs are UUIDs
- Timestamps are in ISO 8601 format
- File uploads support high-resolution images and videos up to 10MB
- The API automatically handles file validation and S3 upload
- Portfolio deletion cascades to remove all associated creatives
