# Job Portal Website

Professional job portal project with an ASP.NET Core backend (EF Core + SQLite) and a React + Vite frontend. The repository contains API controllers, Razor Pages for server-side flows, and a modern SPA for candidates and employers.

---

## Features

- RESTful API (ASP.NET Core) for jobs, applications, resumes, and saved jobs
- React + Vite frontend with routing, authentication, and responsive components
- Hybrid UI: SPA (JWT) + Razor Pages (cookie auth) for admin/employer flows
- File uploads (resumes) and file serving from `/uploads`
- Pagination, filtering, saved searches scaffold, and application lifecycle (Applied → InReview → Interview → Offer → Accepted/Rejected)

## Quick start (development)

Requirements
- .NET 8 SDK
- Node.js (16+)
- sqlite3 (optional but recommended for seeding)

1. Install frontend deps

```powershell
npm install
```

2. Run backend

```powershell
cd backend/JobPortalApi
dotnet run
```

The backend will create the SQLite file `backend/JobPortalApi/jobportal.db` and apply EF migrations on first run.

3. Run frontend

```powershell
cd ..\..
npm run dev
```

Open http://localhost:5173 (default Vite port) and http://localhost:5000 for the API (port is logged at startup).

## Seeding the database (optional)

We provide a `seed.sql` file to create sample users and jobs without committing a binary DB file.

To import seed data into the local SQLite DB (ensure backend is stopped):

```powershell
# create an empty DB and apply migrations (if needed)
cd backend/JobPortalApi
# Option A: let EF create the DB on dotnet run, then import seed
# Option B: import directly with sqlite3
sqlite3 jobportal.db < seed.sql
```

Default test credentials in the seed file:
- Candidate: larry@example.com / password123
- Employer: hr@acme.com / employerpass

## Authentication model

- SPA (React): uses JWTs returned by `/api/auth/login`. The token is stored in `localStorage` and sent as `Authorization: Bearer <token>` by axios.
- Razor Pages (server): uses cookie authentication. The server sets a cookie when users sign in through server-side pages (e.g., `/Account/Register`).

If you want SPA logins to also create the cookie for Razor Pages, a cookie-login endpoint can be added on the server and called from the SPA after successful login.

## Repository notes

- The SQLite binary file is ignored in `.gitignore`. Instead, use `seed.sql` or EF migrations to recreate data.
- Transient SQLite files (`*.db-shm`, `*.db-wal`) are not checked into git.

## Common commands

- Frontend dev: `npm run dev`
- Backend dev: `cd backend/JobPortalApi; dotnet run`
- Seed DB: `sqlite3 backend/JobPortalApi/jobportal.db < backend/JobPortalApi/seed.sql`

