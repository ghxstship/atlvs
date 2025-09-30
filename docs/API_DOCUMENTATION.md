# 📚 API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.ghxstship.com`  
**Last Updated:** September 30, 2025

---

## Authentication

All API requests require authentication using Bearer tokens.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.ghxstship.com/v1/projects
```

### Getting a Token

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

## Endpoints

### Health Check

```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2025-09-30T10:00:00Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### Projects

#### List Projects

```bash
GET /api/v1/projects
Authorization: Bearer TOKEN

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: string (active|archived)

Response:
{
  "data": [
    {
      "id": "proj_123",
      "name": "My Project",
      "description": "Project description",
      "status": "active",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

#### Get Project

```bash
GET /api/v1/projects/:id
Authorization: Bearer TOKEN

Response:
{
  "id": "proj_123",
  "name": "My Project",
  "description": "Project description",
  "status": "active",
  "members": [
    {
      "id": "user_456",
      "name": "John Doe",
      "role": "owner"
    }
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### Create Project

```bash
POST /api/v1/projects
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description"
}

Response: 201 Created
{
  "id": "proj_789",
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "createdAt": "2025-09-30T10:00:00Z",
  "updatedAt": "2025-09-30T10:00:00Z"
}
```

#### Update Project

```bash
PUT /api/v1/projects/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Updated Project",
  "description": "Updated description"
}

Response: 200 OK
{
  "id": "proj_123",
  "name": "Updated Project",
  "description": "Updated description",
  "status": "active",
  "updatedAt": "2025-09-30T10:00:00Z"
}
```

#### Delete Project

```bash
DELETE /api/v1/projects/:id
Authorization: Bearer TOKEN

Response: 204 No Content
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Limit:** 1000 requests per hour per user
- **Headers:**
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Pagination

All list endpoints support pagination:

```bash
GET /api/v1/projects?page=2&limit=20

Response:
{
  "data": [...],
  "total": 100,
  "page": 2,
  "pageSize": 20,
  "totalPages": 5
}
```

---

## Webhooks

Subscribe to events:

```bash
POST /api/v1/webhooks
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks",
  "events": ["project.created", "project.updated"]
}
```

### Webhook Events

- `project.created`
- `project.updated`
- `project.deleted`
- `member.added`
- `member.removed`

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @ghxstship/sdk
```

```typescript
import { GhxstshipClient } from '@ghxstship/sdk'

const client = new GhxstshipClient({ token: 'YOUR_TOKEN' })

const projects = await client.projects.list()
```

### Python

```bash
pip install ghxstship
```

```python
from ghxstship import Client

client = Client(token='YOUR_TOKEN')
projects = client.projects.list()
```

---

## Support

- **Documentation:** https://docs.ghxstship.com
- **API Status:** https://status.ghxstship.com
- **Support:** api@ghxstship.com
