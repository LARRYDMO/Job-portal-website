using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public static class AuthService
{
    public static string HashPassword(string password)
    {
        // Very simple hash for demo - DO NOT use in production
        return Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(password)));
    }

    public static string GenerateToken(User user, IConfiguration config)
    {
    var key = config["Jwt:Key"] ?? "dev_secret_key_change_in_production_make_it_longer_please!";
        var issuer = config["Jwt:Issuer"] ?? "jobportal";

        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim("name", user.Name),
            new Claim("role", user.Role),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: null,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
