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
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
}
