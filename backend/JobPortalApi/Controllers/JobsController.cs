using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _db;

    public JobsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult GetAll([FromQuery] string? search, [FromQuery] string? location, [FromQuery] string? jobType, [FromQuery] string? workMode, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = _db.Jobs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(j => j.Title.Contains(search) || j.Description.Contains(search));
        if (!string.IsNullOrWhiteSpace(location)) q = q.Where(j => j.Location.Contains(location));
        if (!string.IsNullOrWhiteSpace(jobType)) q = q.Where(j => j.JobType == jobType);
        if (!string.IsNullOrWhiteSpace(workMode)) q = q.Where(j => j.WorkMode == workMode);

        var total = q.Count();

        var list = q.OrderByDescending(j => j.PostedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new {
                id = j.Id,
                title = j.Title,
                description = j.Description,
                location = j.Location,
                employerName = j.EmployerName,
                postedDate = j.PostedDate,
                employerId = j.EmployerId,
                salaryRange = j.SalaryRange,
                jobType = j.JobType,
                workMode = j.WorkMode,
                skills = j.Skills,
                applicantCount = _db.Applications.Count(a => a.JobId == j.Id)
            })
            .ToList();

        return Ok(new { total, page, pageSize, data = list });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(Guid id)
    {
        var job = _db.Jobs.Find(id);
        if (job == null) return NotFound();
        return Ok(job);
    }

    [Authorize]
    [HttpPost]
    public IActionResult Create([FromBody] Job job)
    {
        job.Id = Guid.NewGuid();
        job.PostedDate = DateTime.UtcNow;

        // try to set EmployerId and EmployerName from authenticated user claims if available
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (Guid.TryParse(userId, out var guid)) job.EmployerId = guid;
        if (string.IsNullOrEmpty(job.EmployerName))
        {
            var name = User.FindFirst("name")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (!string.IsNullOrEmpty(name)) job.EmployerName = name;
        }

        _db.Jobs.Add(job);
        _db.SaveChanges();
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [Authorize]
    [HttpPut("{id}")]
    public IActionResult Update(Guid id, [FromBody] Job updated)
    {
        var job = _db.Jobs.Find(id);
        if (job == null) return NotFound();
        job.Title = updated.Title;
        job.Description = updated.Description;
        job.Location = updated.Location;
        job.EmployerName = updated.EmployerName;
        job.SalaryRange = updated.SalaryRange;
        job.JobType = updated.JobType;
        job.WorkMode = updated.WorkMode;
        job.Skills = updated.Skills;
        _db.SaveChanges();
        return Ok(job);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        var job = _db.Jobs.Find(id);
        if (job == null) return NotFound();
        _db.Jobs.Remove(job);
        _db.SaveChanges();
        return NoContent();
    }
}
