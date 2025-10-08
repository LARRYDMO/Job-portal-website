using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // simple hash for demo
    public string Role { get; set; } = "Candidate"; // Candidate or Employer
}
