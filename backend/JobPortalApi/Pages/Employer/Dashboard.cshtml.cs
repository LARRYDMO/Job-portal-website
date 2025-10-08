using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

[Authorize(AuthenticationSchemes = "Cookies")]
public class EmployerDashboardModel : PageModel
{
    private readonly AppDbContext _db;
    public EmployerDashboardModel(AppDbContext db)
    {
        _db = db;
    }

    public List<Job> Jobs { get; set; } = new();
    public string? CompanyName { get; set; }

    public void OnGet()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var guid))
        {
            Jobs = new List<Job>();
            return;
        }
        var user = _db.Users.Find(guid);
        CompanyName = user?.CompanyName;

        if (user == null)
        {
            Jobs = new List<Job>();
            return;
        }

        Jobs = _db.Jobs.Where(j => j.EmployerId == user.Id || j.EmployerName == user.Name).OrderByDescending(j => j.PostedDate).ToList();
    }
}
