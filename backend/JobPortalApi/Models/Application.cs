using System.ComponentModel.DataAnnotations;

public class Application
{
    [Key]
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Guid CandidateId { get; set; }
    public string ResumePath { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
}
