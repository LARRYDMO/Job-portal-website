public record RegisterDto(string Name, string Email, string Password, string Role, string? CompanyName = null);
public record LoginDto(string Email, string Password);
