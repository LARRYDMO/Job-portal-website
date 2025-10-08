using System.ComponentModel.DataAnnotations;

public class Application
{
    [Key]
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Guid CandidateId { get; set; }
    public string ResumePath { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
}

public enum ApplicationStatus
{
    Applied = 0,
    InReview = 1,
    Interview = 2,
    Offer = 3,
    Rejected = 4,
    Accepted = 5
}
