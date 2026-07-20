<h1 align="center">Mr.Wam Onboarding Platform</h1>

<p align="center">
  Dynamic form management for financial services — KYC, loan applications, and investment declarations.
</p>

<p align="center">
  <a href="https://onboarding-frontend.vercel.app">Live Demo</a> ·
  <a href="https://actserv-backend.onrender.com/api/schema/swagger/">API Docs</a> ·
  <a href="docs/SETUP.md">Setup Guide</a>
</p>

---

## Overview

Mr.Wam is a full-stack onboarding platform that enables financial services firms to create, distribute, and manage dynamic forms for client onboarding. Admins build custom forms with a visual configuration interface, share them via unique links, and review submissions with real-time status tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | Django 5.2, Django REST Framework, Celery |
| Database | PostgreSQL (Neon.tech) |
| Cache | Redis (Upstash) |
| Auth | JWT (SimpleJWT) |
| Hosting | Vercel (frontend), Render (backend) |

## Features

- **Dynamic Form Builder** — Admin-configurable forms with JSON schema, supporting text, select, file upload, and currency fields
- **Form Sharing** — Unique slug-based URLs for each form, accessible to authenticated clients
- **Submission Management** — Real-time status tracking (submitted, reviewed, approved, rejected)
- **Escalating Alerts** — Automated email reminders at 5, 8, 10, and 15-day deadlines
- **JWT Authentication** — Secure API access with token refresh
- **Responsive Design** — Mobile-first interface across all screen sizes

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis (for Celery broker)
- PostgreSQL (or SQLite for development)

### Local Development

```bash
# Clone the repository
git clone https://github.com/richiekaroki/actserv-onboarding-platform.git
cd actserv-onboarding-platform

# Start with Docker
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/api/schema/swagger/ |
| Django Admin | http://localhost:8000/admin/ |

### Production

| Service | URL |
|---------|-----|
| Frontend | https://onboarding-frontend.vercel.app |
| Backend | https://actserv-backend.onrender.com |

> **Testing?** An admin account is auto-created on first deploy. Check the backend `create_default_admin` management command in `users/management/commands/` for details.

## API Documentation

The backend exposes a RESTful API documented with Swagger UI and ReDoc.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Obtain JWT tokens |
| POST | `/api/auth/register/` | Register new client |
| GET | `/api/forms/` | List active forms |
| POST | `/api/forms/` | Create form (admin) |
| GET | `/api/submissions/` | List submissions (admin) |
| POST | `/api/submissions/` | Submit form response |
| PATCH | `/api/submissions/{id}/status/` | Update status (admin) |

### Testing with Swagger

1. Navigate to [Django Admin](https://actserv-backend.onrender.com/admin/) and log in
2. Open [Swagger UI](https://actserv-backend.onrender.com/api/schema/swagger/)
3. Test endpoints directly — your browser session is authenticated

## Project Structure

```
actserv-onboarding-platform/
├── backend/
│   ├── actserv_backend/    # Django project settings
│   ├── forms/              # Form & submission models, views, serializers
│   ├── notifications/      # Email alerts & escalation logic
│   └── users/              # Authentication & user management
├── frontend/
│   └── src/
│       ├── app/            # Next.js pages (admin, forms, login)
│       ├── components/     # React components (FormRenderer, Navbar)
│       └── lib/            # API client & utilities
├── docs/                   # Technical documentation
├── docker-compose.yml
├── render.yaml
└── README.md
```

## Documentation

- [SETUP.md](docs/SETUP.md) — Local development & Docker instructions
- [TESTING.md](docs/TESTING.md) — Test suite & coverage reports
- [API_REFERENCE.md](docs/API_REFERENCE.md) — Full endpoint reference

## License

Proprietary — Mr.Wam Ltd
