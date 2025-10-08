using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/applications")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ApplicationsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Apply([FromForm] Guid jobId, IFormFile resume, [FromForm] string? answersJson)
    {
        var job = _db.Jobs.Find(jobId);
        if (job == null) return BadRequest(new { message = "Job not found" });

        if (resume == null || resume.Length == 0) return BadRequest(new { message = "Resume required" });

        var uploads = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(resume.FileName)}";
        var filePath = Path.Combine(uploads, fileName);
        using (var stream = System.IO.File.Create(filePath))
        {
            await resume.CopyToAsync(stream);
        }

        // Determine candidate id from the JWT claims to prevent spoofing
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var candidateGuid))
            return Unauthorized();
        // Prevent duplicate applications by the same candidate for the same job
        var already = _db.Applications.Any(a => a.JobId == jobId && a.CandidateId == candidateGuid);
        if (already)
        {
            return Conflict(new { message = "You have already applied to this job" });
        }
        var application = new Application
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            CandidateId = candidateGuid,
            ResumePath = fileName,
            AppliedAt = DateTime.UtcNow
        };

        _db.Applications.Add(application);
        _db.SaveChanges();

        // If candidate supplied answers JSON, parse and save them
        if (!string.IsNullOrEmpty(answersJson))
        {
            try
            {
                var ans = System.Text.Json.JsonSerializer.Deserialize<List<AnswerSubmission>>(answersJson);
                if (ans != null)
                {
                    foreach (var a in ans)
                    {
                        var answer = new Answer
                        {
                            Id = Guid.NewGuid(),
                            QuestionId = a.QuestionId,
                            CandidateId = candidateGuid,
                            Response = a.Response
                        };
                        _db.Answers.Add(answer);
                    }
                    _db.SaveChanges();
                }
            }
            catch { /* ignore parsing errors for now */ }
        }

        return Ok(new { message = "Application submitted" });
    }

    [Authorize]
    [HttpGet("job/{jobId}")]
    public IActionResult GetByJob(Guid jobId)
    {
        // Verify caller is the employer for this job (by EmployerId or EmployerName fallback)
        var job = _db.Jobs.Find(jobId);
        if (job == null) return NotFound();

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var userName = User.FindFirst("name")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

        var callerIsEmployer = false;
        if (Guid.TryParse(userId, out var guid) && job.EmployerId.HasValue && job.EmployerId.Value == guid) callerIsEmployer = true;
        if (!callerIsEmployer && !string.IsNullOrEmpty(userName) && job.EmployerName == userName) callerIsEmployer = true;

        if (!callerIsEmployer) return Forbid();

        // Join application with user and return applicant info
        var list = _db.Applications
            .Where(a => a.JobId == jobId)
            .Join(_db.Users,
                  a => a.CandidateId,
                  u => u.Id,
                  (a, u) => new { a, u })
            .Select(au => new {
                id = au.a.Id,
                jobId = au.a.JobId,
                candidateId = au.a.CandidateId,
                candidateName = au.u.Name,
                candidateEmail = au.u.Email,
                appliedDate = au.a.AppliedAt,
                status = au.a.Status.ToString(),
                resumePath = au.a.ResumePath
            })
            .ToList();

        return Ok(list);
    }

    [Authorize]
    [HttpGet("my")]
    public IActionResult GetMyApplications()
    {
        // Try multiple claim names for the user id (sub or nameidentifier) since JWT claim mapping can differ
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                     ?? User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (!Guid.TryParse(userId, out var guid)) return Unauthorized();

        var list = _db.Applications
            .Where(a => a.CandidateId == guid)
            .Join(_db.Jobs,
                  a => a.JobId,
                  j => j.Id,
                  (a, j) => new {
                      id = a.Id,
                      jobId = a.JobId,
                      jobTitle = j.Title,
                      jobLocation = j.Location,
                      employerName = j.EmployerName,
                      appliedDate = a.AppliedAt,
                      status = a.Status.ToString(),
                      resumePath = a.ResumePath,
                      candidateId = a.CandidateId
                  })
            .ToList();

        return Ok(list);
    }

    [Authorize]
    [HttpPut("{applicationId}/status")]
    public IActionResult UpdateStatus(Guid applicationId, [FromBody] string status)
    {
        var app = _db.Applications.Find(applicationId);
        if (app == null) return NotFound();

        var job = _db.Jobs.Find(app.JobId);
        if (job == null) return NotFound();

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst("name")?.Value;
        var callerIsEmployer = false;
        if (Guid.TryParse(userId, out var guid) && job.EmployerId.HasValue && job.EmployerId.Value == guid) callerIsEmployer = true;
        if (!callerIsEmployer && !string.IsNullOrEmpty(userName) && job.EmployerName == userName) callerIsEmployer = true;

        if (!callerIsEmployer) return Forbid();

        if (!Enum.TryParse<ApplicationStatus>(status, true, out var parsed)) return BadRequest(new { message = "Invalid status" });

        app.Status = parsed;
        _db.SaveChanges();
        return Ok(new { message = "Status updated", status = app.Status.ToString() });
    }

    // Debug helper - returns the Authorization header and current user claims (do not expose in production)
    [AllowAnonymous]
    [HttpGet("my-debug")]
    public IActionResult GetMyApplicationsDebug()
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        var isAuth = User?.Identity?.IsAuthenticated ?? false;
        var claims = User?.Claims?.Select(c => (object)new { c.Type, c.Value }).ToList() ?? new List<object>();
        return Ok(new { authHeader, isAuth, claims });
    }
}
