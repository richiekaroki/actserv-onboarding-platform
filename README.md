# ActServ Onboarding Platform

Creative Dynamic Onboarding Form System for financial services.
Built with Django REST Framework + Next.js + Celery + Redis.

## Quick Start

```bash
git clone https://github.com/richiekaroki/actserv-onboarding-platform.git
cd actserv-onboarding-platform
docker-compose up --build
```

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/api/schema/swagger-ui/
- Admin Panel: http://localhost:8000/admin/

## Key Features

- Dynamic Forms — Admin-configurable forms with JSON schema
- Form Submissions — Client submission with file uploads
- Async Notifications — Celery + Redis email notifications
- JWT Authentication — Secure API access
- API-First Design — Full REST API with Swagger docs
- Professional Testing — 88%+ test coverage with pytest
- Production Ready — PostgreSQL, Docker, scalable architecture

## Tech Stack

- Backend: Django 5.2, Django REST Framework, Celery, Redis
- Frontend: Next.js 15, React, TypeScript
- Database: PostgreSQL (production), SQLite (development)
- Testing: pytest, coverage.py, Django test client
- DevOps: Docker, Docker Compose

## Documentation

See [docs/](docs/) for detailed documentation:

- [SETUP.md](docs/SETUP.md) — Local development & Docker instructions
- [TESTING.md](docs/TESTING.md) — Test suite & coverage reports
- [DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md) — Architecture choices & reasoning
- [DESIGN.md](docs/DESIGN.md) — Design system: colors, typography, components
- [API_REFERENCE.md](docs/API_REFERENCE.md) — Full list of backend endpoints
