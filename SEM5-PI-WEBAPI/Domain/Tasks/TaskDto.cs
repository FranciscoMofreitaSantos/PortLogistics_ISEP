namespace SEM5_PI_WEBAPI.Domain.Tasks;

public class TaskDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? Description { get; set; }
    public TaskType Type { get; set; }
    public TaskStatus Status { get; set; }

    public TaskDto(Guid id, string code, DateTime? startTime, DateTime? endTime, string? description, TaskType type,
        TaskStatus status)
    {
        Id = id;
        Code = code;
        StartTime = startTime;
        EndTime = endTime;
        Description = description;
        Type = type;
        Status = status;
    }
}