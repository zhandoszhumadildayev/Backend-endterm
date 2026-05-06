# Children's Literacy Learning Platform

Full-stack endterm project: a Duolingo ABC-inspired literacy learning platform with a production-style REST API and a minimal React frontend.

## Stack

- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT access tokens + refresh tokens, bcrypt password hashing
- **Docs:** Swagger UI at `/api/docs`
- **Async feature:** scheduled cron job for daily streak reminders
- **Frontend:** React + Vite
- **Tests:** Jest + Supertest
- **DevOps:** Docker Compose + GitHub Actions CI

## Main features

- Parent registration/login
- Admin and parent role-based access control
- Child profile CRUD with strict ownership checks
- Curriculum hierarchy: Units → Lessons → Exercises
- Exercise submission and lesson completion
- XP, levels, streaks, badges, leaderboard
- Parent notifications
- Admin activity logs and platform stats
- Pagination, filtering and sorting on list endpoints
- Swagger/OpenAPI documentation

## Demo accounts after seed

```text
Admin:
email: admin@literacy.kz
password: Admin12345!

Parent:
email: parent@literacy.kz
password: Parent12345!
```

## Run with Docker Compose

```bash
cp .env .env
docker compose up --build
```

Then open:

```text
Backend API:     http://localhost:5000
Swagger UI:      http://localhost:5000/api/docs
Frontend:        http://localhost:5173
PostgreSQL:      localhost:5432
```

## Run locally without Docker

### 1. Start PostgreSQL

Create a database named `literacy_db` and use the connection string from `backend/.env.example`.

### 2. Backend

```bash
cd backend
cp .env .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp .env .env
npm install
npm run dev
```

## Run tests

```bash
cd backend
npm test
npm run test:coverage
```

## Important API endpoints

| Area | Endpoint | Method | Role |
|---|---|---:|---|
| Auth | `/api/v1/auth/register` | POST | Public |
| Auth | `/api/v1/auth/login` | POST | Public |
| Auth | `/api/v1/auth/refresh` | POST | Public |
| Children | `/api/v1/children` | GET/POST | Parent/Admin |
| Progress | `/api/v1/children/{id}/progress` | GET | Parent/Admin |
| Curriculum | `/api/v1/units` | GET/POST | Auth/Admin create |
| Curriculum | `/api/v1/lessons` | GET/POST | Auth/Admin create |
| Exercises | `/api/v1/lessons/{id}/exercises` | GET/POST | Auth/Admin create |
| Learning | `/api/v1/exercises/{id}/submit` | POST | Parent/Admin |
| Learning | `/api/v1/lessons/{id}/complete` | POST | Parent/Admin |
| Notifications | `/api/v1/notifications` | GET | Parent/Admin |
| Leaderboard | `/api/v1/leaderboard` | GET | Auth |
| Admin | `/api/v1/admin/logs` | GET | Admin |
| Admin | `/api/v1/admin/stats` | GET | Admin |

## Environment variables

See `.env.example` and `backend/.env.example`.

## CI badge

Replace `YOUR_GITHUB_USERNAME/YOUR_REPO` with your real GitHub path after uploading:

```md
![CI](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)
```

## Deployment notes

Recommended deployment:

1. Create PostgreSQL database in Railway or Render.
2. Deploy backend from `/backend`.
3. Set environment variables from `backend/.env.example`.
4. Run Prisma migration command on deploy: `npx prisma migrate deploy`.
5. Deploy frontend from `/frontend` to Vercel.
6. Set `VITE_API_URL` to your backend URL.

## AI usage disclosure

AI tools were used to plan and generate the initial project structure, code examples, documentation, and explanation materials. The team must review, test, understand, and adjust the implementation before submission and defence.
