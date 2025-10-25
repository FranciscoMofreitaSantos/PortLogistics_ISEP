namespace SEM5_PI_WEBAPI.Domain.Tasks;

public class TaskMapper
{
    public static TaskDto ToDto(EntityTask task)
    {
        return new TaskDto(
            task.Id.AsGuid(),
            task.Code.Value,
            task.StartTime,
            task.EndTime,
            task.Description,
            task.Type,
            task.Status
        );
    }

    public static List<TaskDto> ToDtoList(IReadOnlyCollection<EntityTask> tasks)
    {
        return tasks
            .Select(ToDto)
            .ToList();
    }
}