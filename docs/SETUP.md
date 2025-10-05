# Setup Instructions

These instructions explain how to set up and run the Creative Dynamic Onboarding Form System locally.  
The project consists of a Django REST Framework backend and a Next.js frontend, with Celery for async tasks.

---

## 1. Prerequisites

Make sure you have the following installed on your system:

- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**
- **Redis** (for Celery broker)
- **PostgreSQL 14+** (SQLite can be used locally for quick testing)
- **Git**

**Optional but recommended:**

- Docker & Docker Compose

---

## 2. Clone Repository

```bash
git clone https://github.com/richiekaroki/actserv-onboarding-platform.git
cd actserv-onboarding-platform
3. Backend Setup (Django + DRF)
Create and activate virtual environment
bash
cd backend
python -m venv .venv

# Linux/Mac:
source .venv/bin/activate

# Windows:
.venv\Scripts\activate
Install dependencies
bash
pip install -r requirements.txt
Environment variables
Create a .env file inside backend/:

env
SECRET_KEY=your_django_secret_key_here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
Database setup
bash
python manage.py migrate
python manage.py createsuperuser
Run backend server
bash
python manage.py runserver
👉 API available at: http://localhost:8000/api/

4. Celery Worker
Open a new terminal, activate the virtual environment, and run:

bash
cd backend
celery -A actserv_backend worker -l info
This will listen for new submission notifications.

5. Frontend Setup (Next.js)
bash
cd ../frontend
npm install
npm run dev
👉 Frontend available at: http://localhost:3000/

6. Running with Docker (Optional)
If using Docker, ensure Docker and Docker Compose are installed, then run:

bash
docker-compose up --build
This will start:

Django backend (port 8000)

Next.js frontend (port 3000)

PostgreSQL (port 5432)

Redis (port 6379)

7. Testing
Backend Tests
bash
cd backend

# Run all tests
pytest

# Run with coverage report
pytest --cov --cov-report=term-missing

# Generate HTML coverage report
pytest --cov --cov-report=html
# Then open: htmlcov/index.html
Frontend Tests
bash
cd frontend
npm run test
8. Demo Script
Log in as admin → http://localhost:8000/admin/

Create a form (e.g., KYC form with file upload) via /api/forms/

Visit client form page → fill details, upload file, submit

Verify:

Submission appears in backend

File is uploaded to backend/media/

Celery worker logs show admin notification

9. Notes
Default file uploads are stored in backend/media/

For production, configure storage in .env (e.g., AWS S3)

This project uses PostgreSQL for production but supports SQLite for quick local testing

API documentation available at: http://localhost:8000/api/schema/swagger-ui/

```
