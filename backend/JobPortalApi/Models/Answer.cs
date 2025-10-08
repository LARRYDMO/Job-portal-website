using System.ComponentModel.DataAnnotations;

public class Answer
{
    [Key]
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public Guid CandidateId { get; set; }
    public string Response { get; set; } = string.Empty;
}
