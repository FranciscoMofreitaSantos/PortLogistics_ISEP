namespace SEM5_PI_WEBAPI.Domain.Tasks;

public class CreatingTaskDto
{
    public string? StartTime { get; set; }
    public string? Description { get; set; }
    public TaskType Type { get; set; }

    public CreatingTaskDto(string? startTime, string? description, TaskType type)
    {
        StartTime = startTime;
        Description = description;
        Type = type;
    }
}