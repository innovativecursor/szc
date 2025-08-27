# SkillzCollab API - Trial Run Guide

This guide will help you test the SkillzCollab API without authentication to create brands and briefs.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js installed
- MySQL database running
- Database `skillzcollab` created

### 2. Database Setup

```sql
-- Connect to MySQL and create database
CREATE DATABASE skillzcollab;
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm start
```

The server will start on port 8080 (as configured in config.yaml).

## 📋 API Endpoints Available

### Health Check

- `GET /health` - Check if the API is running

### Brands

- `GET /api/brands` - Get all brands
- `POST /api/brands` - Create a new brand
- `GET /api/brands/:id` - Get brand by ID
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

### Briefs

- `GET /api/briefs` - Get all briefs
- `POST /api/brands/:brand_id/briefs` - Create a new brief
- `GET /api/briefs/:id` - Get brief by ID
- `PUT /api/briefs/:id` - Update brief


## 🧪 Testing with Postman

### 1. Create a Brand

**Request:**

```
POST http://localhost:8080/api/brands
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Test Brand Inc",
  "contact_email": "test@brandinc.com",
  "registered_office": "123 Test Street, Test City",
  "address": "456 Business Ave, Test City, TC 12345",
  "business_field": "Technology",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://brandinc.com"
}
```

**Expected Response (201):**

```json
{
  "id": "uuid-here",
  "name": "Test Brand Inc",
  "contact_email": "test@brandinc.com",
  "registered_office": "123 Test Street, Test City",
  "address": "456 Business Ave, Test City, TC 12345",
  "business_field": "Technology",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://brandinc.com",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### 2. Create a Brief

**Request:**

```
POST http://localhost:8080/api/briefs
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Design a New Logo",
  "description": "We need a modern, professional logo for our tech startup",
  "is_paid": true,
  "prize_amount": 500.0,
  "submission_deadline": "2024-12-31T23:59:59Z",
  "status": "submission",
  "brand_id": "brand-uuid-from-step-1"
}
```

**Expected Response (201):**

```json
{
  "id": "uuid-here",
  "brand_id": "brand-uuid-from-step-1",
  "title": "Design a New Logo",
  "description": "We need a modern, professional logo for our tech startup",
  "is_paid": true,
  "prize_amount": 500.0,
  "submission_deadline": "2024-12-31T23:59:59Z",
  "voting_start": null,
  "voting_end": null,
  "winner_user_id": null,
  "status": "submission",
  "crm_user_id": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "files": [],
  "tags": []
}
```

## 🔍 Test Script

Run the automated test script to verify everything works:

```bash
node test-trial.js
```

This will:

1. Test the health endpoint
2. Create a test brand
3. Create a test brief
4. Verify all endpoints are working

## 📝 Notes

- **No Authentication Required**: All endpoints are open for the trial run
- **MySQL**: The API is configured to use MySQL (not PostgreSQL)
- **Field Mapping**: Request/response fields use snake_case (e.g., `contact_email`) while the database uses camelCase (e.g., `contactEmail`)
- **UUIDs**: All IDs are UUIDs generated automatically
- **Validation**: Basic validation is in place (required fields, UUID format)

## 🚨 Important

- This is a trial setup with **NO AUTHENTICATION**
- All endpoints are publicly accessible
- Do not use this in production without proper security
- The database will be automatically synchronized when the server starts

## 🔧 Troubleshooting

### Database Connection Issues

- Ensure MySQL is running
- Check database credentials in `api/config/database.js`
- Verify database `skillzcollab` exists
- Default MySQL credentials: username `root`, password `root`

### Port Issues

- Default port is 8080 (from config.yaml)
- Check if port is available: `netstat -an | grep 8080`

### Model Sync Issues

- Check console logs for database sync errors
- Ensure all required models are properly defined

## 📚 Next Steps

After successful trial run:

1. Add authentication middleware
2. Implement proper error handling
3. Add input validation
4. Set up proper logging
5. Configure production environment

---

Happy testing! 🎉
