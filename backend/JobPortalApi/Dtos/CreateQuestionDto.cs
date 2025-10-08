using System.ComponentModel.DataAnnotations;

public class CreateQuestionDto
{
    [Required]
    public string Text { get; set; } = string.Empty;

    // optional: "text" or "mcq"
    public string Type { get; set; } = "text";

    // comma-separated options for mcq
    public string? Options { get; set; }
}
