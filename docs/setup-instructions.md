Setup Instructions

These instructions explain how to set up and run the Creative Dynamic Onboarding Form System locally.
The project consists of a Django REST Framework backend and a Next.js frontend, with Celery for async tasks.

1. Prerequisites

Make sure you have the following installed on your system:

Python 3.10+

Node.js 18+

npm
 or yarn

Redis
 (for Celery broker)

PostgreSQL 14+

(SQLite can be used locally for quick testing, but PostgreSQL is the intended production DB.)

Git

Optional but recommended:

Docker & Docker Compose

2. Clone Repository
git clone https://github.com/<your-username>/actserv-onboarding-platform.git
cd actserv-onboarding-platform

3. Backend Setup (Django + DRF)
Create and activate virtual environment
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

Install dependencies
pip install -r requirements.txt

Environment variables

Create a .env file inside backend/:

SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/actserv_db
REDIS_URL=redis://localhost:6379/0
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

Database setup
python manage.py migrate
python manage.py createsuperuser

Run backend server
python manage.py runserver


The API will be available at:
👉 http://localhost:8000/api/

4. Celery Worker

Open a new terminal, activate the virtual environment, and run:

cd backend
celery -A actserv_backend worker -l info


This will listen for new submission notifications.

5. Frontend Setup (Next.js)
cd ../frontend
npm install
npm run dev


The frontend will be available at:
👉 http://localhost:3000/

6. Running with Docker (optional)

If using Docker, ensure Docker and Docker Compose are installed, then run:

docker-compose up --build


This will start:

Django backend (port 8000)

Next.js frontend (port 3000)

PostgreSQL (port 5432)

Redis (port 6379)

7. Testing
Backend (Django)
cd backend
pytest   # or: python manage.py test

Frontend (Next.js)
cd frontend
npm run test

8. Demo Script

Log in as admin → create a form (e.g., KYC form with file upload).

Visit client form page → fill details, upload file, submit.

Verify:

Submission appears in backend.

File is uploaded.

Celery worker logs show admin notification.

9. Notes

Default file uploads are stored in backend/media/.

For production, configure storage in .env (e.g., AWS S3).

This project uses PostgreSQL for production but supports SQLite for quick local testing.