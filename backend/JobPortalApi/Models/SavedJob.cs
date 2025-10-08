using System.ComponentModel.DataAnnotations;

public class SavedJob
{
    [Key]
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid JobId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
