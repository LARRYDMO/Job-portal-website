using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

public class JobsIndexModel : PageModel
{
    private readonly AppDbContext _db;
    public JobsIndexModel(AppDbContext db)
    {
        _db = db;
    }

    public List<Job> Jobs { get; set; } = new();
    [BindProperty(SupportsGet = true)]
    public string? Search { get; set; }
    [BindProperty(SupportsGet = true)]
    public string? Location { get; set; }
    [BindProperty(SupportsGet = true)]
    public string? JobType { get; set; }
    [BindProperty(SupportsGet = true)]
    public string? WorkMode { get; set; }
    [BindProperty(SupportsGet = true, Name = "pageNumber")]
    public int PageNumber { get; set; } = 1;

    public bool HasMore { get; set; }

    public void OnGet()
    {
        var q = _db.Jobs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(Search)) q = q.Where(j => j.Title.Contains(Search) || j.Description.Contains(Search));
        if (!string.IsNullOrWhiteSpace(Location)) q = q.Where(j => j.Location.Contains(Location));
        if (!string.IsNullOrWhiteSpace(JobType)) q = q.Where(j => j.JobType == JobType);
        if (!string.IsNullOrWhiteSpace(WorkMode)) q = q.Where(j => j.WorkMode == WorkMode);

    var pageSize = 10;
    var total = q.Count();
    Jobs = q.OrderByDescending(j => j.PostedDate).Skip((PageNumber - 1) * pageSize).Take(pageSize).ToList();
    HasMore = PageNumber * pageSize < total;
    }
}
