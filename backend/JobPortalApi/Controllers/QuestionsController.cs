using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/questions")]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<QuestionsController> _logger;
    public QuestionsController(AppDbContext db, ILogger<QuestionsController> logger) { _db = db; _logger = logger; }

    [Authorize]
    [HttpPost("job/{jobId}")]
    public IActionResult CreateForJob(Guid jobId, [FromBody] CreateQuestionDto dto)
    {
        var job = _db.Jobs.Find(jobId);
        if (job == null) return NotFound();
        // Log incoming request details for debugging
        try { _logger.LogInformation("POST /api/questions/job/{jobId} called. Bound question DTO present: {hasDto}", jobId, dto != null); } catch {}

        if (!ModelState.IsValid)
        {
            try { _logger.LogWarning("ModelState invalid: {errors}", string.Join(";", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))); } catch {}
            return BadRequest(ModelState);
        }

        // Only employer can add questions. If a job has no owner (seeded), allow the first
        // authenticated employer who posts a question to claim ownership for local/dev usage.
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var userName = User.FindFirst("name")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var callerIsEmployer = false;
        if (Guid.TryParse(userId, out var guid))
        {
            if (job.EmployerId.HasValue)
            {
                if (job.EmployerId.Value == guid) callerIsEmployer = true;
            }
            else
            {
                // Claim ownerless job for this employer (local/dev convenience)
                job.EmployerId = guid;
                if (string.IsNullOrEmpty(job.EmployerName) && !string.IsNullOrEmpty(userName)) job.EmployerName = userName;
                _db.SaveChanges();
                callerIsEmployer = true;
            }
        }

        if (!callerIsEmployer && !string.IsNullOrEmpty(userName) && job.EmployerName == userName) callerIsEmployer = true;
        if (!callerIsEmployer)
        {
            try { _logger.LogWarning("User {userId} ({userName}) attempted to add question to job {jobId} but is not owner.", userId, userName, jobId); } catch {}
            return Forbid();
        }

        var q = new Question {
            Id = Guid.NewGuid(),
            JobId = jobId,
            Text = dto.Text!,
            Type = dto.Type ?? "text",
            Options = dto.Options,
        };

        _db.Questions.Add(q);
        _db.SaveChanges();
        try { _logger.LogInformation("Question {qId} created for job {jobId} by user {userId}", q.Id, jobId, userId); } catch {}
        return Ok(q);
    }

    [AllowAnonymous]
    [HttpGet("job/{jobId}")]
    public IActionResult GetForJob(Guid jobId)
    {
        var list = _db.Questions.Where(q => q.JobId == jobId).ToList();
        return Ok(list);
    }

    // Provide a curated list of common questions employers can pick from when creating a job.
    // These are not stored by this endpoint; the frontend should POST selected questions
    // using the existing POST /api/questions/job/{jobId} endpoint.
    [AllowAnonymous]
    [HttpGet("common")]
    public IActionResult GetCommonQuestions()
    {
        // Ensure Options is consistently typed as string? across all anonymous objects
        var common = new[] {
            new { Text = "Describe your relevant experience.", Type = "text", Options = (string?)null },
            new { Text = "Why are you interested in this role?", Type = "text", Options = (string?)null },
            new { Text = "What is your notice period?", Type = "text", Options = (string?)null },
            new { Text = "What is your expected salary range?", Type = "text", Options = (string?)null },
            new { Text = "Do you have experience with [specific technology]?", Type = "text", Options = (string?)null },
            new { Text = "Are you legally authorized to work in this country?", Type = "mcq", Options = (string?)("Yes,No") },
            new { Text = "Are you willing to relocate?", Type = "mcq", Options = (string?)("Yes,No") },
            new { Text = "Have you managed/led teams before?", Type = "mcq", Options = (string?)("Yes,No") },
            new { Text = "Please provide a link to your portfolio or GitHub.", Type = "text", Options = (string?)null },
            new { Text = "How many years of experience do you have in this field?", Type = "mcq", Options = (string?)("0-1,1-3,3-5,5+") },
            new { Text = "Have you previously worked in a remote-first role?", Type = "mcq", Options = (string?)("Yes,No") },
            new { Text = "Describe a challenging project you worked on and your role.", Type = "text", Options = (string?)null },
            new { Text = "What relevant certifications or training do you have?", Type = "text", Options = (string?)null },
            new { Text = "What are your top 3 technical strengths?", Type = "text", Options = (string?)null },
            new { Text = "How soon can you start?", Type = "mcq", Options = (string?)("Immediately,2 weeks,1 month,More than 1 month") },
        };

        return Ok(common);
    }
}
