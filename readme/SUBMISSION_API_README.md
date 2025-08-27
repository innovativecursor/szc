# Submission API Documentation

## Overview

The Submission API allows users to submit creative work in response to briefs. Submissions are organized by brief ID and include file attachments, descriptions, and metadata.

## API Endpoints

### 1. Get Submissions by Brief ID

**GET** `/api/briefs/{brief_id}/submissions`

Retrieves all submissions for a specific brief.

**URL Parameters:**

- `brief_id` (UUID, required): The ID of the brief

**Response Format:**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2025-08-27T17:26:48.896Z",
    "brief_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "description": "string",
    "is_finalist": true,
    "is_winner": true,
    "likes": 0,
    "votes": 0,
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
]
```

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/briefs/3fa85f64-5717-4562-b3fc-2c963f66afa6/submissions"
```

### 2. Create Submission by Brief ID

**POST** `/api/briefs/{brief_id}/submissions`

Creates a new submission for a specific brief.

**URL Parameters:**

- `brief_id` (UUID, required): The ID of the brief

**Request Body:**

```json
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "description": "My creative submission",
  "files": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
      "filename": "design.png",
      "size": 1024,
      "type": "image/png",
      "url": "https://example.com/design.png",
      "hash": "abc123hash"
    }
  ]
}
```

**Required Fields:**

- `user_id`: UUID of the user submitting
- `files`: Array of file objects (must contain at least one file)

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/briefs/3fa85f64-5717-4562-b3fc-2c963f66afa6/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "description": "My creative submission",
    "files": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "filename": "design.png",
        "size": 1024,
        "type": "image/png",
        "url": "https://example.com/design.png",
        "hash": "abc123hash"
      }
    ]
  }'
```

### 3. Get Individual Submission by Brief ID

**GET** `/api/briefs/{brief_id}/submissions/{submission_id}`

Retrieves a specific submission for a specific brief.

**URL Parameters:**

- `brief_id` (UUID, required): The ID of the brief
- `submission_id` (UUID, required): The ID of the submission

**Response Format:**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "created_at": "2025-08-27T17:26:48.896Z",
  "brief_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "description": "string",
  "is_finalist": true,
  "is_winner": true,
  "likes": 0,
  "votes": 0,
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

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/briefs/3fa85f64-5717-4562-b3fc-2c963f66afa6/submissions/3fa85f64-5717-4562-b3fc-2c963f66afa7"
```

### 4. Update Submission by Brief ID

**PATCH** `/api/briefs/{brief_id}/submissions/{submission_id}`

Updates a specific submission for a specific brief.

**URL Parameters:**

- `brief_id` (UUID, required): The ID of the brief
- `submission_id` (UUID, required): The ID of the submission

**Request Body (all fields optional):**

```json
{
  "description": "Updated description",
  "is_finalist": true,
  "is_winner": false,
  "likes": 5,
  "votes": 10,
  "files": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
      "filename": "updated-design.png",
      "size": 2048,
      "type": "image/png",
      "url": "https://example.com/updated-design.png",
      "hash": "def456hash"
    }
  ]
}
```

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/api/briefs/3fa85f64-5717-4562-b3fc-2c963f66afa6/submissions/3fa85f64-5717-4562-b3fc-2c963f66afa7" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "is_finalist": true
  }'
```

### 5. Delete Submission by Brief ID

**DELETE** `/api/briefs/{brief_id}/submissions/{submission_id}`

Deletes a specific submission for a specific brief (only if it hasn't been submitted).

**URL Parameters:**

- `brief_id` (UUID, required): The ID of the brief
- `submission_id` (UUID, required): The ID of the submission

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/briefs/3fa85f64-5717-4562-b3fc-2c963f66afa6/submissions/3fa85f64-5717-4562-b3fc-2c963f66afa7"
```

### 6. Get All Submissions

**GET** `/api/submissions`

Retrieves all submissions with optional filtering.

**Query Parameters:**

- `briefId` (UUID, optional): Filter by brief ID
- `creativeId` (UUID, optional): Filter by user/creative ID
- `status` (string, optional): Filter by status

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/submissions?briefId=3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

### 7. Get Submission by ID

