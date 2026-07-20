# Setup Instructions

How to set up and run the Mr.Wam Onboarding Platform locally.

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Redis** (for Celery broker)
- **PostgreSQL 14+** (or SQLite for local dev)
- **Git**

Optional: Docker & Docker Compose

---

## Clone Repository

```bash
git clone https://github.com/richiekaroki/actserv-onboarding-platform.git
cd actserv-onboarding-platform
```

---

## Backend Setup

```bash
cd backend
python -m venv .venv

# Linux/Mac
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -e .
```

Create `backend/.env`:

```
SECRET_KEY=your_django_secret_key_here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Run migrations and start:

```bash
python manage.py migrate
python manage.py create_default_admin
python manage.py runserver
```

Backend: http://localhost:8000
API Docs: http://localhost:8000/api/schema/swagger/

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

---

## Docker Setup (Optional)

```bash
docker-compose up --build
```

Services:
- Django backend → http://localhost:8000
- Next.js frontend → http://localhost:3000
- Redis → localhost:6379

---

## Production

| Service | URL | Hosting |
|---------|-----|---------|
| Frontend | https://onboarding-frontend.vercel.app | Vercel |
| Backend | https://actserv-backend.onrender.com | Render |
| Database | Neon.tech PostgreSQL | Neon.tech |
| Cache | Upstash Redis | Upstash |

### Environment Variables (Render)

```
DEBUG=False
SECRET_KEY=<your-production-secret>
DATABASE_URL=postgresql://<neon-connection-string>
REDIS_URL=<upstash-redis-url>
ALLOWED_HOSTS=actserv-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://onboarding-frontend.vercel.app
DEFAULT_FROM_EMAIL=no-reply@actserv.local
ADMIN_NOTIFICATION_EMAILS=admin@actserv.local
```

### Default Admin Credentials

- Email: `admin@actserv.local`
- Password: `admin1234!`

---

## Testing

### Backend

```bash
cd backend
pytest                          # Run all tests
pytest --cov --cov-report=html  # Coverage report
```

### Frontend

```bash
cd frontend
npm run test
```

---

## Notes

- Local dev uses SQLite (no PostgreSQL setup needed)
- Production uses Neon.tech PostgreSQL (free tier, no expiration)
- File uploads stored locally in `backend/media/` (production uses Supabase Storage when configured)
- API documentation available at `/api/schema/swagger/`
