# Authentication System Documentation

## Overview

The SkillzCollab platform implements a comprehensive authentication system that supports both traditional email/password authentication and Google OAuth. The system uses JWT (JSON Web Tokens) for secure session management and implements role-based access control (RBAC) to manage user permissions.

## Features

### 🔐 Authentication Methods

- **Basic Auth**: Email/password registration and login
- **Google OAuth**: Social login via Google accounts
- **JWT Tokens**: Secure, stateless authentication
- **Role-Based Access Control**: User, Admin, and Super Admin roles

### 🛡️ Security Features

- Password hashing with bcrypt
- JWT token expiration and refresh
- CSRF protection for OAuth flows
- Input validation and sanitization
- Rate limiting (configurable)

## API Endpoints

### Authentication Routes

#### User Registration

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "roles": "user",
      "isVerified": false
    },
    "token": "jwt_token",
    "expiresAt": 1234567890
  }
}
```

#### User Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresAt": 1234567890
  }
}
```

#### Google OAuth Initiation

```http
GET /api/auth/oauth/google
```

**Response:**

```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/auth?...",
    "state": "csrf_token"
  }
}
```

#### Google OAuth Callback

```http
GET /api/auth/oauth/google/callback?code=...&state=...
```

**Response:**

```json
{
  "success": true,
  "message": "OAuth authentication successful",
  "data": {
    "user": { ... },
    "token": "jwt_token",
    "expiresAt": 1234567890
  }
}
```

#### Token Refresh

```http
POST /api/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "refresh_token"
}
```

#### Profile Management

```http
GET /api/auth/profile
PUT /api/auth/profile
```

**Headers Required:**

```
Authorization: Bearer <jwt_token>
```

#### Password Change

```http
POST /api/auth/change-password
```

**Headers Required:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

#### Logout

```http
POST /api/auth/logout
```

**Headers Required:**

```
Authorization: Bearer <jwt_token>
```

## User Roles and Permissions

### Role Hierarchy

1. **Super Admin** (`super_admin`)

   - Full system access
   - Can manage all users and content
   - System configuration access

2. **Admin** (`admin`)

   - User management
   - Content moderation
   - Brand and brief management

3. **User** (`user`)
   - Create submissions
   - Manage portfolios
   - Upload creatives
   - Basic profile management

### Permission Matrix

| Resource    | User                            | Admin      | Super Admin |
| ----------- | ------------------------------- | ---------- | ----------- |
| Profile     | Read/Write                      | Read/Write | Read/Write  |
| Submissions | Create/Read/Update/Delete (own) | All        | All         |
| Portfolios  | Create/Read/Update/Delete (own) | All        | All         |
| Creatives   | Upload to own portfolios        | All        | All         |
| Users       | Read (public info)              | All        | All         |
| Brands      | Read                            | All        | All         |
| Briefs      | Read                            | All        | All         |
| System      | None                            | Limited    | Full        |

## JWT Token Structure

### Access Token Payload

```json
{
  "userId": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": "user",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "https://skillzcollab.com",
  "aud": "https://skillzcollab.com"
}
```

### Refresh Token Payload

```json
{
  "userId": "uuid",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "https://skillzcollab.com",
  "aud": "https://skillzcollab.com"
}
```

## Configuration

### JWT Configuration

```yaml
auth:
  jwt:
    signing_key: "your-secret-key-here"
    verification_key: "your-verification-key-here"
    access_token_validity: "1h"
    refresh_token_validity: "7d"
    issuer: "https://skillzcollab.com"
    audience: "https://skillzcollab.com"
    algorithm: "HS256"
```

### Google OAuth Configuration

```yaml
auth:
  oauth:
    client_id: "your-google-client-id"
    secret: "your-google-client-secret"
    redirect_url: "http://localhost:8080/api/auth/oauth/google/callback"
    scopes:
      - "https://www.googleapis.com/auth/userinfo.email"
      - "https://www.googleapis.com/auth/userinfo.profile"
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT UUID(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255), -- NULL for OAuth users
  display_name VARCHAR(100),
  bio TEXT,
  profile_image_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  phone_number VARCHAR(20),
  alternate_email VARCHAR(100),
  social_links JSON,
  google_id VARCHAR(100) UNIQUE, -- For OAuth users
  roles ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  followed_tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Considerations

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Token Security

- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Tokens are signed with secure keys
- JWT claims include issuer and audience validation

### OAuth Security

- CSRF protection with state parameter
- Nonce for replay attack prevention
- Secure redirect URI validation
- Limited scope access

## Error Handling

### Common Error Codes

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `409`: Conflict (user already exists)
- `500`: Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Testing

### Running Authentication Tests

```bash
# Install test dependencies
npm install --save-dev mocha chai

# Run authentication tests
node testcases/test-auth-system.js
```

### Test Coverage

- User registration and validation
- Login with valid/invalid credentials
- JWT token authentication
- Profile management
- Password changes
- Token refresh
- Role-based access control
- OAuth flow (manual testing)

## Integration Examples

### Frontend Integration (JavaScript)

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem("token", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }
  return data;
};

// Authenticated request
const getProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

### Mobile App Integration

```javascript
// Store tokens securely
import AsyncStorage from "@react-native-async-storage/async-storage";

const storeTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
};

// Use in API calls
const apiCall = async (endpoint) => {
  const token = await AsyncStorage.getItem("accessToken");
  const response = await fetch(`/api${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
```

## Troubleshooting

### Common Issues

1. **Token Expired**

   - Use refresh token to get new access token
   - Redirect to login if refresh fails

2. **OAuth Errors**

   - Check redirect URI configuration
   - Verify Google OAuth credentials
   - Ensure proper scopes are configured

3. **Permission Denied**

   - Verify user role
   - Check resource ownership
   - Review RBAC configuration

4. **Database Connection Issues**
   - Verify database configuration
   - Check migration status
   - Ensure proper indexes exist

### Debug Mode

Enable debug logging in configuration:

```yaml
logging:
  level: debug
  format: json
```

## Best Practices

### For Developers

1. Always validate JWT tokens on protected routes
2. Use HTTPS in production
3. Implement proper error handling
4. Log authentication attempts
5. Use environment variables for secrets

### For Users

1. Use strong, unique passwords
2. Enable two-factor authentication when available
3. Keep tokens secure
4. Log out from shared devices
5. Report suspicious activity

## Future Enhancements

### Planned Features

- Two-factor authentication (2FA)
- Passwordless authentication
- Social login providers (Facebook, LinkedIn)
- Session management dashboard
- Advanced audit logging
- Multi-tenant authentication

### Security Improvements

- Rate limiting per IP/user
- Advanced threat detection
- Biometric authentication support
- Hardware security key support

## Support

For authentication system support:

- Check the logs for detailed error messages
- Review the configuration files
- Test with the provided test suite
- Contact the development team for complex issues

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintainer**: SkillzCollab Development Team
