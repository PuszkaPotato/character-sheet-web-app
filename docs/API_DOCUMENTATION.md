# API Documentation

Complete REST API reference for the DnD Character Sheet backend.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Auth Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (6-100 chars)"
}
```

**Response:** `200 OK`
```json
{
  "userId": "uuid",
  "username": "string",
  "email": "string",
  "token": "jwt-token",
  "expiresAt": "2025-02-20T18:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Email already registered or username taken
- `400 Bad Request` - Validation errors

---

#### POST /auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "userId": "uuid",
  "username": "string",
  "email": "string",
  "token": "jwt-token",
  "expiresAt": "2025-02-20T18:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### Character Endpoints

All character endpoints require authentication.

#### POST /characters
Create a new character.

**Request Body:**
```json
{
  "name": "string (1-100 chars)",
  "data": {
    // Complete CharacterData object (see DATABASE_SCHEMA.md)
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "string",
  "data": { /* character data */ },
  "createdAt": "2025-02-20T12:00:00Z",
  "updatedAt": "2025-02-20T12:00:00Z"
}
```

---

#### GET /characters
Get all characters for the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "string",
    "data": { /* character data */ },
    "createdAt": "2025-02-20T12:00:00Z",
    "updatedAt": "2025-02-20T12:00:00Z"
  }
]
```

---

#### GET /characters/:id
Get a specific character by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "string",
  "data": { /* character data */ },
  "createdAt": "2025-02-20T12:00:00Z",
  "updatedAt": "2025-02-20T12:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Character doesn't exist or doesn't belong to user

---

#### PUT /characters/:id
Update an existing character.

**Request Body:**
```json
{
  "name": "string (optional)",
  "data": { /* character data (optional) */ }
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "string",
  "data": { /* updated character data */ },
  "createdAt": "2025-02-20T12:00:00Z",
  "updatedAt": "2025-02-20T15:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Character doesn't exist or doesn't belong to user

---

#### DELETE /characters/:id
Delete a character.

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Character doesn't exist or doesn't belong to user

---

### Theme Endpoints (Future Phase)

#### POST /themes
Create a custom theme.

#### GET /themes
Get all public themes or user's themes.

#### GET /themes/:id
Get a specific theme.

#### DELETE /themes/:id
Delete user's theme.

---

## Error Response Format

All errors follow this structure:
```json
{
  "message": "Error description",
  "statusCode": 400
}
```

### HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Validation error or invalid request
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

---

## Rate Limiting (Future)

- Auth endpoints: 5 requests per minute per IP
- Character endpoints: 60 requests per minute per user

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Character
```bash
curl -X POST http://localhost:5000/api/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Gandalf","data":{...}}'
```

### Get All Characters
```bash
curl -X GET http://localhost:5000/api/characters \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
