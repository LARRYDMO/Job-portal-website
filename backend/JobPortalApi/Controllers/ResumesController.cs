using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/resumes")]
public class ResumesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    public ResumesController(AppDbContext db, IWebHostEnvironment env) { _db = db; _env = env; }

    [Authorize]
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var guid)) return Unauthorized();

        if (file == null || file.Length == 0) return BadRequest(new { message = "File required" });

        var uploads = Path.Combine(_env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploads, fileName);
        using (var stream = System.IO.File.Create(filePath)) await file.CopyToAsync(stream);

        var resume = new Resume { Id = Guid.NewGuid(), UserId = guid, FileName = file.FileName, FilePath = fileName };
        _db.Resumes.Add(resume);
        _db.SaveChanges();

        return Ok(resume);
    }

    [Authorize]
    [HttpGet("mine")]
    public IActionResult Mine()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var guid)) return Unauthorized();

        var list = _db.Resumes.Where(r => r.UserId == guid).ToList();
        return Ok(list);
    }
}
