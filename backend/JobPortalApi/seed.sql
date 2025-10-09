-- Seed data for JobPortalApi (SQLite)
-- Run with: sqlite3 backend/JobPortalApi/jobportal.db < backend/JobPortalApi/seed.sql

BEGIN TRANSACTION;

-- Users (passwords are SHA256 base64 hashes of the plain passwords)
INSERT INTO "Users" ("Id","Name","Email","PasswordHash","Role","CompanyName","Summary","Skills","DefaultResumeId") VALUES
('e7d8f2a1-0000-4a1b-9a1a-111111111111','Larry Dmonte','larry@example.com','75K3eLr+dx6JJFuJ7LwIpEpOFmwGZZkRiB84PURz6U8=','Candidate',NULL,'Experienced full-stack developer','C#,React,SQL',NULL),
('b1a2c3d4-0000-4a1b-9a1a-222222222222','Acme HR','hr@acme.com','N0ShAQOrfv08ooPtPWevWSFoiFSMLKE44nDLQjV87+w=','Employer','Acme Inc.',NULL,NULL,NULL);

-- Jobs
INSERT INTO "Jobs" ("Id","Title","Description","Location","EmployerName","EmployerId","SalaryRange","JobType","WorkMode","Skills","PostedDate") VALUES
('11111111-1111-4111-8111-111111111111','Frontend Developer','Build UI components and pages','Remote','Acme Inc.','b1a2c3d4-0000-4a1b-9a1a-222222222222','$60k-$90k','Full-time','Remote','React,TypeScript', datetime('now')),
('22222222-2222-4222-8222-222222222222','Backend Developer','Design and implement APIs','New York','Acme Inc.','b1a2c3d4-0000-4a1b-9a1a-222222222222','$70k-$110k','Full-time','Onsite','C#,ASP.NET Core', datetime('now'));

-- SavedJobs (Larry saved the Frontend Developer)
INSERT INTO "SavedJobs" ("Id","UserId","JobId","SavedAt") VALUES
('33333333-3333-4333-8333-333333333333','e7d8f2a1-0000-4a1b-9a1a-111111111111','11111111-1111-4111-8111-111111111111', datetime('now'));

COMMIT;
