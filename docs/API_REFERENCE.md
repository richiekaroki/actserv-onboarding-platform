# API Reference

All endpoints are prefixed with `/api/`. Authentication requires JWT Bearer token in the `Authorization` header.

**Production:** `https://actserv-backend.onrender.com`
**Swagger UI:** `https://actserv-backend.onrender.com/api/schema/swagger/`

---

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login/` | Obtain JWT tokens | Public |
| POST | `/api/auth/refresh/` | Refresh access token | Public |
| POST | `/api/auth/verify/` | Verify token is valid | Public |
| POST | `/api/auth/register/` | Register new client | Public |
| GET | `/api/auth/me/` | Get current user profile | JWT |

**Login request:**
```json
POST /api/auth/login/
{
  "username": "admin@actserv.local",
  "password": "admin1234!"
}
```

**Response:**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "admin@actserv.local",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "is_staff": true
  }
}
```

---

## Forms

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/forms/` | List forms | Public |
| POST | `/api/forms/` | Create form | Admin |
| GET | `/api/forms/{slug}/` | Get form by slug | Public |
| PATCH | `/api/forms/{slug}/` | Update form | Admin |
| DELETE | `/api/forms/{slug}/` | Delete form | Admin |

---

## Fields (nested under forms)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/forms/{slug}/fields/` | List fields for a form | Public |
| POST | `/api/forms/{slug}/fields/` | Create a field | Admin |
| DELETE | `/api/forms/{slug}/fields/{id}/` | Delete a field | Admin |

---

## Submissions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/submissions/` | Create submission | Public |
| GET | `/api/submissions/` | List submissions | Admin |
| GET | `/api/submissions/{id}/` | Get submission details | Admin |
| POST | `/api/submissions/{id}/upload/` | Upload file to submission | JWT |
| PATCH | `/api/submissions/{id}/status/` | Update status | Admin |

**Submission statuses:** `submitted` → `reviewed` → `approved` or `rejected`

---

## Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications/` | List notifications | JWT |
| GET | `/api/notifications/{id}/` | Get notification | JWT |
| PATCH | `/api/notifications/{id}/` | Mark as read | JWT |
| POST | `/api/notifications/mark-all-read/` | Mark all as read | JWT |

---

## API Documentation

- **Swagger UI:** `/api/schema/swagger/`
- **ReDoc:** `/api/schema/redoc/`
- **OpenAPI Schema:** `/api/schema/`

To access Swagger UI, first login at `/admin/` to create a session, then visit the Swagger URL.
