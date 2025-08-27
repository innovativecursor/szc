# Reactions API Documentation

This document describes the Reactions API endpoints for the SkillzCollab platform. Users can react to submissions with various reaction types.

## 🎯 **Overview**

The Reactions API allows users to express their feelings about creative submissions using different reaction types. Each user can have one reaction per submission, and reactions can be updated or deleted.

## 🚀 **API Endpoints**

### **Base URL**
```
http://localhost:3000/api/reactions
```

## 📋 **Endpoints**

### **1. Get All Reactions**
- **URL**: `GET /api/reactions`
- **Description**: Retrieve all reactions with optional filtering
- **Query Parameters**:
  - `submission_id` (optional): Filter by submission ID
  - `user_id` (optional): Filter by user ID
  - `reaction` (optional): Filter by reaction type

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reactions?submission_id=3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

**Response:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2025-08-27T18:57:15.992Z",
    "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "reaction": "like"
  }
]
```

### **2. Get Reactions by Submission**
- **URL**: `GET /api/reactions/submission/{submission_id}`
- **Description**: Retrieve all reactions for a specific submission
- **Path Parameters**:
  - `submission_id`: Submission ID (UUID)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reactions/submission/3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

**Response:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2025-08-27T18:57:15.992Z",
    "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "reaction": "like"
  }
]
```

### **3. Create Reaction**
- **URL**: `POST /api/reactions/submission/{submission_id}`
- **Description**: Create a new reaction on a submission
- **Path Parameters**:
  - `submission_id`: Submission ID (UUID)
- **Request Body**:
  ```json
  {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "reaction": "like"
  }
  ```

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/reactions/submission/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "reaction": "love"
  }'
```

**Response:**
```json
{
  "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
  "created_at": "2025-08-27T18:57:15.992Z",
  "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reaction": "love"
}
```

**Note**: If a user already has a reaction on a submission, it will be updated instead of creating a new one.

### **4. Get Reaction by ID**
- **URL**: `GET /api/reactions/{reaction_id}`
- **Description**: Retrieve a specific reaction by ID
- **Path Parameters**:
  - `reaction_id`: Reaction ID (UUID)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reactions/5fa85f64-5717-4562-b3fc-2c963f66afa8"
```

**Response:**
```json
{
  "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
  "created_at": "2025-08-27T18:57:15.992Z",
  "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reaction": "love"
}
```

### **5. Update Reaction**
- **URL**: `PATCH /api/reactions/{reaction_id}`
- **Description**: Update an existing reaction
- **Path Parameters**:
  - `reaction_id`: Reaction ID (UUID)
- **Request Body**:
  ```json
  {
    "reaction": "wow"
  }
  ```

**Example Request:**
```bash
curl -X PATCH "http://localhost:3000/api/reactions/5fa85f64-5717-4562-b3fc-2c963f66afa8" \
  -H "Content-Type: application/json" \
  -d '{
    "reaction": "wow"
  }'
```

**Response:**
```json
{
  "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
  "created_at": "2025-08-27T18:57:15.992Z",
  "submission_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reaction": "wow"
}
```

### **6. Delete Reaction**
- **URL**: `DELETE /api/reactions/{reaction_id}`
- **Description**: Delete a reaction
- **Path Parameters**:
  - `reaction_id`: Reaction ID (UUID)

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/reactions/5fa85f64-5717-4562-b3fc-2c963f66afa8"
```

**Response:**
- **Status**: 204 No Content
- **Body**: Empty

## 🎭 **Reaction Types**

The API supports the following reaction types:

| Reaction | Description |
|----------|-------------|
| `like`   | Like/Thumbs up |
| `love`   | Love/Heart |
| `wow`    | Wow/Surprised |
| `haha`   | Haha/Laugh |
| `sad`    | Sad/Crying |
| `angry`  | Angry/Mad |

## 📊 **Data Model**

### **Reaction Object**
```json
{
  "id": "string (UUID)",
  "created_at": "string (ISO 8601 date)",
  "submission_id": "string (UUID)",
  "user_id": "string (UUID)",
  "reaction": "string (enum)"
}
```

### **Database Schema**
```sql
CREATE TABLE reactions (
  id CHAR(36) PRIMARY KEY,
  submission_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  reaction ENUM('like', 'love', 'wow', 'haha', 'sad', 'angry') NOT NULL DEFAULT 'like',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_user_submission_reaction (submission_id, user_id),
  INDEX idx_reactions_submission_id (submission_id),
  INDEX idx_reactions_user_id (user_id)
);
```

## 🔒 **Business Rules**

1. **One Reaction Per User Per Submission**: Each user can only have one reaction per submission
2. **Reaction Updates**: If a user tries to create a reaction on a submission they already reacted to, the existing reaction is updated
3. **Cascade Deletion**: When a submission or user is deleted, their associated reactions are automatically deleted
4. **Validation**: All UUIDs must be valid, and reaction types must be from the allowed enum values

## 🚨 **Error Handling**

### **Common HTTP Status Codes**

| Status | Description |
|--------|-------------|
| 200    | Success |
| 201    | Created |
| 204    | No Content (Delete) |
| 400    | Bad Request (Invalid data) |
| 404    | Not Found |
| 500    | Internal Server Error |

### **Error Response Format**
```json
{
  "code": 400,
  "message": "Invalid reaction type. Must be one of: like, love, wow, haha, sad, angry"
}
```

### **Common Error Scenarios**

1. **Invalid UUID Format**: Returns 400 for malformed UUIDs
2. **Missing Required Fields**: Returns 400 for missing user_id or reaction
3. **Invalid Reaction Type**: Returns 400 for unsupported reaction types
4. **Resource Not Found**: Returns 404 for non-existent submissions, users, or reactions

## 🧪 **Testing**

### **Run Tests**
```bash
# Install dependencies
npm install axios

# Run the test suite
node test-reactions-api.js
```

### **Test Coverage**
The test suite covers:
- ✅ All CRUD operations
- ✅ Different reaction types
- ✅ Validation error handling
- ✅ Edge cases and error scenarios

## 🔗 **Related Endpoints**

- **Submissions**: `/api/briefs/{brief_id}/submissions`
- **Users**: `/api/users`
- **Briefs**: `/api/briefs`

## 📝 **Notes**

- **Authentication**: Currently open for trial run (no authentication required)
- **Rate Limiting**: No rate limiting implemented yet
- **Caching**: No caching implemented yet
- **Pagination**: No pagination implemented yet (returns all results)

## 🚀 **Future Enhancements**

- [ ] Add authentication and authorization
- [ ] Implement rate limiting
- [ ] Add reaction analytics and insights
- [ ] Support for reaction categories
- [ ] Bulk reaction operations
- [ ] Reaction notifications
- [ ] Reaction history tracking
