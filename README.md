# After the Draft

A full-stack anonymous letter platform built with React, Vite, Tailwind CSS, Django REST Framework and SQLite (PostgreSQL-ready).

> Some words deserve a place, even if they never get sent.

## What's included

- Editorial, responsive React experience with Home, Explore, Write, Letter detail, About, Guidelines and Privacy pages.
- Anonymous letter submissions saved as **pending**.
- Public API only exposes approved letters.
- Django admin moderation: approve, reject and review submissions.
- Emotion filtering, search, pagination, random and featured letters.
- Anonymous appreciation and reporting endpoints.
- SQLite for a simple local setup; PostgreSQL can be enabled with environment variables.
- Demo seed command with clearly fictional sample letters.

## Requirements

- Node.js 20+
- Python 3.11+ (Python 3.12 is a safe choice for a fresh environment)
- VS Code

## 1. Backend setup (Mac)

Open a terminal at the project root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo
python manage.py runserver
```

Backend: http://127.0.0.1:8000  
Admin: http://127.0.0.1:8000/admin/

Use the superuser credentials you just created to review pending letters.

### Python note

If your system Python 3.14 has dependency compatibility issues, install Python 3.12 and create the virtual environment with `python3.12 -m venv .venv`.

## 2. Frontend setup

Open a **second terminal** at the project root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the localhost URL printed by Vite (normally http://localhost:5173).

## 3. Use the app

1. Browse approved sample letters.
2. Submit a letter from **Write a letter**.
3. It is saved as pending and does not appear publicly.
4. Open Django admin at `/admin/`, sign in and approve it.
5. Refresh Explore; the approved letter appears.

## 4. Optional PostgreSQL

Install PostgreSQL and create a database/user. Then set these variables in `backend/.env` (copy `.env.example`):

```env
DB_NAME=after_the_draft
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

Install the optional driver with `pip install psycopg[binary]`. The project uses PostgreSQL when `DB_NAME` is set; otherwise it uses SQLite.

## API

- `GET /api/letters/` — approved letters; supports `?emotion=love&search=...&ordering=-published_at&page=1`
- `POST /api/letters/` — submit a pending letter
- `GET /api/letters/<uuid>/` — approved letter detail
- `GET /api/letters/random/` — random approved letter
- `GET /api/letters/featured/` — featured approved letters
- `GET /api/emotions/` — emotion categories
- `POST /api/letters/<uuid>/appreciate/` — anonymous appreciation
- `POST /api/reports/` — report a letter

## Important launch checklist

This is a working local full-stack foundation, not a finished production deployment. Before opening it to the public:
- Add a proper privacy notice and retention policy that matches your hosting/logging setup.
- Configure HTTPS, production secrets, allowed hosts, CORS and CSRF trusted origins.
- Add CAPTCHA or another anti-spam measure and stronger abuse/rate-limit controls.
- Establish a real human moderation process and response times.
- Test deletion/removal requests and backups.
- Use managed PostgreSQL and deploy frontend/backend separately.
- Review legal, safety and age-appropriate policies for your intended audience.

The platform does not ask for author names or email addresses. Hosting providers may still process technical connection data; do not promise absolute anonymity.
