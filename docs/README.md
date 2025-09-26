Actserv Onboarding Platform

Welcome to the Actserv Onboarding Platform project.
This platform is built with Django (backend), Celery + Redis (async tasks/notifications), and Next.js (frontend) — all containerized with Docker.

⚙️ Tech Stack

Backend: Django 5 + Django REST Framework

Frontend: Next.js 15 (React 19, Turbopack) + TailwindCSS

Async Tasks: Celery 5 + Redis

Database (optional): PostgreSQL (commented for now, can be enabled later)

Containerization: Docker & Docker Compose

Dev Tools: ESLint, TypeScript, Hot Reload

🚀 Development Setup

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/actserv-onboarding-platform.git

cd actserv-onboarding-platform

2. Build & start services
   docker-compose up --build

3. Access services

Frontend (Next.js): http://localhost:3000

Backend (Django): http://localhost:8000

Redis (Cache/Tasks): localhost:6379

🛠 Development Workflow
Backend commands
docker exec -it actserv_backend python manage.py migrate
docker exec -it actserv_backend python manage.py createsuperuser
docker exec -it actserv_backend python manage.py makemigrations

Frontend commands
docker exec -it actserv_frontend npm install package-name
docker exec -it actserv_frontend npm run build

Logs
docker logs -f actserv_backend
docker logs -f actserv_frontend
docker logs -f actserv_celery

📂 Project Structure
backend/ # Django backend
frontend/ # Next.js frontend
docs/ # Documentation
docker-compose.yml

🧹 Clean & Rebuild

If you want to free up space and rebuild fresh:

docker-compose down
docker system prune -a
docker-compose up --build

Status (Day 1)

Backend, Frontend, Celery, Redis running in Docker

PostgreSQL ready but disabled for now

Hot reload enabled for local dev

Base .gitignore and Alpine images (lightweight)