**GET** `/api/submissions/{id}`

Retrieves a specific submission by its ID.

**URL Parameters:**

- `id` (UUID, required): The submission ID

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/submissions/3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

### 8. Create Submission (Legacy Route)

**POST** `/api/submissions`

Creates a new submission (legacy route - kept for backward compatibility).

**Request Body:**

```json
{
  "brief_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "description": "My creative submission",
  "files": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
      "filename": "design.png",
      "size": 1024,
      "type": "image/png",
      "url": "https://example.com/design.png",
      "hash": "abc123hash"
    }
  ]
}
```

**Required Fields:**

- `brief_id`: UUID of the brief
- `user_id`: UUID of the user submitting
- `files`: Array of file objects (must contain at least one file)

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "brief_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "description": "My creative submission",
    "files": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "filename": "design.png",
        "size": 1024,
        "type": "image/png",
        "url": "https://example.com/design.png",
        "hash": "abc123hash"
      }
    ]
  }'
```

### 9. Update Submission (Legacy Route)

**PATCH** `/api/submissions/{id}`

Updates an existing submission (legacy route).

**URL Parameters:**

- `id` (UUID, required): The submission ID

**Request Body (all fields optional):**

```json
{
  "description": "Updated description",
  "is_finalist": true,
  "is_winner": false,
  "likes": 5,
  "votes": 10,
  "files": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
      "filename": "updated-design.png",
      "size": 2048,
      "type": "image/png",
      "url": "https://example.com/updated-design.png",
      "hash": "def456hash"
    }
  ]
}
```

**Example Request:**

```bash
curl -X PATCH "http://localhost:3000/api/submissions/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "is_finalist": true
  }'
```

### 10. Delete Submission (Legacy Route)

**DELETE** `/api/submissions/{id}`

Deletes a submission (legacy route - only if it hasn't been submitted).

**URL Parameters:**

- `id` (UUID, required): The submission ID

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/submissions/3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

## Data Model

### Submission Fields

| Field         | Type      | Description                      | Required            |
| ------------- | --------- | -------------------------------- | ------------------- |
| `id`          | UUID      | Unique identifier                | Auto-generated      |
| `brief_id`    | UUID      | Reference to brief               | Yes                 |
| `user_id`     | UUID      | Reference to user                | Yes                 |
| `description` | TEXT      | Submission description           | No                  |
| `files`       | JSON      | Array of file objects            | Yes                 |
| `is_finalist` | BOOLEAN   | Whether submission is a finalist | No (default: false) |
| `is_winner`   | BOOLEAN   | Whether submission is the winner | No (default: false) |
| `likes`       | INTEGER   | Number of likes                  | No (default: 0)     |
| `votes`       | INTEGER   | Number of votes                  | No (default: 0)     |
| `created_at`  | TIMESTAMP | Creation timestamp               | Auto-generated      |
| `updated_at`  | TIMESTAMP | Last update timestamp            | Auto-generated      |

### File Object Fields

| Field      | Type    | Description            | Required |
| ---------- | ------- | ---------------------- | -------- |
| `id`       | UUID    | Unique file identifier | Yes      |
| `filename` | STRING  | Name of the file       | Yes      |
| `size`     | INTEGER | File size in bytes     | Yes      |
| `type`     | STRING  | MIME type              | Yes      |
| `url`      | STRING  | File access URL        | Yes      |
| `hash`     | STRING  | File integrity hash    | Yes      |

## Error Responses

All endpoints return consistent error responses:

```json
{
  "code": 400,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `204` - No Content (for DELETE operations)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

Use the provided test script to verify the API:

```bash
node test-submission-api.js
```

Make sure the server is running on `http://localhost:3000` before running tests.

## Notes

- All UUIDs must be in valid UUID v4 format
- File arrays must contain at least one file
- Submissions cannot be deleted once their status is "submitted"
- The API automatically sets `likes` and `votes` to 0 for new submissions
- Timestamps are automatically managed by the system
- **Preferred routes**: Use `/api/briefs/{brief_id}/submissions` for all CRUD operations
- **Legacy routes**: `/api/submissions` endpoints are kept for backward compatibility
- **Security**: Nested routes validate that submissions belong to the specified brief
