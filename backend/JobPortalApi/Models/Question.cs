using System.ComponentModel.DataAnnotations;

public class Question
{
    [Key]
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public string Text { get; set; } = string.Empty;
    // type: e.g., "mcq" or "text"
    public string Type { get; set; } = "text";
    // for MCQ, store options as JSON or comma-separated
    public string? Options { get; set; }
}
