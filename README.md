# Team Task Manager

A full-stack, enterprise task and team management platform built with a modular Flask REST API backend and a React + Vite + Tailwind CSS frontend orchestrated via Docker Compose.

---

## 1. Architecture & Design Principles

```
                  ┌──────────────────────────────────────────────┐
                  │          Browser Client (React SPA)          │
                  │   Vite + Tailwind CSS + Lucide + Context     │
                  └──────────────────────┬───────────────────────┘
                                         │
                   HTTPS / HTTP Requests │ Cookies: access_token_cookie,
                                         │          csrf_access_token
                                         │ Header:  X-CSRF-TOKEN (on mutations)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             Flask REST API (WSGI)            │
                  │  Application Factory + Marshmallow + JWT     │
                  ├──────────────────────────────────────────────┤
                  │   /api/auth     │  /api/projects │ /api/tasks│
                  └──────────────────────┬───────────────────────┘
                                         │
                                         │ SQLAlchemy 2.x (psycopg 3)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             PostgreSQL 17 Database           │
                  │  Users, Projects, ProjectMembers, Tasks      │
                  └──────────────────────────────────────────────┘
```

### Core Architecture Highlights
- **Decoupled Monorepo Structure**: Independent backend and frontend codebases sharing container orchestration and environment conventions.
- **Stateless & Secure Authentication**: JWTs stored strictly inside `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies, mitigating XSS token theft.
- **Double-Submit CSRF Protection**: Flask-JWT-Extended CSRF token cookies paired with client-side header injection (`X-CSRF-TOKEN`) for all state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Strict Role-Based Authorization**: Hierarchical roles per workspace (`owner`, `admin`, `member`) enforced server-side per `docs/rules.md`.
- **Database Migrations & Typing**: Schema tracked with Flask-Migrate (Alembic) using SQLAlchemy 2.0 mapped types and naming conventions.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.11+, Flask 3.1, Flask-SQLAlchemy 3.1, Flask-Migrate 4.1, Flask-JWT-Extended 4.7, Marshmallow 4.0, Psycopg 3.2 |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3.4, React Router 6, PostCSS, Autoprefixer |
| **Database** | PostgreSQL 17 (Alpine) |
| **Orchestration** | Docker, Docker Compose, Nginx (Alpine) |
| **Testing** | Pytest, Flask Test Client |

---

## 3. Repository Directory Layout

```text
Team_Task_Manager/
├── .dockerignore                 # Production build exclusion rules
├── .env.example                  # Environment configuration template
├── .gitignore                    # Version control exclusions
├── docker-compose.yml            # Multi-service stack (db, api, frontend)
├── README.md                     # Monorepo architecture & setup guide
├── backend/                      # Flask REST API service
│   ├── Dockerfile                # Container definition for backend API
│   ├── requirements.txt          # Pinned backend dependencies
│   ├── wsgi.py                   # Production WSGI application entry point
│   ├── app/                      # Application package
│   │   ├── __init__.py           # Application factory (create_app)
│   │   ├── config.py             # Typed environment configuration
│   │   ├── extensions.py         # SQLAlchemy, JWTManager, Migrate instances
│   │   ├── auth/                 # Authentication blueprint & routes
│   │   ├── models/               # SQLAlchemy models (User, Project, Task, etc.)
│   │   ├── projects/             # Projects blueprint & membership routes
│   │   ├── schemas/              # Marshmallow serialization & validation schemas
│   │   └── tasks/                # Tasks blueprint & routes
│   ├── migrations/               # Alembic database migration scripts
│   ├── scripts/                  # Management scripts (e.g., SQLite importer)
│   └── tests/                    # Pytest test suite & conftest scaffolding
│       ├── conftest.py           # Shared fixtures & test database setup
│       └── test_health.py        # API health check test suite
├── docs/                         # Architecture & operational guides
│   ├── rules.md                  # Authorization policy & rules of truth
│   └── sqlite-migration.md       # Legacy database migration documentation
└── frontend/                     # React + Vite + Tailwind CSS SPA
    ├── Dockerfile                # Multi-stage production build (Node -> Nginx)
    ├── nginx.conf                # Production Nginx reverse-proxy & SPA routing
    ├── package.json              # Frontend scripts & dependencies
    ├── vite.config.js            # Vite configuration with API proxy
    ├── tailwind.config.js        # Tailwind styling configuration
    ├── postcss.config.js         # PostCSS plugins
    ├── index.html                # Single-page HTML entry point
    └── src/                      # React source code
        ├── main.jsx              # DOM root mount
        ├── App.jsx               # Application router & protected routes
        ├── index.css             # Tailwind base and design utilities
        ├── api/                  # API client with automated CSRF handling
        ├── components/           # UI components (Navbar, Cards, Badges)
        ├── context/              # Context providers (AuthContext)
        ├── hooks/                # Custom React hooks (useAuth)
        └── pages/                # Application views (Dashboard, Login, Projects)
```

---

## 4. Getting Started & Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- Docker Desktop with Docker Compose

### Step 1: Environment Setup
Copy the environment template into `.env`:

```bash
cp .env.example .env
```

Ensure secrets in `.env` are set to strong random values:
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `DATABASE_URL` (Defaults to `postgresql+psycopg://task_manager:task_manager@localhost:55432/task_manager`)

### Step 2: Database Initialization
Start the PostgreSQL container:

```bash
docker compose up -d db
```

Run database migrations to apply the initial schema:

```bash
# Windows PowerShell
$env:PYTHONPATH = "backend"
.\venv\Scripts\python.exe -m flask --app wsgi db upgrade
```

### Step 3: Run the Backend API
```bash
# Windows PowerShell
$env:PYTHONPATH = "backend"
$env:APP_ENV = "development"
.\venv\Scripts\python.exe -m flask --app wsgi run --port 5000 --debug
```
API Health Check: `GET http://localhost:5000/api/health`

### Step 4: Run the Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. API requests to `/api/*` are automatically proxied to the backend on port 5000.

---

## 5. Docker Compose Full-Stack Deployment

Launch the entire stack (PostgreSQL 17, Flask API, and Nginx-backed React frontend) with a single command:

```bash
docker compose up -d --build
```

### Services & Ports
- **Frontend SPA**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000`
- **PostgreSQL 17**: `localhost:55432`

---

## 6. Testing

The backend test suite utilizes Pytest and an isolated in-memory SQLite database:

```bash
# Windows PowerShell
$env:PYTHONPATH = "backend"
.\venv\Scripts\python.exe -m pytest backend/tests
```

---

## 7. Legacy Codebase Reference

The legacy pre-React prototype codebase has been cleanly decommissioned and archived under the Git tag:
- **Git Tag**: `legacy-v1-pre-react` (commit `9208e57`)
- To view or extract historical assets:
  ```bash
  git checkout legacy-v1-pre-react
  ```
