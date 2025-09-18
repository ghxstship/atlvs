# GHXSTSHIP API Documentation

## Authentication

All API endpoints require authentication via Supabase session cookies or Authorization header.

### Authentication Endpoints

#### POST /api/v1/auth/signin
Sign in with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "session": { ... }
}
```

#### POST /api/v1/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/v1/auth/signout
Sign out the current user.

## Users

#### GET /api/v1/users
Get all users (paginated).

#### POST /api/v1/users
Create a new user.

#### GET /api/v1/users/[id]
Get user by ID.

#### PUT /api/v1/users/[id]
Update user by ID.

#### DELETE /api/v1/users/[id]
Delete user by ID.

## Projects

#### GET /api/v1/projects
Get all projects for the authenticated user.

#### POST /api/v1/projects
Create a new project.

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Project description",
  "status": "active"
}
```

## Resources

#### GET /api/v1/resources
Get all resources.

#### POST /api/v1/resources
Create a new resource.

## Analytics

#### GET /api/v1/analytics/dashboard
Get dashboard analytics data.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
