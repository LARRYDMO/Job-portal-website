using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authentication;

public class RegisterModel : PageModel
{
    private readonly AppDbContext _db;
    public RegisterModel(AppDbContext db)
    {
        _db = db;
    }

    [BindProperty]
    public InputModel Input { get; set; } = new InputModel();
    public string? Error { get; set; }

    public void OnGet() { }

    public IActionResult OnPost()
    {
        if (_db.Users.Any(u => u.Email == Input.Email))
        {
            Error = "Email already exists";
            return Page();
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = Input.Name,
            Email = Input.Email,
            PasswordHash = AuthService.HashPassword(Input.Password),
            Role = Input.Role,
            CompanyName = Input.Role == "Employer" ? Input.CompanyName : null
        };

        _db.Users.Add(user);
        _db.SaveChanges();

        // sign in using a cookie
        var claims = new[] {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, user.Name),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role),
            new System.Security.Claims.Claim("companyName", user.CompanyName ?? string.Empty)
        };
        var identity = new System.Security.Claims.ClaimsIdentity(claims, "Cookies");
        var principal = new System.Security.Claims.ClaimsPrincipal(identity);
        HttpContext.SignInAsync("Cookies", principal);

        return RedirectToPage("/Jobs/Index");
    }

    public class InputModel
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Candidate";
        public string? CompanyName { get; set; }
    }
}
