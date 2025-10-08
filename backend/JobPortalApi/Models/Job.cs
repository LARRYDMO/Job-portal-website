using System.ComponentModel.DataAnnotations;

public class Job
{
    [Key]
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string EmployerName { get; set; } = string.Empty;
    // Optional link to the employer user (set when a logged-in employer creates a job)
    public Guid? EmployerId { get; set; }
    // New fields
    public string? SalaryRange { get; set; }
    public string? JobType { get; set; } // Full-time, Part-time, Contract
    public string? WorkMode { get; set; } // Onsite, Remote, Hybrid
    public string? Skills { get; set; } // comma-separated tags
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
}
