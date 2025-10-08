using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto dto)
    {
        if (_db.Users.Any(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already exists" });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = AuthService.HashPassword(dto.Password),
            Role = dto.Role
        };

        _db.Users.Add(user);
        _db.SaveChanges();

        var token = AuthService.GenerateToken(user, _config);

        return Ok(new { token, user = new { id = user.Id, name = user.Name, email = user.Email, role = user.Role } });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        var hash = AuthService.HashPassword(dto.Password);
        var user = _db.Users.FirstOrDefault(u => u.Email == dto.Email && u.PasswordHash == hash);
        if (user == null) return Unauthorized(new { message = "Invalid credentials" });

        var token = AuthService.GenerateToken(user, _config);
        return Ok(new { token, user = new { id = user.Id, name = user.Name, email = user.Email, role = user.Role } });
    }
}
