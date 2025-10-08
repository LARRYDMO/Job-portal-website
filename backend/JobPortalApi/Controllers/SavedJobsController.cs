using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/saved-jobs")]
public class SavedJobsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SavedJobsController(AppDbContext db) { _db = db; }

    [Authorize]
    [HttpPost("toggle/{jobId}")]
    public IActionResult Toggle(Guid jobId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var guid)) return Unauthorized();

        var existing = _db.SavedJobs.FirstOrDefault(s => s.JobId == jobId && s.UserId == guid);
        if (existing != null)
        {
            _db.SavedJobs.Remove(existing);
            _db.SaveChanges();
            return Ok(new { saved = false });
        }

        var saved = new SavedJob { Id = Guid.NewGuid(), JobId = jobId, UserId = guid };
        _db.SavedJobs.Add(saved);
        _db.SaveChanges();
        return Ok(new { saved = true });
    }

    [Authorize]
    [HttpGet("mine")]
    public IActionResult Mine()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var guid)) return Unauthorized();

        var list = _db.SavedJobs.Where(s => s.UserId == guid)
            .Join(_db.Jobs, s => s.JobId, j => j.Id, (s, j) => new { s.Id, job = j, savedAt = s.SavedAt })
            .ToList();

        return Ok(list);
    }
}
