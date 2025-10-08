# JobPortalApi (ASP.NET Core)

Simple backend for the Job Portal frontend. Implements:

- POST /auth/register
- POST /auth/login
- GET /jobs
- GET /jobs/{id}
- POST /jobs (authorized)
- PUT /jobs/{id} (authorized)
- DELETE /jobs/{id} (authorized)
- POST /applications (authorized, multipart/form-data)
- GET /applications/job/{jobId} (authorized)
- GET /applications/my (authorized)

How to run

1. Ensure you have .NET 9 SDK (or matching installed runtime) installed.
2. From this folder run:

```powershell
cd backend\JobPortalApi
dotnet restore
dotnet run
```

By default the API runs on https://localhost:5001 and http://localhost:5000. Point your frontend `VITE_API_BASE_URL` to the appropriate URL, e.g.: `VITE_API_BASE_URL=http://localhost:5000/api`.

Persistence
- The backend now uses a file-based SQLite DB for development. The DB file is created at `backend/JobPortalApi/jobportal.db` in the project folder. Data will persist between restarts.

Notes
- This uses an in-memory database and simple SHA256 password hashing for demo purposes only. For production use, replace with a persistent DB and a secure password hashing algorithm (e.g. bcrypt) and rotate JWT keys.
- Uploaded resumes are stored in `uploads/` under the API project root.
